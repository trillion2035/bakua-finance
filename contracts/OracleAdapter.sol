// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title OracleAdapter
 * @notice Receives and validates IoT sensor data and mobile money payment confirmations
 *         on-chain. Feeds verified data to SPVVault for milestone approvals.
 * @dev    Supports multiple data sources: IoT sensors (temperature, humidity, NDVI),
 *         payment confirmations (MTN MoMo via Yellow Card), and compliance checks.
 */
contract OracleAdapter {
    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────
    enum EventType {
        PAYMENT_RECEIVED,
        PAYMENT_CONFIRMED,
        MILESTONE_VERIFIED,
        SENSOR_ALERT,
        THRESHOLD_BREACH,
        DISBURSEMENT_TRIGGERED,
        COMPLIANCE_CHECK
    }

    enum EventStatus {
        PENDING,
        CONFIRMED,
        FAILED
    }

    struct OracleEvent {
        uint256   id;
        EventType eventType;
        EventStatus status;
        string    source;       // e.g. "mtn_momo", "iot_sensor_01", "yellow_card"
        string    title;
        uint256   amount;       // Payment amount (0 for non-payment events)
        string    currency;     // "XAF", "USDC", etc.
        uint256   timestamp;
        bytes32   dataHash;     // Hash of off-chain data for verification
        string    metadata;     // JSON string with additional details
    }

    struct SensorConfig {
        string  deviceId;
        string  metric;        // "temperature", "humidity", "ndvi"
        int256  thresholdMin;
        int256  thresholdMax;
        string  location;
        bool    active;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    address public admin;
    address public spvVault;

    mapping(address => bool) public authorizedReporters;
    
    OracleEvent[] public events;
    uint256 public eventCount;

    mapping(string => SensorConfig) public sensors; // deviceId => config
    string[] public sensorIds;

    // Payment tracking
    mapping(bytes32 => bool) public processedPayments; // txHash => processed
    uint256 public totalPaymentsConfirmed;
    uint256 public totalPaymentVolume;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event OracleEventSubmitted(uint256 indexed eventId, EventType eventType, string source, uint256 amount);
    event OracleEventConfirmed(uint256 indexed eventId);
    event OracleEventFailed(uint256 indexed eventId, string reason);
    event PaymentConfirmed(bytes32 indexed txHash, uint256 amount, string currency, string source);
    event SensorReading(string indexed deviceId, string metric, int256 value, uint256 timestamp);
    event ThresholdBreach(string indexed deviceId, string metric, int256 value, int256 threshold);
    event ReporterAuthorized(address indexed reporter, bool status);
    event SensorConfigured(string indexed deviceId, string metric);
    event VaultLinked(address indexed vault);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Oracle: not admin");
        _;
    }

    modifier onlyReporter() {
        require(authorizedReporters[msg.sender] || msg.sender == admin, "Oracle: not reporter");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address _admin) {
        require(_admin != address(0), "Oracle: zero admin");
        admin = _admin;
        authorizedReporters[_admin] = true;
    }

    // ──────────────────────────────────────────────
    //  Reporter Management
    // ──────────────────────────────────────────────
    function setReporter(address reporter, bool authorized) external onlyAdmin {
        authorizedReporters[reporter] = authorized;
        emit ReporterAuthorized(reporter, authorized);
    }

    function setVault(address _vault) external onlyAdmin {
        spvVault = _vault;
        emit VaultLinked(_vault);
    }

    // ──────────────────────────────────────────────
    //  Sensor Configuration
    // ──────────────────────────────────────────────
    function configureSensor(
        string calldata deviceId,
        string calldata metric,
        int256 thresholdMin,
        int256 thresholdMax,
        string calldata location
    ) external onlyAdmin {
        if (!sensors[deviceId].active) {
            sensorIds.push(deviceId);
        }
        sensors[deviceId] = SensorConfig({
            deviceId: deviceId,
            metric: metric,
            thresholdMin: thresholdMin,
            thresholdMax: thresholdMax,
            location: location,
            active: true
        });
        emit SensorConfigured(deviceId, metric);
    }

    // ──────────────────────────────────────────────
    //  Data Submission
    // ──────────────────────────────────────────────

    /**
     * @notice Submit a mobile money payment confirmation.
     * @param txHash Unique transaction hash from payment provider
     * @param amount Payment amount in local currency units
     * @param currency Currency code (e.g. "XAF")
     * @param source Payment source (e.g. "mtn_momo", "yellow_card")
     * @param metadata JSON string with additional payment details
     */
    function submitPaymentConfirmation(
        bytes32 txHash,
        uint256 amount,
        string calldata currency,
        string calldata source,
        string calldata metadata
    ) external onlyReporter {
        require(!processedPayments[txHash], "Oracle: payment already processed");

        processedPayments[txHash] = true;
        totalPaymentsConfirmed++;
        totalPaymentVolume += amount;

        uint256 eventId = events.length;
        events.push(OracleEvent({
            id: eventId,
            eventType: EventType.PAYMENT_CONFIRMED,
            status: EventStatus.CONFIRMED,
            source: source,
            title: "Payment Confirmed",
            amount: amount,
            currency: currency,
            timestamp: block.timestamp,
            dataHash: txHash,
            metadata: metadata
        }));
        eventCount++;

        emit PaymentConfirmed(txHash, amount, currency, source);
        emit OracleEventSubmitted(eventId, EventType.PAYMENT_CONFIRMED, source, amount);
        emit OracleEventConfirmed(eventId);
    }

    /**
     * @notice Submit an IoT sensor reading.
     */
    function submitSensorReading(
        string calldata deviceId,
        int256 value,
        string calldata metadata
    ) external onlyReporter {
        SensorConfig storage sensor = sensors[deviceId];
        require(sensor.active, "Oracle: sensor not configured");

        emit SensorReading(deviceId, sensor.metric, value, block.timestamp);

        // Check thresholds
        bool breached = value < sensor.thresholdMin || value > sensor.thresholdMax;
        EventType evtType = breached ? EventType.THRESHOLD_BREACH : EventType.SENSOR_ALERT;
        EventStatus evtStatus = EventStatus.CONFIRMED;

        uint256 eventId = events.length;
        events.push(OracleEvent({
            id: eventId,
            eventType: evtType,
            status: evtStatus,
            source: deviceId,
            title: breached ? "Threshold Breach" : "Sensor Reading",
            amount: uint256(value >= 0 ? value : -value),
            currency: sensor.metric,
            timestamp: block.timestamp,
            dataHash: keccak256(abi.encodePacked(deviceId, value, block.timestamp)),
            metadata: metadata
        }));
        eventCount++;

        emit OracleEventSubmitted(eventId, evtType, deviceId, 0);

        if (breached) {
            int256 threshold = value < sensor.thresholdMin ? sensor.thresholdMin : sensor.thresholdMax;
            emit ThresholdBreach(deviceId, sensor.metric, value, threshold);
        }
    }

    /**
     * @notice Submit a generic oracle event (milestone verification, compliance, etc.).
     */
    function submitEvent(
        EventType eventType,
        string calldata source,
        string calldata title,
        uint256 amount,
        string calldata currency,
        bytes32 dataHash,
        string calldata metadata
    ) external onlyReporter {
        uint256 eventId = events.length;
        events.push(OracleEvent({
            id: eventId,
            eventType: eventType,
            status: EventStatus.PENDING,
            source: source,
            title: title,
            amount: amount,
            currency: currency,
            timestamp: block.timestamp,
            dataHash: dataHash,
            metadata: metadata
        }));
        eventCount++;

        emit OracleEventSubmitted(eventId, eventType, source, amount);
    }

    /**
     * @notice Admin confirms a pending event.
     */
    function confirmEvent(uint256 eventId) external onlyAdmin {
        require(eventId < events.length, "Oracle: invalid event");
        require(events[eventId].status == EventStatus.PENDING, "Oracle: not pending");
        events[eventId].status = EventStatus.CONFIRMED;
        emit OracleEventConfirmed(eventId);
    }

    /**
     * @notice Admin marks an event as failed.
     */
    function failEvent(uint256 eventId, string calldata reason) external onlyAdmin {
        require(eventId < events.length, "Oracle: invalid event");
        require(events[eventId].status == EventStatus.PENDING, "Oracle: not pending");
        events[eventId].status = EventStatus.FAILED;
        emit OracleEventFailed(eventId, reason);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getEvent(uint256 eventId) external view returns (OracleEvent memory) {
        require(eventId < events.length, "Oracle: invalid event");
        return events[eventId];
    }

    function getSensorCount() external view returns (uint256) {
        return sensorIds.length;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Oracle: zero admin");
        admin = newAdmin;
    }
}
