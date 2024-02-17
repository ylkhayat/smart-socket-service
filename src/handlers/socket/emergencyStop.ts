import { waitForEventEmitterPowerData } from "../../events/eventEmitter";
import { instancesData, serverData } from "../../store";
import { stopInstance } from "../instance/stopInstance";
import { stopSocket } from "./control";

type OperationReport = {
    success: boolean;
    stoppedInstances?: string[];
    message: string;
    statusCode: number;
};

/**
 * Stops all instances, stops the socket and updates server-wide data accordingly.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const emergencyStop = async (): Promise<OperationReport> => {
    if (serverData.powerStatus[serverData.powerStatus.length - 1].powerOff) {
        serverData.isEmergencyStopped = true;
        return {
            success: true,
            statusCode: 200,
            message: `Server is already stopped.`,
        };
    }

    serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
        instanceId: "<emergency>",
        timestamp: new Date(),
    };


    stopSocket();
    const powerData = await waitForEventEmitterPowerData();
    if (!powerData) {
        return {
            success: false,
            statusCode: 500,
            message: "An error occurred while emergency stopping the socket",
        };
    } else if (powerData === "ON") {
        return {
            success: false,
            statusCode: 409,
            message: "The socket was started instead of stopping. Please try again.",
        };
    }

    let report: OperationReport = {
        success: true,
        statusCode: 200,
        message: `All instances stopped successfully.`,
        stoppedInstances: [],
    };

    for (const instanceId of serverData.runningInstances) {
        if (instancesData[instanceId].stopTimestamp) continue;
        const { success } = await stopInstance(instanceId, { emergency: true });
        if (success) {
            report.stoppedInstances?.push(instanceId);
        }
    }

    serverData.isEmergencyStopped = true;

    return report;
};
