import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The exact source code used during deployment (must match bytecode exactly)
const SOURCES: Record<string, { source: string; contractName: string }> = {
  InvestorPositionToken: {
    contractName: "InvestorPositionToken",
    source: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
contract InvestorPositionToken {
    string public name; string public symbol; uint8 public constant decimals = 6;
    uint256 public totalSupply; mapping(address => uint256) public balanceOf; mapping(address => mapping(address => uint256)) public allowance;
    address public admin; address public minter; mapping(address => bool) public whitelisted; bool public whitelistEnabled = true;
    event Transfer(address indexed from, address indexed to, uint256 value); event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed account, bool status); event MinterUpdated(address indexed newMinter); event WhitelistToggled(bool enabled); event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    modifier onlyAdmin() { require(msg.sender == admin, "IPT: not admin"); _; }
    modifier onlyMinter() { require(msg.sender == minter, "IPT: not minter"); _; }
    constructor(string memory _name, string memory _symbol, address _admin) { require(_admin != address(0), "IPT: zero admin"); name = _name; symbol = _symbol; admin = _admin; }
    function setMinter(address _minter) external onlyAdmin { minter = _minter; emit MinterUpdated(_minter); }
    function setWhitelist(address account, bool status) external onlyAdmin { whitelisted[account] = status; emit Whitelisted(account, status); }
    function batchWhitelist(address[] calldata accounts, bool status) external onlyAdmin { for (uint256 i = 0; i < accounts.length; i++) { whitelisted[accounts[i]] = status; emit Whitelisted(accounts[i], status); } }
    function toggleWhitelist(bool enabled) external onlyAdmin { whitelistEnabled = enabled; emit WhitelistToggled(enabled); }
    function transferAdmin(address newAdmin) external onlyAdmin { require(newAdmin != address(0), "IPT: zero admin"); emit AdminTransferred(admin, newAdmin); admin = newAdmin; }
    function mint(address to, uint256 amount) external onlyMinter { require(to != address(0), "IPT: mint to zero"); _checkWhitelist(to); totalSupply += amount; balanceOf[to] += amount; emit Transfer(address(0), to, amount); }
    function burn(address from, uint256 amount) external onlyMinter { require(balanceOf[from] >= amount, "IPT: burn exceeds balance"); balanceOf[from] -= amount; totalSupply -= amount; emit Transfer(from, address(0), amount); }
    function transfer(address to, uint256 amount) external returns (bool) { _transfer(msg.sender, to, amount); return true; }
    function approve(address spender, uint256 amount) external returns (bool) { allowance[msg.sender][spender] = amount; emit Approval(msg.sender, spender, amount); return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) { uint256 a = allowance[from][msg.sender]; require(a >= amount, "IPT: insufficient allowance"); allowance[from][msg.sender] = a - amount; _transfer(from, to, amount); return true; }
    function _transfer(address from, address to, uint256 amount) internal { require(from != address(0) && to != address(0), "IPT: zero addr"); _checkWhitelist(to); require(balanceOf[from] >= amount, "IPT: insufficient balance"); balanceOf[from] -= amount; balanceOf[to] += amount; emit Transfer(from, to, amount); }
    function _checkWhitelist(address account) internal view { if (whitelistEnabled) { require(whitelisted[account], "IPT: not whitelisted"); } }
}`,
  },

  OracleAdapter: {
    contractName: "OracleAdapter",
    source: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
contract OracleAdapter {
    enum EventType { PAYMENT_RECEIVED, PAYMENT_CONFIRMED, MILESTONE_VERIFIED, SENSOR_ALERT, THRESHOLD_BREACH, DISBURSEMENT_TRIGGERED, COMPLIANCE_CHECK }
    enum EventStatus { PENDING, CONFIRMED, FAILED }
    struct OracleEvent { uint256 id; EventType eventType; EventStatus status; string source; string title; uint256 amount; string currency; uint256 timestamp; bytes32 dataHash; string metadata; }
    struct SensorConfig { string deviceId; string metric; int256 thresholdMin; int256 thresholdMax; string location; bool active; }
    address public admin; address public spvVault; mapping(address => bool) public authorizedReporters;
    OracleEvent[] public events; uint256 public eventCount; mapping(string => SensorConfig) public sensors; string[] public sensorIds;
    mapping(bytes32 => bool) public processedPayments; uint256 public totalPaymentsConfirmed; uint256 public totalPaymentVolume;
    event OracleEventSubmitted(uint256 indexed eventId, EventType eventType, string source, uint256 amount); event OracleEventConfirmed(uint256 indexed eventId);
    event PaymentConfirmed(bytes32 indexed txHash, uint256 amount, string currency, string source); event SensorReading(string indexed deviceId, string metric, int256 value, uint256 timestamp);
    event ThresholdBreach(string indexed deviceId, string metric, int256 value, int256 threshold); event ReporterAuthorized(address indexed reporter, bool status);
    event SensorConfigured(string indexed deviceId, string metric); event VaultLinked(address indexed vault); event OracleEventFailed(uint256 indexed eventId, string reason);
    modifier onlyAdmin() { require(msg.sender == admin, "Oracle: not admin"); _; }
    modifier onlyReporter() { require(authorizedReporters[msg.sender] || msg.sender == admin, "Oracle: not reporter"); _; }
    constructor(address _admin) { require(_admin != address(0), "Oracle: zero admin"); admin = _admin; authorizedReporters[_admin] = true; }
    function setReporter(address reporter, bool authorized) external onlyAdmin { authorizedReporters[reporter] = authorized; emit ReporterAuthorized(reporter, authorized); }
    function setVault(address _vault) external onlyAdmin { spvVault = _vault; emit VaultLinked(_vault); }
    function configureSensor(string calldata deviceId, string calldata metric, int256 thresholdMin, int256 thresholdMax, string calldata location) external onlyAdmin { if (!sensors[deviceId].active) { sensorIds.push(deviceId); } sensors[deviceId] = SensorConfig(deviceId, metric, thresholdMin, thresholdMax, location, true); emit SensorConfigured(deviceId, metric); }
    function submitPaymentConfirmation(bytes32 txHash, uint256 amount, string calldata currency, string calldata source, string calldata metadata) external onlyReporter { require(!processedPayments[txHash], "Oracle: already processed"); processedPayments[txHash] = true; totalPaymentsConfirmed++; totalPaymentVolume += amount; uint256 eid = events.length; events.push(OracleEvent(eid, EventType.PAYMENT_CONFIRMED, EventStatus.CONFIRMED, source, "Payment Confirmed", amount, currency, block.timestamp, txHash, metadata)); eventCount++; emit PaymentConfirmed(txHash, amount, currency, source); emit OracleEventSubmitted(eid, EventType.PAYMENT_CONFIRMED, source, amount); emit OracleEventConfirmed(eid); }
    function submitSensorReading(string calldata deviceId, int256 value, string calldata metadata) external onlyReporter { SensorConfig storage s = sensors[deviceId]; require(s.active, "Oracle: not configured"); emit SensorReading(deviceId, s.metric, value, block.timestamp); bool b = value < s.thresholdMin || value > s.thresholdMax; EventType et = b ? EventType.THRESHOLD_BREACH : EventType.SENSOR_ALERT; uint256 eid = events.length; events.push(OracleEvent(eid, et, EventStatus.CONFIRMED, deviceId, b ? "Threshold Breach" : "Sensor Reading", uint256(value >= 0 ? value : -value), s.metric, block.timestamp, keccak256(abi.encodePacked(deviceId, value, block.timestamp)), metadata)); eventCount++; emit OracleEventSubmitted(eid, et, deviceId, 0); if (b) { emit ThresholdBreach(deviceId, s.metric, value, value < s.thresholdMin ? s.thresholdMin : s.thresholdMax); } }
    function submitEvent(EventType eventType, string calldata source, string calldata title, uint256 amount, string calldata currency, bytes32 dataHash, string calldata metadata) external onlyReporter { uint256 eid = events.length; events.push(OracleEvent(eid, eventType, EventStatus.PENDING, source, title, amount, currency, block.timestamp, dataHash, metadata)); eventCount++; emit OracleEventSubmitted(eid, eventType, source, amount); }
    function confirmEvent(uint256 eid) external onlyAdmin { require(eid < events.length && events[eid].status == EventStatus.PENDING, "Oracle: invalid"); events[eid].status = EventStatus.CONFIRMED; emit OracleEventConfirmed(eid); }
    function failEvent(uint256 eid, string calldata reason) external onlyAdmin { require(eid < events.length && events[eid].status == EventStatus.PENDING, "Oracle: invalid"); events[eid].status = EventStatus.FAILED; emit OracleEventFailed(eid, reason); }
    function getEvent(uint256 eid) external view returns (OracleEvent memory) { return events[eid]; }
    function getSensorCount() external view returns (uint256) { return sensorIds.length; }
    function transferAdmin(address newAdmin) external onlyAdmin { require(newAdmin != address(0), "Oracle: zero"); admin = newAdmin; }
}`,
  },

  SPVVault: {
    contractName: "SPVVault",
    source: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
interface IERC20 { function transfer(address to, uint256 amount) external returns (bool); function transferFrom(address from, address to, uint256 amount) external returns (bool); function balanceOf(address account) external view returns (uint256); }
interface IPositionToken { function mint(address to, uint256 amount) external; function burn(address from, uint256 amount) external; function totalSupply() external view returns (uint256); function balanceOf(address account) external view returns (uint256); }
contract SPVVault {
    string public spvName; address public admin; address public manager; IERC20 public usdc; IPositionToken public positionToken;
    uint256 public totalDeposited; uint256 public totalDisbursed; uint256 public targetAmount; bool public fundingOpen; bool public matured;
    struct Milestone { string name; uint256 amount; address recipient; bool disbursed; bool oracleApproved; string oracleTrigger; }
    Milestone[] public milestones; mapping(address => uint256) public investorDeposits; address[] public investors; mapping(address => bool) private isInvestor; address public distributionWaterfall;
    event Deposited(address indexed investor, uint256 amount, uint256 tokensMinted); event Withdrawn(address indexed investor, uint256 amount, uint256 tokensBurned);
    event MilestoneAdded(uint256 indexed index, string name, uint256 amount); event MilestoneApproved(uint256 indexed index); event MilestoneDisbursed(uint256 indexed index, address recipient, uint256 amount);
    event FundingStatusChanged(bool open); event Matured(); event DistributionWaterfallSet(address indexed waterfall); event ManagerUpdated(address indexed newManager); event AdminTransferred(address indexed newAdmin);
    modifier onlyAdmin() { require(msg.sender == admin, "Vault: not admin"); _; }
    modifier onlyManager() { require(msg.sender == manager || msg.sender == admin, "Vault: not manager"); _; }
    constructor(string memory _name, address _admin, address _usdc, address _positionToken, uint256 _targetAmount) { require(_admin != address(0) && _usdc != address(0) && _positionToken != address(0), "Vault: zero addr"); spvName = _name; admin = _admin; manager = _admin; usdc = IERC20(_usdc); positionToken = IPositionToken(_positionToken); targetAmount = _targetAmount; fundingOpen = true; }
    function deposit(uint256 amount) external { require(fundingOpen && !matured && amount > 0, "Vault: invalid"); require(totalDeposited + amount <= targetAmount, "Vault: exceeds target"); usdc.transferFrom(msg.sender, address(this), amount); if (!isInvestor[msg.sender]) { investors.push(msg.sender); isInvestor[msg.sender] = true; } investorDeposits[msg.sender] += amount; totalDeposited += amount; positionToken.mint(msg.sender, amount); emit Deposited(msg.sender, amount, amount); if (totalDeposited >= targetAmount) { fundingOpen = false; emit FundingStatusChanged(false); } }
    function withdraw(uint256 amount) external { require(!matured && amount > 0, "Vault: invalid"); require(positionToken.balanceOf(msg.sender) >= amount && totalDisbursed == 0, "Vault: cannot withdraw"); positionToken.burn(msg.sender, amount); investorDeposits[msg.sender] -= amount; totalDeposited -= amount; usdc.transfer(msg.sender, amount); emit Withdrawn(msg.sender, amount, amount); }
    function addMilestone(string calldata _name, uint256 _amount, address _recipient, string calldata _oracleTrigger) external onlyManager { milestones.push(Milestone(_name, _amount, _recipient, false, false, _oracleTrigger)); emit MilestoneAdded(milestones.length - 1, _name, _amount); }
    function approveMilestone(uint256 i) external onlyManager { require(i < milestones.length, "Vault: invalid"); milestones[i].oracleApproved = true; emit MilestoneApproved(i); }
    function disburseMilestone(uint256 i) external onlyManager { require(i < milestones.length && !matured, "Vault: invalid"); Milestone storage m = milestones[i]; require(m.oracleApproved && !m.disbursed && usdc.balanceOf(address(this)) >= m.amount, "Vault: cannot disburse"); m.disbursed = true; totalDisbursed += m.amount; usdc.transfer(m.recipient, m.amount); emit MilestoneDisbursed(i, m.recipient, m.amount); }
    function sendToDistribution(uint256 amount) external onlyManager { require(distributionWaterfall != address(0) && usdc.balanceOf(address(this)) >= amount, "Vault: invalid"); usdc.transfer(distributionWaterfall, amount); }
    function setFundingOpen(bool _open) external onlyAdmin { fundingOpen = _open; emit FundingStatusChanged(_open); }
    function setDistributionWaterfall(address _w) external onlyAdmin { distributionWaterfall = _w; emit DistributionWaterfallSet(_w); }
    function setManager(address _m) external onlyAdmin { manager = _m; emit ManagerUpdated(_m); }
    function transferAdmin(address _a) external onlyAdmin { require(_a != address(0), "Vault: zero"); admin = _a; emit AdminTransferred(_a); }
    function setMatured() external onlyAdmin { matured = true; fundingOpen = false; emit Matured(); }
    function getBalance() external view returns (uint256) { return usdc.balanceOf(address(this)); }
    function getInvestorCount() external view returns (uint256) { return investors.length; }
    function getMilestoneCount() external view returns (uint256) { return milestones.length; }
    function remainingCapacity() external view returns (uint256) { return targetAmount > totalDeposited ? targetAmount - totalDeposited : 0; }
}`,
  },

  DistributionWaterfall: {
    contractName: "DistributionWaterfall",
    source: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
interface IERC20 { function transfer(address to, uint256 amount) external returns (bool); function balanceOf(address account) external view returns (uint256); }
interface IPositionToken { function totalSupply() external view returns (uint256); function balanceOf(address account) external view returns (uint256); }
contract DistributionWaterfall {
    struct Distribution { uint256 id; uint256 totalAmount; uint256 timestamp; uint256 snapshotTotalSupply; string distributionType; bool completed; }
    struct ClaimInfo { uint256 amount; bool claimed; }
    address public admin; address public spvVault; IERC20 public usdc; IPositionToken public positionToken;
    uint256 public dsraReserve; uint256 public dsraTarget; uint256 public operatingReserve; uint256 public operatingBudget;
    Distribution[] public distributions; mapping(uint256 => mapping(address => ClaimInfo)) public claims;
    address[] public investors; mapping(address => bool) private isRegistered; uint256 public totalDistributed; uint256 public totalClaimed;
    event DistributionCreated(uint256 indexed id, string distributionType, uint256 totalAmount); event DistributionClaimed(uint256 indexed id, address indexed investor, uint256 amount);
    event OperatingExpensePaid(address indexed recipient, uint256 amount, string description); event DSRAFunded(uint256 amount, uint256 newBalance);
    event InvestorRegistered(address indexed investor); event AdminTransferred(address indexed newAdmin); event VaultLinked(address indexed vault);
    modifier onlyAdmin() { require(msg.sender == admin, "WF: not admin"); _; }
    modifier onlyVaultOrAdmin() { require(msg.sender == spvVault || msg.sender == admin, "WF: not auth"); _; }
    constructor(address _admin, address _usdc, address _positionToken, uint256 _dsraTarget, uint256 _operatingBudget) { require(_admin != address(0) && _usdc != address(0) && _positionToken != address(0), "WF: zero"); admin = _admin; usdc = IERC20(_usdc); positionToken = IPositionToken(_positionToken); dsraTarget = _dsraTarget; operatingBudget = _operatingBudget; }
    function setVault(address _v) external onlyAdmin { spvVault = _v; emit VaultLinked(_v); }
    function registerInvestor(address inv) external onlyVaultOrAdmin { if (!isRegistered[inv]) { investors.push(inv); isRegistered[inv] = true; emit InvestorRegistered(inv); } }
    function executeWaterfall(uint256 opex, address opexTo, string calldata dtype) external onlyAdmin { uint256 avail = usdc.balanceOf(address(this)); require(avail > 0, "WF: no funds"); if (opex > 0 && opexTo != address(0)) { require(opex <= operatingBudget && opex <= avail, "WF: opex invalid"); usdc.transfer(opexTo, opex); operatingReserve += opex; avail -= opex; emit OperatingExpensePaid(opexTo, opex, "Opex"); } if (dsraReserve < dsraTarget && avail > 0) { uint256 need = dsraTarget - dsraReserve; uint256 fund = need < avail ? need : avail; dsraReserve += fund; avail -= fund; emit DSRAFunded(fund, dsraReserve); } if (avail > 0) { _dist(avail, dtype); } }
    function createDistribution(uint256 amt, string calldata dtype) external onlyAdmin { require(usdc.balanceOf(address(this)) >= amt, "WF: no funds"); _dist(amt, dtype); }
    function _dist(uint256 amt, string memory dtype) internal { uint256 sup = positionToken.totalSupply(); require(sup > 0, "WF: no tokens"); uint256 did = distributions.length; distributions.push(Distribution(did, amt, block.timestamp, sup, dtype, false)); uint256 d = 0; for (uint256 i = 0; i < investors.length; i++) { uint256 b = positionToken.balanceOf(investors[i]); if (b > 0) { uint256 sh = (amt * b) / sup; if (sh > 0) { claims[did][investors[i]] = ClaimInfo(sh, false); d += sh; } } } totalDistributed += d; emit DistributionCreated(did, dtype, d); }
    function claim(uint256 did) external { require(did < distributions.length, "WF: invalid"); ClaimInfo storage c = claims[did][msg.sender]; require(c.amount > 0 && !c.claimed, "WF: nothing"); c.claimed = true; totalClaimed += c.amount; usdc.transfer(msg.sender, c.amount); emit DistributionClaimed(did, msg.sender, c.amount); }
    function pushDistribution(uint256 did) external onlyAdmin { require(did < distributions.length && !distributions[did].completed, "WF: invalid"); for (uint256 i = 0; i < investors.length; i++) { ClaimInfo storage c = claims[did][investors[i]]; if (c.amount > 0 && !c.claimed) { c.claimed = true; totalClaimed += c.amount; usdc.transfer(investors[i], c.amount); emit DistributionClaimed(did, investors[i], c.amount); } } distributions[did].completed = true; }
    function getDistributionCount() external view returns (uint256) { return distributions.length; }
    function getClaimable(uint256 did, address inv) external view returns (uint256) { ClaimInfo storage c = claims[did][inv]; return c.claimed ? 0 : c.amount; }
    function getInvestorCount() external view returns (uint256) { return investors.length; }
    function setDSRATarget(uint256 t) external onlyAdmin { dsraTarget = t; }
    function setOperatingBudget(uint256 b) external onlyAdmin { operatingBudget = b; }
    function transferAdmin(address a) external onlyAdmin { require(a != address(0), "WF: zero"); emit AdminTransferred(a); admin = a; }
}`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BASESCAN_API_KEY = Deno.env.get("BASESCAN_API_KEY");
    if (!BASESCAN_API_KEY) throw new Error("BASESCAN_API_KEY not configured");

    const { contract_name, contract_address, network = "testnet" } = await req.json();

    if (!contract_name || !contract_address) {
      throw new Error("contract_name and contract_address required");
    }

    const entry = SOURCES[contract_name];
    if (!entry) throw new Error(`Unknown contract: ${contract_name}`);

    const isMainnet = network === "mainnet";
    const chainId = isMainnet ? 8453 : 84532;
    const apiBase = `https://api.etherscan.io/v2/api?chainid=${chainId}`;
    const explorerBase = isMainnet ? "https://basescan.org" : "https://sepolia.basescan.org";

    // For multi-contract files (SPVVault, DistributionWaterfall), the contractname format matters
    const solFileName = `${contract_name}.sol`;
    const fullContractName = `${solFileName}:${entry.contractName}`;

    console.log(`Verifying ${fullContractName} at ${contract_address} on ${network}`);

    const verifyUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}`;

    const formData = new URLSearchParams({
      apikey: BASESCAN_API_KEY,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: contract_address,
      sourceCode: entry.source,
      codeformat: "solidity-single-file",
      contractname: fullContractName,
      compilerversion: "v0.8.28+commit.7893614a",
      optimizationUsed: "1",
      runs: "200",
      evmversion: "",
      licenseType: "3",
    });

    const resp = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await resp.json();
    console.log("Basescan response:", JSON.stringify(result));

    if (result.status === "1") {
      const guid = result.result;

      // Poll for result (up to 60s)
      let verified = false;
      let statusMsg = "Pending";
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const checkResp = await fetch(
          `${apiBase}?apikey=${BASESCAN_API_KEY}&module=contract&action=checkverifystatus&guid=${guid}`
        );
        const check = await checkResp.json();
        console.log(`Check ${i + 1}:`, JSON.stringify(check));

        if (check.result === "Pass - Verified") {
          verified = true;
          statusMsg = "Verified and Published";
          break;
        } else if (check.result?.includes("Fail")) {
          statusMsg = check.result;
          break;
        }
      }

      return new Response(JSON.stringify({
        success: verified,
        status: statusMsg,
        contract_name,
        contract_address,
        network,
        explorer_url: `${explorerBase}/address/${contract_address}#code`,
        guid,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      const err = result.result || "Unknown error";
      if (err.includes("Already Verified")) {
        return new Response(JSON.stringify({
          success: true,
          status: "Already Verified",
          contract_name,
          contract_address,
          network,
          explorer_url: `${explorerBase}/address/${contract_address}#code`,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        success: false,
        error: `Verification failed: ${err}`,
        contract_name,
        contract_address,
        network,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (e) {
    console.error("verify-suite error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
