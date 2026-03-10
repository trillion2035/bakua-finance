// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title SPVVault
 * @notice Holds investor USDC deposits and manages milestone-gated disbursements.
 *         Mints InvestorPositionTokens on deposit, burns them on withdrawal/maturity.
 * @dev    Integrates with InvestorPositionToken for LP token issuance and
 *         DistributionWaterfall for automated yield distributions.
 */

// Minimal ERC-20 interface for USDC and IPT interactions
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IPositionToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract SPVVault {
    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    string  public spvName;
    address public admin;
    address public manager; // Bakua operations

    IERC20         public usdc;
    IPositionToken public positionToken;

    uint256 public totalDeposited;
    uint256 public totalDisbursed;
    uint256 public targetAmount;    // Funding cap
    bool    public fundingOpen;
    bool    public matured;

    // ──────────────────────────────────────────────
    //  Milestones
    // ──────────────────────────────────────────────
    struct Milestone {
        string  name;
        uint256 amount;
        address recipient;
        bool    disbursed;
        bool    oracleApproved;
        string  oracleTrigger; // e.g. "harvest_confirmed", "payment_received"
    }

    Milestone[] public milestones;

    // ──────────────────────────────────────────────
    //  Investor tracking
    // ──────────────────────────────────────────────
    mapping(address => uint256) public investorDeposits;
    address[] public investors;
    mapping(address => bool) private isInvestor;

    // ──────────────────────────────────────────────
    //  Distribution
    // ──────────────────────────────────────────────
    address public distributionWaterfall;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Deposited(address indexed investor, uint256 amount, uint256 tokensMinted);
    event Withdrawn(address indexed investor, uint256 amount, uint256 tokensBurned);
    event MilestoneAdded(uint256 indexed index, string name, uint256 amount);
    event MilestoneApproved(uint256 indexed index);
    event MilestoneDisbursed(uint256 indexed index, address recipient, uint256 amount);
    event FundingStatusChanged(bool open);
    event Matured();
    event DistributionWaterfallSet(address indexed waterfall);
    event ManagerUpdated(address indexed newManager);
    event AdminTransferred(address indexed newAdmin);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Vault: not admin");
        _;
    }

    modifier onlyManager() {
        require(msg.sender == manager || msg.sender == admin, "Vault: not manager");
        _;
    }

    modifier whenFundingOpen() {
        require(fundingOpen, "Vault: funding closed");
        _;
    }

    modifier notMatured() {
        require(!matured, "Vault: already matured");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(
        string memory _name,
        address _admin,
        address _usdc,
        address _positionToken,
        uint256 _targetAmount
    ) {
        require(_admin != address(0), "Vault: zero admin");
        require(_usdc != address(0), "Vault: zero usdc");
        require(_positionToken != address(0), "Vault: zero token");

        spvName       = _name;
        admin         = _admin;
        manager       = _admin;
        usdc          = IERC20(_usdc);
        positionToken = IPositionToken(_positionToken);
        targetAmount  = _targetAmount;
        fundingOpen   = true;
    }

    // ──────────────────────────────────────────────
    //  Investor Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Deposit USDC into the SPV vault. Receives position tokens 1:1.
     * @param amount USDC amount (6 decimals)
     */
    function deposit(uint256 amount) external whenFundingOpen notMatured {
        require(amount > 0, "Vault: zero amount");
        require(totalDeposited + amount <= targetAmount, "Vault: exceeds target");

        usdc.transferFrom(msg.sender, address(this), amount);

        if (!isInvestor[msg.sender]) {
            investors.push(msg.sender);
            isInvestor[msg.sender] = true;
        }

        investorDeposits[msg.sender] += amount;
        totalDeposited += amount;

        // Mint position tokens 1:1 with USDC deposited
        positionToken.mint(msg.sender, amount);

        emit Deposited(msg.sender, amount, amount);

        // Auto-close funding if target reached
        if (totalDeposited >= targetAmount) {
            fundingOpen = false;
            emit FundingStatusChanged(false);
        }
    }

    /**
     * @notice Withdraw USDC by burning position tokens (only before milestones begin).
     * @param amount Token amount to redeem
     */
    function withdraw(uint256 amount) external notMatured {
        require(amount > 0, "Vault: zero amount");
        require(positionToken.balanceOf(msg.sender) >= amount, "Vault: insufficient tokens");
        require(totalDisbursed == 0, "Vault: disbursements started");

        positionToken.burn(msg.sender, amount);
        investorDeposits[msg.sender] -= amount;
        totalDeposited -= amount;

        usdc.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, amount);
    }

    // ──────────────────────────────────────────────
    //  Milestone Management
    // ──────────────────────────────────────────────

    function addMilestone(
        string calldata _name,
        uint256 _amount,
        address _recipient,
        string calldata _oracleTrigger
    ) external onlyManager {
        milestones.push(Milestone({
            name: _name,
            amount: _amount,
            recipient: _recipient,
            disbursed: false,
            oracleApproved: false,
            oracleTrigger: _oracleTrigger
        }));
        emit MilestoneAdded(milestones.length - 1, _name, _amount);
    }

    /**
     * @notice Called by OracleAdapter when milestone conditions are met.
     */
    function approveMilestone(uint256 index) external onlyManager {
        require(index < milestones.length, "Vault: invalid milestone");
        milestones[index].oracleApproved = true;
        emit MilestoneApproved(index);
    }

    /**
     * @notice Disburse funds for an approved milestone.
     */
    function disburseMilestone(uint256 index) external onlyManager notMatured {
        require(index < milestones.length, "Vault: invalid milestone");
        Milestone storage m = milestones[index];
        require(m.oracleApproved, "Vault: not approved");
        require(!m.disbursed, "Vault: already disbursed");
        require(usdc.balanceOf(address(this)) >= m.amount, "Vault: insufficient funds");

        m.disbursed = true;
        totalDisbursed += m.amount;
        usdc.transfer(m.recipient, m.amount);

        emit MilestoneDisbursed(index, m.recipient, m.amount);
    }

    // ──────────────────────────────────────────────
    //  Distribution
    // ──────────────────────────────────────────────

    /**
     * @notice Transfer USDC to the DistributionWaterfall for pro-rata payouts.
     */
    function sendToDistribution(uint256 amount) external onlyManager {
        require(distributionWaterfall != address(0), "Vault: no waterfall set");
        require(usdc.balanceOf(address(this)) >= amount, "Vault: insufficient funds");
        usdc.transfer(distributionWaterfall, amount);
    }

    // ──────────────────────────────────────────────
    //  Admin Functions
    // ──────────────────────────────────────────────

    function setFundingOpen(bool _open) external onlyAdmin {
        fundingOpen = _open;
        emit FundingStatusChanged(_open);
    }

    function setDistributionWaterfall(address _waterfall) external onlyAdmin {
        distributionWaterfall = _waterfall;
        emit DistributionWaterfallSet(_waterfall);
    }

    function setManager(address _manager) external onlyAdmin {
        manager = _manager;
        emit ManagerUpdated(_manager);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Vault: zero admin");
        admin = _newAdmin;
        emit AdminTransferred(_newAdmin);
    }

    function setMatured() external onlyAdmin {
        matured = true;
        fundingOpen = false;
        emit Matured();
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 index) external view returns (
        string memory _name,
        uint256 _amount,
        address _recipient,
        bool _disbursed,
        bool _oracleApproved
    ) {
        Milestone storage m = milestones[index];
        return (m.name, m.amount, m.recipient, m.disbursed, m.oracleApproved);
    }

    function remainingCapacity() external view returns (uint256) {
        return targetAmount > totalDeposited ? targetAmount - totalDeposited : 0;
    }

    function fundedPercent() external view returns (uint256) {
        if (targetAmount == 0) return 0;
        return (totalDeposited * 10000) / targetAmount; // basis points
    }
}
