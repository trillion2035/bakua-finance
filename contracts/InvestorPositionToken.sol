// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title InvestorPositionToken
 * @notice ERC-20 token representing each investor's proportional claim on SPV cash flows.
 *         Transfer-restricted: only whitelisted (KYC-verified) addresses may hold tokens.
 * @dev    Self-contained ERC-20 implementation (no external imports).
 *         Minted by the SPVVault on deposit, burned on redemption/maturity.
 */
contract InvestorPositionToken {
    // ──────────────────────────────────────────────
    //  ERC-20 Storage
    // ──────────────────────────────────────────────
    string public name;
    string public symbol;
    uint8  public constant decimals = 6; // Match USDC decimals

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ──────────────────────────────────────────────
    //  Access Control
    // ──────────────────────────────────────────────
    address public admin;
    address public minter; // SPVVault contract

    // ──────────────────────────────────────────────
    //  Whitelist (KYC Compliance)
    // ──────────────────────────────────────────────
    mapping(address => bool) public whitelisted;
    bool public whitelistEnabled = true;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed account, bool status);
    event MinterUpdated(address indexed newMinter);
    event WhitelistToggled(bool enabled);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "IPT: not admin");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "IPT: not minter");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(string memory _name, string memory _symbol, address _admin) {
        require(_admin != address(0), "IPT: zero admin");
        name   = _name;
        symbol = _symbol;
        admin  = _admin;
    }

    // ──────────────────────────────────────────────
    //  Admin Functions
    // ──────────────────────────────────────────────
    function setMinter(address _minter) external onlyAdmin {
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function setWhitelist(address account, bool status) external onlyAdmin {
        whitelisted[account] = status;
        emit Whitelisted(account, status);
    }

    function batchWhitelist(address[] calldata accounts, bool status) external onlyAdmin {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelisted[accounts[i]] = status;
            emit Whitelisted(accounts[i], status);
        }
    }

    function toggleWhitelist(bool enabled) external onlyAdmin {
        whitelistEnabled = enabled;
        emit WhitelistToggled(enabled);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "IPT: zero admin");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    // ──────────────────────────────────────────────
    //  Mint / Burn (only SPVVault)
    // ──────────────────────────────────────────────
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "IPT: mint to zero");
        _checkWhitelist(to);
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyMinter {
        require(balanceOf[from] >= amount, "IPT: burn exceeds balance");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    // ──────────────────────────────────────────────
    //  ERC-20 Standard Functions
    // ──────────────────────────────────────────────
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "IPT: insufficient allowance");
        allowance[from][msg.sender] = currentAllowance - amount;
        _transfer(from, to, amount);
        return true;
    }

    // ──────────────────────────────────────────────
    //  Internal
    // ──────────────────────────────────────────────
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "IPT: from zero");
        require(to != address(0), "IPT: to zero");
        _checkWhitelist(to);
        require(balanceOf[from] >= amount, "IPT: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _checkWhitelist(address account) internal view {
        if (whitelistEnabled) {
            require(whitelisted[account], "IPT: not whitelisted");
        }
    }
}
