import { instancesData, serverData } from "../../store";

type OperationReport = {
    stoppedInstances?: string[];
    message: string;
};

/**
 * Stop all instances due to manual turn off, stops the socket and updates server-wide data accordingly.
 */
export const manualStop = (): OperationReport => {
    serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
        instanceId: "<manual>",
        timestamp: new Date(),
    };

    let report: OperationReport = {
        message: `All instances stopped successfully.`,
        stoppedInstances: [],
    };

    for (const instanceId of serverData.runningInstances) {
        if (instancesData[instanceId].stopTimestamp) continue;
        instancesData[instanceId].stopTimestamp = new Date();
        instancesData[instanceId].powerOffTimestamp = new Date();
        instancesData[instanceId].isManuallyStopped = true;
        report.stoppedInstances?.push(instanceId);
    }

    serverData.runningInstances = serverData.runningInstances.filter(
        (instanceId) => !report.stoppedInstances?.includes(instanceId),
    );

    return report;
};
