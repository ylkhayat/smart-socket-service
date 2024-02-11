import { InstanceData, instancesData, serverData } from "../../store";

export type StopReport = {
    success: boolean;
    statusCode: number;
    triggeredPowerOff?: boolean;
    message: string;
    instanceId?: string;
    instance?: InstanceData;
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
            statusCode: 404,
            message: `Instance with ID ${id} does not exist.`,
        };
    }

    if (instancesData[id].stopTimestamp && !(instancesData[id].isEmergencyStopped || instancesData[id].isManuallyStopped)) {
        return {
            success: false,
            statusCode: 409,
            message: `Instance with ID ${id} is already stopped.`,
        };
    }


    serverData.instancesTriggeringPowerOff.push(id);
    instancesData[id].stopTimestamp = new Date();

    let report: StopReport = {
        statusCode: 200,
        success: true,
        message: `Instance with ID ${id} stopped successfully.`,
        triggeredPowerOff: false,
        instanceId: id,
    };

    /**
     * If the instance running is the last one, trigger a power off.
     */
    if (
        serverData.runningInstances.length === 1 &&
        serverData.runningInstances[0] === id
    ) {
        serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
            instanceId: id,
            timestamp: new Date(),
        };
        report.triggeredPowerOff = true;
        instancesData[id].powerOffTimestamp = new Date();
    }

    serverData.runningInstances = serverData.runningInstances.filter(
        (instanceId) => instanceId !== id,
    );

    if (instancesData[id].emergencyStopTimeout) {
        serverData.runningInstancesWithEmergencyStop =
            serverData.runningInstancesWithEmergencyStop.filter(
                (instanceId) => instanceId !== id,
            );
    }

    report.instance = instancesData[id];

    return report;
};
