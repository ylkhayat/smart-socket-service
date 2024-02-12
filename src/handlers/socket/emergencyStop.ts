import { waitForEventEmitterPowerData } from "../../events/eventEmitter";
import { instancesData, serverData } from "../../store";
import { stopInstance } from "../instance/stopInstance";
import { stopSocket } from "./control";

type OperationReport = {
    success: boolean;
    stoppedInstances?: string[];
    instanceId?: string;
    message: string;
    statusCode: number;
};

/**
 * Stops all instances, stops the socket and updates server-wide data accordingly.
 * @param {string} id - identifier for the instance that triggered the emergency stop.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const emergencyStop = async (id?: string): Promise<OperationReport> => {
    if (id && !instancesData[id]) {
        return {
            success: false,
            statusCode: 404,
            message: `Instance with ID ${id} does not exist.`,
        };
    }

    if (serverData.powerStatus[serverData.powerStatus.length - 1].powerOff) {
        return {
            success: true,
            statusCode: 200,
            message: `Socket is already stopped.`,
        };
    } else {
        serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
            instanceId: `${id + " "}<emergency>`,
            timestamp: new Date(),
        };
    }

    stopSocket();
    const powerData = await waitForEventEmitterPowerData();
    if (!powerData || powerData === "ON") {
        return {
            success: false,
            statusCode: 500,
            message: "An error occurred while emergency stopping the socket",
        };
    }

    let report: OperationReport = {
        success: true,
        statusCode: 200,
        message: `All instances stopped successfully.`,
        stoppedInstances: [],
        instanceId: id,
    };

    for (const instanceId of serverData.runningInstances) {
        if (instancesData[instanceId].stopTimestamp) continue;
        const { success } = await stopInstance(instanceId, true);
        if (success) {
            report.stoppedInstances?.push(instanceId);
        }
    }
    return report;
};
