import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Contract Source Code (inlined from contracts/ folder) ───

const InvestorPositionTokenSource = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract InvestorPositionToken {
    string public name;
    string public symbol;
    uint8  public constant decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    address public admin;
    address public minter;
    mapping(address => bool) public whitelisted;
    bool public whitelistEnabled = true;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed account, bool status);
    event MinterUpdated(address indexed newMinter);
    event WhitelistToggled(bool enabled);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() { require(msg.sender == admin, "IPT: not admin"); _; }
    modifier onlyMinter() { require(msg.sender == minter, "IPT: not minter"); _; }

    constructor(string memory _name, string memory _symbol, address _admin) {
        require(_admin != address(0), "IPT: zero admin");
        name = _name; symbol = _symbol; admin = _admin;
    }

    function setMinter(address _minter) external onlyAdmin { minter = _minter; emit MinterUpdated(_minter); }
    function setWhitelist(address account, bool status) external onlyAdmin { whitelisted[account] = status; emit Whitelisted(account, status); }
    function batchWhitelist(address[] calldata accounts, bool status) external onlyAdmin {
        for (uint256 i = 0; i < accounts.length; i++) { whitelisted[accounts[i]] = status; emit Whitelisted(accounts[i], status); }
    }
    function toggleWhitelist(bool enabled) external onlyAdmin { whitelistEnabled = enabled; emit WhitelistToggled(enabled); }
    function transferAdmin(address newAdmin) external onlyAdmin { require(newAdmin != address(0), "IPT: zero admin"); emit AdminTransferred(admin, newAdmin); admin = newAdmin; }

    function mint(address to, uint256 amount) external onlyMinter { require(to != address(0), "IPT: mint to zero"); _checkWhitelist(to); totalSupply += amount; balanceOf[to] += amount; emit Transfer(address(0), to, amount); }
    function burn(address from, uint256 amount) external onlyMinter { require(balanceOf[from] >= amount, "IPT: burn exceeds balance"); balanceOf[from] -= amount; totalSupply -= amount; emit Transfer(from, address(0), amount); }

    function transfer(address to, uint256 amount) external returns (bool) { _transfer(msg.sender, to, amount); return true; }
    function approve(address spender, uint256 amount) external returns (bool) { allowance[msg.sender][spender] = amount; emit Approval(msg.sender, spender, amount); return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) { uint256 a = allowance[from][msg.sender]; require(a >= amount, "IPT: insufficient allowance"); allowance[from][msg.sender] = a - amount; _transfer(from, to, amount); return true; }

    function _transfer(address from, address to, uint256 amount) internal { require(from != address(0) && to != address(0), "IPT: zero addr"); _checkWhitelist(to); require(balanceOf[from] >= amount, "IPT: insufficient balance"); balanceOf[from] -= amount; balanceOf[to] += amount; emit Transfer(from, to, amount); }
    function _checkWhitelist(address account) internal view { if (whitelistEnabled) { require(whitelisted[account], "IPT: not whitelisted"); } }
}`;

const OracleAdapterSource = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract OracleAdapter {
    enum EventType { PAYMENT_RECEIVED, PAYMENT_CONFIRMED, MILESTONE_VERIFIED, SENSOR_ALERT, THRESHOLD_BREACH, DISBURSEMENT_TRIGGERED, COMPLIANCE_CHECK }
    enum EventStatus { PENDING, CONFIRMED, FAILED }

    struct OracleEvent { uint256 id; EventType eventType; EventStatus status; string source; string title; uint256 amount; string currency; uint256 timestamp; bytes32 dataHash; string metadata; }
    struct SensorConfig { string deviceId; string metric; int256 thresholdMin; int256 thresholdMax; string location; bool active; }

    address public admin;
    address public spvVault;
    mapping(address => bool) public authorizedReporters;
    OracleEvent[] public events;
    uint256 public eventCount;
    mapping(string => SensorConfig) public sensors;
    string[] public sensorIds;
    mapping(bytes32 => bool) public processedPayments;
    uint256 public totalPaymentsConfirmed;
    uint256 public totalPaymentVolume;

    event OracleEventSubmitted(uint256 indexed eventId, EventType eventType, string source, uint256 amount);
    event OracleEventConfirmed(uint256 indexed eventId);
    event OracleEventFailed(uint256 indexed eventId, string reason);
    event PaymentConfirmed(bytes32 indexed txHash, uint256 amount, string currency, string source);
    event SensorReading(string indexed deviceId, string metric, int256 value, uint256 timestamp);
    event ThresholdBreach(string indexed deviceId, string metric, int256 value, int256 threshold);
    event ReporterAuthorized(address indexed reporter, bool status);
    event SensorConfigured(string indexed deviceId, string metric);
    event VaultLinked(address indexed vault);

    modifier onlyAdmin() { require(msg.sender == admin, "Oracle: not admin"); _; }
    modifier onlyReporter() { require(authorizedReporters[msg.sender] || msg.sender == admin, "Oracle: not reporter"); _; }

    constructor(address _admin) { require(_admin != address(0), "Oracle: zero admin"); admin = _admin; authorizedReporters[_admin] = true; }

    function setReporter(address reporter, bool authorized) external onlyAdmin { authorizedReporters[reporter] = authorized; emit ReporterAuthorized(reporter, authorized); }
    function setVault(address _vault) external onlyAdmin { spvVault = _vault; emit VaultLinked(_vault); }

    function configureSensor(string calldata deviceId, string calldata metric, int256 thresholdMin, int256 thresholdMax, string calldata location) external onlyAdmin {
        if (!sensors[deviceId].active) { sensorIds.push(deviceId); }
        sensors[deviceId] = SensorConfig({ deviceId: deviceId, metric: metric, thresholdMin: thresholdMin, thresholdMax: thresholdMax, location: location, active: true });
        emit SensorConfigured(deviceId, metric);
    }

    function submitPaymentConfirmation(bytes32 txHash, uint256 amount, string calldata currency, string calldata source, string calldata metadata) external onlyReporter {
        require(!processedPayments[txHash], "Oracle: payment already processed");
        processedPayments[txHash] = true; totalPaymentsConfirmed++; totalPaymentVolume += amount;
        uint256 eventId = events.length;
        events.push(OracleEvent({ id: eventId, eventType: EventType.PAYMENT_CONFIRMED, status: EventStatus.CONFIRMED, source: source, title: "Payment Confirmed", amount: amount, currency: currency, timestamp: block.timestamp, dataHash: txHash, metadata: metadata }));
        eventCount++;
        emit PaymentConfirmed(txHash, amount, currency, source);
        emit OracleEventSubmitted(eventId, EventType.PAYMENT_CONFIRMED, source, amount);
        emit OracleEventConfirmed(eventId);
    }

    function submitSensorReading(string calldata deviceId, int256 value, string calldata metadata) external onlyReporter {
        SensorConfig storage sensor = sensors[deviceId]; require(sensor.active, "Oracle: sensor not configured");
        emit SensorReading(deviceId, sensor.metric, value, block.timestamp);
        bool breached = value < sensor.thresholdMin || value > sensor.thresholdMax;
        EventType evtType = breached ? EventType.THRESHOLD_BREACH : EventType.SENSOR_ALERT;
        uint256 eventId = events.length;
        events.push(OracleEvent({ id: eventId, eventType: evtType, status: EventStatus.CONFIRMED, source: deviceId, title: breached ? "Threshold Breach" : "Sensor Reading", amount: uint256(value >= 0 ? value : -value), currency: sensor.metric, timestamp: block.timestamp, dataHash: keccak256(abi.encodePacked(deviceId, value, block.timestamp)), metadata: metadata }));
        eventCount++;
        emit OracleEventSubmitted(eventId, evtType, deviceId, 0);
        if (breached) { int256 threshold = value < sensor.thresholdMin ? sensor.thresholdMin : sensor.thresholdMax; emit ThresholdBreach(deviceId, sensor.metric, value, threshold); }
    }

    function submitEvent(EventType eventType, string calldata source, string calldata title, uint256 amount, string calldata currency, bytes32 dataHash, string calldata metadata) external onlyReporter {
        uint256 eventId = events.length;
        events.push(OracleEvent({ id: eventId, eventType: eventType, status: EventStatus.PENDING, source: source, title: title, amount: amount, currency: currency, timestamp: block.timestamp, dataHash: dataHash, metadata: metadata }));
        eventCount++;
        emit OracleEventSubmitted(eventId, eventType, source, amount);
    }

    function confirmEvent(uint256 eventId) external onlyAdmin { require(eventId < events.length, "Oracle: invalid event"); require(events[eventId].status == EventStatus.PENDING, "Oracle: not pending"); events[eventId].status = EventStatus.CONFIRMED; emit OracleEventConfirmed(eventId); }
    function failEvent(uint256 eventId, string calldata reason) external onlyAdmin { require(eventId < events.length, "Oracle: invalid event"); require(events[eventId].status == EventStatus.PENDING, "Oracle: not pending"); events[eventId].status = EventStatus.FAILED; emit OracleEventFailed(eventId, reason); }
    function getEvent(uint256 eventId) external view returns (OracleEvent memory) { require(eventId < events.length, "Oracle: invalid event"); return events[eventId]; }
    function getSensorCount() external view returns (uint256) { return sensorIds.length; }
    function transferAdmin(address newAdmin) external onlyAdmin { require(newAdmin != address(0), "Oracle: zero admin"); admin = newAdmin; }
}`;

const SPVVaultSource = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IERC20 { function transfer(address to, uint256 amount) external returns (bool); function transferFrom(address from, address to, uint256 amount) external returns (bool); function balanceOf(address account) external view returns (uint256); function decimals() external view returns (uint8); }
interface IPositionToken { function mint(address to, uint256 amount) external; function burn(address from, uint256 amount) external; function totalSupply() external view returns (uint256); function balanceOf(address account) external view returns (uint256); }

contract SPVVault {
    string public spvName; address public admin; address public manager;
    IERC20 public usdc; IPositionToken public positionToken;
    uint256 public totalDeposited; uint256 public totalDisbursed; uint256 public targetAmount; bool public fundingOpen; bool public matured;

    struct Milestone { string name; uint256 amount; address recipient; bool disbursed; bool oracleApproved; string oracleTrigger; }
    Milestone[] public milestones;
    mapping(address => uint256) public investorDeposits; address[] public investors; mapping(address => bool) private isInvestor;
    address public distributionWaterfall;

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

    modifier onlyAdmin() { require(msg.sender == admin, "Vault: not admin"); _; }
    modifier onlyManager() { require(msg.sender == manager || msg.sender == admin, "Vault: not manager"); _; }
    modifier whenFundingOpen() { require(fundingOpen, "Vault: funding closed"); _; }
    modifier notMatured() { require(!matured, "Vault: already matured"); _; }

    constructor(string memory _name, address _admin, address _usdc, address _positionToken, uint256 _targetAmount) {
        require(_admin != address(0), "Vault: zero admin"); require(_usdc != address(0), "Vault: zero usdc"); require(_positionToken != address(0), "Vault: zero token");
        spvName = _name; admin = _admin; manager = _admin; usdc = IERC20(_usdc); positionToken = IPositionToken(_positionToken); targetAmount = _targetAmount; fundingOpen = true;
    }

    function deposit(uint256 amount) external whenFundingOpen notMatured {
        require(amount > 0, "Vault: zero amount"); require(totalDeposited + amount <= targetAmount, "Vault: exceeds target");
        usdc.transferFrom(msg.sender, address(this), amount);
        if (!isInvestor[msg.sender]) { investors.push(msg.sender); isInvestor[msg.sender] = true; }
        investorDeposits[msg.sender] += amount; totalDeposited += amount;
        positionToken.mint(msg.sender, amount);
        emit Deposited(msg.sender, amount, amount);
        if (totalDeposited >= targetAmount) { fundingOpen = false; emit FundingStatusChanged(false); }
    }

    function withdraw(uint256 amount) external notMatured {
        require(amount > 0, "Vault: zero amount"); require(positionToken.balanceOf(msg.sender) >= amount, "Vault: insufficient tokens"); require(totalDisbursed == 0, "Vault: disbursements started");
        positionToken.burn(msg.sender, amount); investorDeposits[msg.sender] -= amount; totalDeposited -= amount;
        usdc.transfer(msg.sender, amount); emit Withdrawn(msg.sender, amount, amount);
    }

    function addMilestone(string calldata _name, uint256 _amount, address _recipient, string calldata _oracleTrigger) external onlyManager {
        milestones.push(Milestone({ name: _name, amount: _amount, recipient: _recipient, disbursed: false, oracleApproved: false, oracleTrigger: _oracleTrigger }));
        emit MilestoneAdded(milestones.length - 1, _name, _amount);
    }
    function approveMilestone(uint256 index) external onlyManager { require(index < milestones.length, "Vault: invalid milestone"); milestones[index].oracleApproved = true; emit MilestoneApproved(index); }
    function disburseMilestone(uint256 index) external onlyManager notMatured {
        require(index < milestones.length, "Vault: invalid milestone"); Milestone storage m = milestones[index];
        require(m.oracleApproved, "Vault: not approved"); require(!m.disbursed, "Vault: already disbursed"); require(usdc.balanceOf(address(this)) >= m.amount, "Vault: insufficient funds");
        m.disbursed = true; totalDisbursed += m.amount; usdc.transfer(m.recipient, m.amount); emit MilestoneDisbursed(index, m.recipient, m.amount);
    }
    function sendToDistribution(uint256 amount) external onlyManager { require(distributionWaterfall != address(0), "Vault: no waterfall set"); require(usdc.balanceOf(address(this)) >= amount, "Vault: insufficient funds"); usdc.transfer(distributionWaterfall, amount); }

    function setFundingOpen(bool _open) external onlyAdmin { fundingOpen = _open; emit FundingStatusChanged(_open); }
    function setDistributionWaterfall(address _waterfall) external onlyAdmin { distributionWaterfall = _waterfall; emit DistributionWaterfallSet(_waterfall); }
    function setManager(address _manager) external onlyAdmin { manager = _manager; emit ManagerUpdated(_manager); }
    function transferAdmin(address _newAdmin) external onlyAdmin { require(_newAdmin != address(0), "Vault: zero admin"); admin = _newAdmin; emit AdminTransferred(_newAdmin); }
    function setMatured() external onlyAdmin { matured = true; fundingOpen = false; emit Matured(); }

    function getBalance() external view returns (uint256) { return usdc.balanceOf(address(this)); }
    function getInvestorCount() external view returns (uint256) { return investors.length; }
    function getMilestoneCount() external view returns (uint256) { return milestones.length; }
    function getMilestone(uint256 index) external view returns (string memory _name, uint256 _amount, address _recipient, bool _disbursed, bool _oracleApproved) { Milestone storage m = milestones[index]; return (m.name, m.amount, m.recipient, m.disbursed, m.oracleApproved); }
    function remainingCapacity() external view returns (uint256) { return targetAmount > totalDeposited ? targetAmount - totalDeposited : 0; }
    function fundedPercent() external view returns (uint256) { if (targetAmount == 0) return 0; return (totalDeposited * 10000) / targetAmount; }
}`;

const DistributionWaterfallSource = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IERC20 { function transfer(address to, uint256 amount) external returns (bool); function transferFrom(address from, address to, uint256 amount) external returns (bool); function balanceOf(address account) external view returns (uint256); }
interface IPositionToken { function totalSupply() external view returns (uint256); function balanceOf(address account) external view returns (uint256); }

contract DistributionWaterfall {
    struct Distribution { uint256 id; uint256 totalAmount; uint256 timestamp; uint256 snapshotTotalSupply; string distributionType; bool completed; }
    struct ClaimInfo { uint256 amount; bool claimed; }

    address public admin; address public spvVault;
    IERC20 public usdc; IPositionToken public positionToken;
    uint256 public dsraReserve; uint256 public dsraTarget; uint256 public operatingReserve; uint256 public operatingBudget;
    Distribution[] public distributions;
    mapping(uint256 => mapping(address => ClaimInfo)) public claims;
    address[] public investors; mapping(address => bool) private isRegistered;
    uint256 public totalDistributed; uint256 public totalClaimed;

    event DistributionCreated(uint256 indexed id, string distributionType, uint256 totalAmount);
    event DistributionClaimed(uint256 indexed id, address indexed investor, uint256 amount);
    event OperatingExpensePaid(address indexed recipient, uint256 amount, string description);
    event DSRAFunded(uint256 amount, uint256 newBalance);
    event InvestorRegistered(address indexed investor);
    event AdminTransferred(address indexed newAdmin);
    event VaultLinked(address indexed vault);

    modifier onlyAdmin() { require(msg.sender == admin, "Waterfall: not admin"); _; }
    modifier onlyVaultOrAdmin() { require(msg.sender == spvVault || msg.sender == admin, "Waterfall: not authorized"); _; }

    constructor(address _admin, address _usdc, address _positionToken, uint256 _dsraTarget, uint256 _operatingBudget) {
        require(_admin != address(0), "Waterfall: zero admin"); require(_usdc != address(0), "Waterfall: zero usdc"); require(_positionToken != address(0), "Waterfall: zero token");
        admin = _admin; usdc = IERC20(_usdc); positionToken = IPositionToken(_positionToken); dsraTarget = _dsraTarget; operatingBudget = _operatingBudget;
    }

    function setVault(address _vault) external onlyAdmin { spvVault = _vault; emit VaultLinked(_vault); }
    function registerInvestor(address investor) external onlyVaultOrAdmin { if (!isRegistered[investor]) { investors.push(investor); isRegistered[investor] = true; emit InvestorRegistered(investor); } }
    function batchRegisterInvestors(address[] calldata _investors) external onlyAdmin { for (uint256 i = 0; i < _investors.length; i++) { if (!isRegistered[_investors[i]]) { investors.push(_investors[i]); isRegistered[_investors[i]] = true; emit InvestorRegistered(_investors[i]); } } }

    function executeWaterfall(uint256 opexAmount, address opexRecipient, string calldata distributionType) external onlyAdmin {
        uint256 available = usdc.balanceOf(address(this)); require(available > 0, "Waterfall: no funds");
        if (opexAmount > 0 && opexRecipient != address(0)) { require(opexAmount <= operatingBudget, "Waterfall: exceeds budget"); require(opexAmount <= available, "Waterfall: insufficient for opex"); usdc.transfer(opexRecipient, opexAmount); operatingReserve += opexAmount; available -= opexAmount; emit OperatingExpensePaid(opexRecipient, opexAmount, "Operating expenses"); }
        if (dsraReserve < dsraTarget && available > 0) { uint256 dsraNeeded = dsraTarget - dsraReserve; uint256 dsraFunding = dsraNeeded < available ? dsraNeeded : available; dsraReserve += dsraFunding; available -= dsraFunding; emit DSRAFunded(dsraFunding, dsraReserve); }
        if (available > 0) { _createDistribution(available, distributionType); }
    }

    function createDistribution(uint256 amount, string calldata distributionType) external onlyAdmin { require(usdc.balanceOf(address(this)) >= amount, "Waterfall: insufficient funds"); _createDistribution(amount, distributionType); }

    function _createDistribution(uint256 amount, string memory distributionType) internal {
        uint256 supply = positionToken.totalSupply(); require(supply > 0, "Waterfall: no tokens");
        uint256 distId = distributions.length;
        distributions.push(Distribution({ id: distId, totalAmount: amount, timestamp: block.timestamp, snapshotTotalSupply: supply, distributionType: distributionType, completed: false }));
        uint256 distributed = 0;
        for (uint256 i = 0; i < investors.length; i++) { address investor = investors[i]; uint256 tokenBalance = positionToken.balanceOf(investor); if (tokenBalance > 0) { uint256 share = (amount * tokenBalance) / supply; if (share > 0) { claims[distId][investor] = ClaimInfo({ amount: share, claimed: false }); distributed += share; } } }
        totalDistributed += distributed; emit DistributionCreated(distId, distributionType, distributed);
    }

    function claim(uint256 distributionId) external { require(distributionId < distributions.length, "Waterfall: invalid dist"); ClaimInfo storage c = claims[distributionId][msg.sender]; require(c.amount > 0, "Waterfall: nothing to claim"); require(!c.claimed, "Waterfall: already claimed"); c.claimed = true; totalClaimed += c.amount; usdc.transfer(msg.sender, c.amount); emit DistributionClaimed(distributionId, msg.sender, c.amount); _checkCompletion(distributionId); }

    function pushDistribution(uint256 distributionId) external onlyAdmin {
        require(distributionId < distributions.length, "Waterfall: invalid dist"); Distribution storage dist = distributions[distributionId]; require(!dist.completed, "Waterfall: already completed");
        for (uint256 i = 0; i < investors.length; i++) { ClaimInfo storage c = claims[distributionId][investors[i]]; if (c.amount > 0 && !c.claimed) { c.claimed = true; totalClaimed += c.amount; usdc.transfer(investors[i], c.amount); emit DistributionClaimed(distributionId, investors[i], c.amount); } }
        dist.completed = true;
    }

    function getDistributionCount() external view returns (uint256) { return distributions.length; }
    function getClaimable(uint256 distributionId, address investor) external view returns (uint256) { ClaimInfo storage c = claims[distributionId][investor]; if (c.claimed) return 0; return c.amount; }
    function getInvestorCount() external view returns (uint256) { return investors.length; }
    function getAvailableBalance() external view returns (uint256) { return usdc.balanceOf(address(this)); }
    function _checkCompletion(uint256 distributionId) internal { for (uint256 i = 0; i < investors.length; i++) { ClaimInfo storage c = claims[distributionId][investors[i]]; if (c.amount > 0 && !c.claimed) return; } distributions[distributionId].completed = true; }
    function setDSRATarget(uint256 _target) external onlyAdmin { dsraTarget = _target; }
    function setOperatingBudget(uint256 _budget) external onlyAdmin { operatingBudget = _budget; }
    function transferAdmin(address newAdmin) external onlyAdmin { require(newAdmin != address(0), "Waterfall: zero admin"); emit AdminTransferred(newAdmin); admin = newAdmin; }
}`;

// ─── Helper: compile a single contract ───

function compileSolidity(solc: any, sourceName: string, source: string) {
  const input = JSON.stringify({
    language: "Solidity",
    sources: { [sourceName]: { content: source } },
    settings: {
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      optimizer: { enabled: true, runs: 200 },
    },
  });

  const output = JSON.parse(solc.compile(input));
  const errors = output.errors?.filter((e: any) => e.severity === "error") || [];
  if (errors.length > 0) {
    throw new Error(`Compilation errors in ${sourceName}:\n${errors.map((e: any) => e.formattedMessage).join("\n")}`);
  }

  const contracts = output.contracts?.[sourceName];
  if (!contracts) throw new Error(`No contracts found in ${sourceName}`);

  const contractName = Object.keys(contracts)[0];
  const compiled = contracts[contractName];
  return {
    name: contractName,
    abi: compiled.abi,
    bytecode: "0x" + compiled.evm.bytecode.object,
  };
}

// ─── Helper: deploy a contract ───

async function deployContract(
  ethers: any,
  wallet: any,
  provider: any,
  compiled: { name: string; abi: any; bytecode: string },
  args: any[],
  deployerAddress: string,
) {
  const nonce = await provider.getTransactionCount(deployerAddress, "pending");
  console.log(`Deploying ${compiled.name} with nonce ${nonce}, args: ${JSON.stringify(args)}`);

  const factory = new ethers.ContractFactory(compiled.abi, compiled.bytecode, wallet);
  const deployTx = await factory.deploy(...args, { nonce });

  console.log(`  tx: ${deployTx.deploymentTransaction()?.hash}`);
  await deployTx.waitForDeployment();
  const address = await deployTx.getAddress();
  const txHash = deployTx.deploymentTransaction()?.hash;
  console.log(`  deployed: ${address}`);

  return { address, txHash, abi: compiled.abi };
}

// ─── Main handler ───

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const DEPLOYER_PRIVATE_KEY = Deno.env.get("DEPLOYER_PRIVATE_KEY");
    const BASE_RPC_URL = Deno.env.get("BASE_RPC_URL") || "https://sepolia.base.org";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { network = "testnet" } = await req.json();

    const isMainnet = network === "mainnet";
    const chainId = isMainnet ? 8453 : 84532;
    const networkName = isMainnet ? "Base Mainnet" : "Base Sepolia";

    let rpcUrl: string;
    if (isMainnet) {
      const alchemyKeyMatch = BASE_RPC_URL.match(/\/v2\/(.+)$/);
      rpcUrl = alchemyKeyMatch
        ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKeyMatch[1]}`
        : "https://mainnet.base.org";
    } else {
      rpcUrl = BASE_RPC_URL;
    }

    const USDC = isMainnet
      ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

    const TARGET_AMOUNT = 500_000 * 1e6; // 500k USDC (6 decimals)
    const DSRA_TARGET = 50_000 * 1e6;    // 50k USDC
    const OPEX_BUDGET = 25_000 * 1e6;    // 25k USDC

    console.log(`=== Deploying Bakua Contract Suite to ${networkName} ===`);
    console.log(`RPC: ${rpcUrl}, Chain: ${chainId}, USDC: ${USDC}`);

    // 1. Load solc + ethers
    console.log("Loading solc...");
    const solcModule = await import("https://esm.sh/solc@0.8.28");
    const solc = solcModule.default || solcModule;

    console.log("Loading ethers...");
    const { ethers } = await import("https://esm.sh/ethers@6.13.4");
    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    const deployerAddress = wallet.address;

    const balance = await provider.getBalance(deployerAddress);
    console.log(`Deployer: ${deployerAddress}, Balance: ${ethers.formatEther(balance)} ETH`);
    if (balance === 0n) throw new Error(`Deployer has no ETH on ${networkName}`);

    // 2. Compile all contracts
    console.log("Compiling contracts...");
    const iptCompiled = compileSolidity(solc, "InvestorPositionToken.sol", InvestorPositionTokenSource);
    const oracleCompiled = compileSolidity(solc, "OracleAdapter.sol", OracleAdapterSource);
    const vaultCompiled = compileSolidity(solc, "SPVVault.sol", SPVVaultSource);
    const waterfallCompiled = compileSolidity(solc, "DistributionWaterfall.sol", DistributionWaterfallSource);
    console.log("All 4 contracts compiled successfully");

    // 3. Deploy in order
    // 3a. InvestorPositionToken (no deps)
    const ipt = await deployContract(ethers, wallet, provider, iptCompiled,
      ["Bakua Position Token", "BPT", deployerAddress], deployerAddress);

    // 3b. OracleAdapter (no deps)
    const oracle = await deployContract(ethers, wallet, provider, oracleCompiled,
      [deployerAddress], deployerAddress);

    // 3c. SPVVault (needs USDC + IPT)
    const vault = await deployContract(ethers, wallet, provider, vaultCompiled,
      ["Bakua SPV Vault", deployerAddress, USDC, ipt.address, TARGET_AMOUNT], deployerAddress);

    // 3d. DistributionWaterfall (needs USDC + IPT)
    const waterfall = await deployContract(ethers, wallet, provider, waterfallCompiled,
      [deployerAddress, USDC, ipt.address, DSRA_TARGET, OPEX_BUDGET], deployerAddress);

    console.log("All 4 contracts deployed. Wiring dependencies...");

    // 4. Wire dependencies
    // IPT: set minter to Vault
    const iptContract = new ethers.Contract(ipt.address, ipt.abi, wallet);
    let tx = await iptContract.setMinter(vault.address);
    await tx.wait();
    console.log(`IPT.setMinter(${vault.address}) done`);

    // Oracle: set vault
    const oracleContract = new ethers.Contract(oracle.address, oracle.abi, wallet);
    tx = await oracleContract.setVault(vault.address);
    await tx.wait();
    console.log(`Oracle.setVault(${vault.address}) done`);

    // Waterfall: set vault
    const waterfallContract = new ethers.Contract(waterfall.address, waterfall.abi, wallet);
    tx = await waterfallContract.setVault(vault.address);
    await tx.wait();
    console.log(`Waterfall.setVault(${vault.address}) done`);

    // Vault: set distribution waterfall
    const vaultContract = new ethers.Contract(vault.address, vault.abi, wallet);
    tx = await vaultContract.setDistributionWaterfall(waterfall.address);
    await tx.wait();
    console.log(`Vault.setDistributionWaterfall(${waterfall.address}) done`);

    // IPT: disable whitelist initially for easier testing
    tx = await iptContract.toggleWhitelist(false);
    await tx.wait();
    console.log("IPT whitelist disabled for initial setup");

    console.log("=== All dependencies wired ===");

    const explorerBase = isMainnet ? "https://basescan.org" : "https://sepolia.basescan.org";
    const networkLabel = isMainnet ? "mainnet" : "testnet";

    const result = {
      network: networkName,
      network_label: networkLabel,
      chain_id: chainId,
      deployer: deployerAddress,
      usdc_address: USDC,
      contracts: {
        InvestorPositionToken: { address: ipt.address, tx_hash: ipt.txHash, explorer: `${explorerBase}/address/${ipt.address}` },
        OracleAdapter: { address: oracle.address, tx_hash: oracle.txHash, explorer: `${explorerBase}/address/${oracle.address}` },
        SPVVault: { address: vault.address, tx_hash: vault.txHash, explorer: `${explorerBase}/address/${vault.address}` },
        DistributionWaterfall: { address: waterfall.address, tx_hash: waterfall.txHash, explorer: `${explorerBase}/address/${waterfall.address}` },
      },
    };

    // Store in spv_contracts if an SPV exists
    const { data: spv } = await supabase.from("spvs").select("id").limit(1).single();
    if (spv) {
      const contractRecords = [
        { spv_id: spv.id, name: "InvestorPositionToken", address: ipt.address, deployed_date: new Date().toISOString().split("T")[0], network: networkLabel },
        { spv_id: spv.id, name: "OracleAdapter", address: oracle.address, deployed_date: new Date().toISOString().split("T")[0], network: networkLabel },
        { spv_id: spv.id, name: "SPVVault", address: vault.address, deployed_date: new Date().toISOString().split("T")[0], network: networkLabel },
        { spv_id: spv.id, name: "DistributionWaterfall", address: waterfall.address, deployed_date: new Date().toISOString().split("T")[0], network: networkLabel },
      ];
      await supabase.from("spv_contracts").insert(contractRecords);
      console.log("Contract records saved to database");
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("deploy-contract-suite error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
