import { instancesData, serverData } from "../../store";

type OperationReport = {
    success: boolean;
    stoppedInstances?: string[];
    instanceId?: string;
    message: string;
};

/**
 * Stops all instances, stops the socket and updates server-wide data accordingly.
 * @param {string} id - identifier for the instance that triggered the emergency stop.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const emergencyStop = (id?: string): OperationReport => {
    if (id && !instancesData[id]) {
        return {
            success: false,
            message: `Instance with ID ${id} does not exist.`,
        };
    }

    if (serverData.powerStatus[serverData.powerStatus.length - 1].powerOff) {
        return {
            success: true,
            message: `Socket is already stopped.`,
        };
    } else {
        serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
            instanceId: id || "<unknown>",
            timestamp: new Date(),
        };
    }

    let report: OperationReport = {
        success: true,
        message: `All instances stopped successfully.`,
        stoppedInstances: [],
        instanceId: id,
    };

    for (const instanceId of serverData.runningInstances) {
        if (instancesData[instanceId].stopTimestamp) continue;
        instancesData[instanceId].stopTimestamp = new Date();
        instancesData[instanceId].powerOffTimestamp = new Date();
        instancesData[instanceId].isEmergencyStopped = true;
        report.stoppedInstances?.push(instanceId);
    }

    serverData.runningInstances = serverData.runningInstances.filter(
        (instanceId) => !report.stoppedInstances?.includes(instanceId),
    );

    return report;
};
