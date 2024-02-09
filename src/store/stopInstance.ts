import { instancesData, serverData } from "./dataStore";

export type StopReport = {
    success: boolean;
    isLastEmergencyStop?: boolean;
    triggeredPowerOff?: boolean;
    message: string;
    instanceId?: string;
};

/**
 * Stops a certain instance and updates server-wide data accordingly.
 * @param {string} id - identifier for the instance.
 * @returns {StopReport} An object indicating the operation's report.
 */
export const stopInstance = (id: string): StopReport => {
    if (!instancesData[id]) {
        // Instance already exists, return a failure message
        return {
            success: false,
            message: `Instance with ID ${id} does not exist.`,
        };
    }

    if (instancesData[id].stopTimestamp) {
        return {
            success: false,
            message: `Instance with ID ${id} is already stopped.`,
        };
    }
    if (serverData.powerStatus[serverData.powerStatus.length - 1].powerOff) {
        return {
            success: false,
            message: `Socket is already stopped.`,
        };
    }

    instancesData[id].stopTimestamp = new Date();

    let report: StopReport = {
        success: true,
        message: `Instance with ID ${id} stopped successfully.`,
        triggeredPowerOff: false,
        isLastEmergencyStop: false,
        instanceId: id,
    };

    serverData.runningInstances = serverData.runningInstances.filter(
        (instanceId) => instanceId !== id,
    );

    if (instancesData[id].emergencyStopTimeout) {
        serverData.runningInstancesWithEmergencyStop =
            serverData.runningInstancesWithEmergencyStop.filter(
                (instanceId) => instanceId !== id,
            );
    }

    if (serverData.latestEmergencyStopTimeoutInstanceId === id) {
        serverData.latestEmergencyStopTimeout = null;
        serverData.latestEmergencyStopTimeoutInstanceId = null;

        serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
            instanceId: id,
            timestamp: new Date(),
        };
        report.isLastEmergencyStop = true;
        report.triggeredPowerOff = true;
        instancesData[id].powerOffTimestamp = new Date();
    }

    return report;
};
