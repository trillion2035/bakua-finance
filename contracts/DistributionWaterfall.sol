// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title DistributionWaterfall
 * @notice Executes pro-rata yield and principal distributions to SPV token holders.
 *         Receives USDC from SPVVault and distributes based on InvestorPositionToken balances.
 * @dev    Waterfall priority: (1) Operating expenses, (2) DSRA reserve,
 *         (3) Senior yield, (4) Principal repayment, (5) Residual to equity holders.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IPositionToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract DistributionWaterfall {
    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────
    struct Distribution {
        uint256 id;
        uint256 totalAmount;
        uint256 timestamp;
        uint256 snapshotTotalSupply;
        string  distributionType; // "yield", "principal", "residual"
        bool    completed;
    }

    struct ClaimInfo {
        uint256 amount;
        bool    claimed;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    address public admin;
    address public spvVault;

    IERC20         public usdc;
    IPositionToken public positionToken;

    // Waterfall accounts
    uint256 public dsraReserve;      // Debt Service Reserve Account
    uint256 public dsraTarget;       // Target DSRA balance
    uint256 public operatingReserve;
    uint256 public operatingBudget;  // Max operating expense per period

    // Distribution history
    Distribution[] public distributions;
    // distributionId => investor => claim
    mapping(uint256 => mapping(address => ClaimInfo)) public claims;

    // Investor registry (mirrors vault investors)
    address[] public investors;
    mapping(address => bool) private isRegistered;

    // Totals
    uint256 public totalDistributed;
    uint256 public totalClaimed;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event DistributionCreated(uint256 indexed id, string distributionType, uint256 totalAmount);
    event DistributionClaimed(uint256 indexed id, address indexed investor, uint256 amount);
    event OperatingExpensePaid(address indexed recipient, uint256 amount, string description);
    event DSRAFunded(uint256 amount, uint256 newBalance);
    event InvestorRegistered(address indexed investor);
    event AdminTransferred(address indexed newAdmin);
    event VaultLinked(address indexed vault);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Waterfall: not admin");
        _;
    }

    modifier onlyVaultOrAdmin() {
        require(msg.sender == spvVault || msg.sender == admin, "Waterfall: not authorized");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(
        address _admin,
        address _usdc,
        address _positionToken,
        uint256 _dsraTarget,
        uint256 _operatingBudget
    ) {
        require(_admin != address(0), "Waterfall: zero admin");
        require(_usdc != address(0), "Waterfall: zero usdc");
        require(_positionToken != address(0), "Waterfall: zero token");

        admin           = _admin;
        usdc            = IERC20(_usdc);
        positionToken   = IPositionToken(_positionToken);
        dsraTarget      = _dsraTarget;
        operatingBudget = _operatingBudget;
    }

    // ──────────────────────────────────────────────
    //  Admin Setup
    // ──────────────────────────────────────────────
    function setVault(address _vault) external onlyAdmin {
        spvVault = _vault;
        emit VaultLinked(_vault);
    }

    function registerInvestor(address investor) external onlyVaultOrAdmin {
        if (!isRegistered[investor]) {
            investors.push(investor);
            isRegistered[investor] = true;
            emit InvestorRegistered(investor);
        }
    }

    function batchRegisterInvestors(address[] calldata _investors) external onlyAdmin {
        for (uint256 i = 0; i < _investors.length; i++) {
            if (!isRegistered[_investors[i]]) {
                investors.push(_investors[i]);
                isRegistered[_investors[i]] = true;
                emit InvestorRegistered(_investors[i]);
            }
        }
    }

    // ──────────────────────────────────────────────
    //  Waterfall Execution
    // ──────────────────────────────────────────────

    /**
     * @notice Execute the full waterfall: opex → DSRA → investor distribution.
     * @param opexAmount Operating expenses to deduct first
     * @param opexRecipient Address to receive operating expenses
     * @param distributionType "yield" or "principal" or "residual"
     */
    function executeWaterfall(
        uint256 opexAmount,
        address opexRecipient,
        string calldata distributionType
    ) external onlyAdmin {
        uint256 available = usdc.balanceOf(address(this));
        require(available > 0, "Waterfall: no funds");

        // Step 1: Pay operating expenses
        if (opexAmount > 0 && opexRecipient != address(0)) {
            require(opexAmount <= operatingBudget, "Waterfall: exceeds budget");
            require(opexAmount <= available, "Waterfall: insufficient for opex");
            usdc.transfer(opexRecipient, opexAmount);
            operatingReserve += opexAmount;
            available -= opexAmount;
            emit OperatingExpensePaid(opexRecipient, opexAmount, "Operating expenses");
        }

        // Step 2: Fund DSRA if below target
        if (dsraReserve < dsraTarget && available > 0) {
            uint256 dsraNeeded = dsraTarget - dsraReserve;
            uint256 dsraFunding = dsraNeeded < available ? dsraNeeded : available;
            dsraReserve += dsraFunding;
            available -= dsraFunding;
            emit DSRAFunded(dsraFunding, dsraReserve);
        }

        // Step 3: Distribute remaining to token holders pro-rata
        if (available > 0) {
            _createDistribution(available, distributionType);
        }
    }

    /**
     * @notice Create a simple pro-rata distribution (skip waterfall steps).
     */
    function createDistribution(uint256 amount, string calldata distributionType) external onlyAdmin {
        require(usdc.balanceOf(address(this)) >= amount, "Waterfall: insufficient funds");
        _createDistribution(amount, distributionType);
    }

    function _createDistribution(uint256 amount, string memory distributionType) internal {
        uint256 supply = positionToken.totalSupply();
        require(supply > 0, "Waterfall: no tokens");

        uint256 distId = distributions.length;
        distributions.push(Distribution({
            id: distId,
            totalAmount: amount,
            timestamp: block.timestamp,
            snapshotTotalSupply: supply,
            distributionType: distributionType,
            completed: false
        }));

        // Calculate and store claims for each investor
        uint256 distributed = 0;
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 tokenBalance = positionToken.balanceOf(investor);
            if (tokenBalance > 0) {
                uint256 share = (amount * tokenBalance) / supply;
                if (share > 0) {
                    claims[distId][investor] = ClaimInfo({ amount: share, claimed: false });
                    distributed += share;
                }
            }
        }

        totalDistributed += distributed;
        emit DistributionCreated(distId, distributionType, distributed);
    }

    /**
     * @notice Investor claims their share from a distribution.
     */
    function claim(uint256 distributionId) external {
        require(distributionId < distributions.length, "Waterfall: invalid dist");
        ClaimInfo storage c = claims[distributionId][msg.sender];
        require(c.amount > 0, "Waterfall: nothing to claim");
        require(!c.claimed, "Waterfall: already claimed");

        c.claimed = true;
        totalClaimed += c.amount;
        usdc.transfer(msg.sender, c.amount);

        emit DistributionClaimed(distributionId, msg.sender, c.amount);

        // Check if all claims are done
        _checkCompletion(distributionId);
    }

    /**
     * @notice Auto-distribute to all investors (push model).
     */
    function pushDistribution(uint256 distributionId) external onlyAdmin {
        require(distributionId < distributions.length, "Waterfall: invalid dist");
        Distribution storage dist = distributions[distributionId];
        require(!dist.completed, "Waterfall: already completed");

        for (uint256 i = 0; i < investors.length; i++) {
            ClaimInfo storage c = claims[distributionId][investors[i]];
            if (c.amount > 0 && !c.claimed) {
                c.claimed = true;
                totalClaimed += c.amount;
                usdc.transfer(investors[i], c.amount);
                emit DistributionClaimed(distributionId, investors[i], c.amount);
            }
        }
        dist.completed = true;
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getDistributionCount() external view returns (uint256) {
        return distributions.length;
    }

    function getClaimable(uint256 distributionId, address investor) external view returns (uint256) {
        ClaimInfo storage c = claims[distributionId][investor];
        if (c.claimed) return 0;
        return c.amount;
    }

    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }

    function getAvailableBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    // ──────────────────────────────────────────────
    //  Internal
    // ──────────────────────────────────────────────

    function _checkCompletion(uint256 distributionId) internal {
        for (uint256 i = 0; i < investors.length; i++) {
            ClaimInfo storage c = claims[distributionId][investors[i]];
            if (c.amount > 0 && !c.claimed) return;
        }
        distributions[distributionId].completed = true;
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    function setDSRATarget(uint256 _target) external onlyAdmin {
        dsraTarget = _target;
    }

    function setOperatingBudget(uint256 _budget) external onlyAdmin {
        operatingBudget = _budget;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Waterfall: zero admin");
        emit AdminTransferred(newAdmin);
        admin = newAdmin;
    }
}
