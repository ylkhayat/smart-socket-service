import shortid from "shortid";
import { InstanceData, instancesData, serverData } from "./dataStore";

type OperationReport = {
    success: boolean;
    isLastEmergencyStop?: boolean;
    triggeredPowerOn?: boolean;
    message: string;
    instanceId?: string;
};

/**
 * Initializes a new instance and updates server-wide data accordingly.
 * @param {InstanceData} data - Data for the instance being initialized.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const startInstance = (data: InstanceData): OperationReport => {
    const id = shortid.generate();

    if (instancesData[id]) {
        // Instance already exists, return a failure message
        return {
            success: false,
            message: `Instance with ID ${id} already exists. Initialization aborted.`,
            instanceId: id,
        };
    }

    let report: OperationReport = {
        success: true,
        message: `New instance with ID ${id} initialized successfully.`,
        triggeredPowerOn: false,
        isLastEmergencyStop: false,
        instanceId: id,
    };

    // Proceed with initializing a new instance
    instancesData[id] = data;
    serverData.runningInstances.push(id);
    // Reset energyTodayPerSecond for simplicity; adjust as needed based on your application logic
    serverData.energyTodayPerSecond = 0;
    // Handle emergency stop logic
    if (data.emergencyStopTimeout) {
        serverData.runningInstancesWithEmergencyStop.push(id);
        const emergencyStopDate = new Date(Date.now() + data.emergencyStopTimeout);
        if (
            !serverData.latestEmergencyStopTimeout ||
            serverData.latestEmergencyStopTimeout < emergencyStopDate
        ) {
            serverData.latestEmergencyStopTimeout = emergencyStopDate;
            serverData.latestEmergencyStopTimeoutInstanceId = id;
            report.isLastEmergencyStop = true;
        }
    }

    const lastPowerStatus =
        serverData.powerStatus[serverData.powerStatus.length - 1];
    // Update global timestamps based on the instance data
    if (lastPowerStatus.powerOn === null) {
        serverData.powerStatus[serverData.powerStatus.length - 1] = {
            powerOn: {
                instanceId: id,
                timestamp: data.powerOnTimestamp,
            },
            powerOff: null,
        };
        report.triggeredPowerOn = true;
    }

    if (
        lastPowerStatus.powerOff !== null &&
        lastPowerStatus.powerOff.timestamp < data.powerOnTimestamp
    ) {
        serverData.powerStatus.push({
            powerOn: {
                instanceId: id,
                timestamp: data.powerOnTimestamp,
            },
            powerOff: null,
        });
        report.triggeredPowerOn = true;
    }

    return report;
};
