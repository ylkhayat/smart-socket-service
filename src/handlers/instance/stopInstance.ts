import { waitForEventEmitterPowerData } from "../../events/eventEmitter";
import { InstanceData, instancesData, serverData } from "../../store";
import { stopSocket } from "../socket/control";

export type StopReport = {
    success: boolean;
    statusCode: number;
    message: string;
    instanceId?: string;
    instance?: InstanceData;
};


type Config = {
    emergency?: boolean;
    timeout?: boolean;
}
/**
 * Stops a certain instance and updates server-wide data accordingly.
 * @param {string} id - identifier for the instance.
 * @param {boolean} emergency - whether the stop is an emergency stop.
 * @returns {StopReport} An object indicating the operation's report.
 */
export const stopInstance = async (
    id: string,
    config?: Config,
): Promise<StopReport> => {
    let triggerPowerOff = config?.emergency ? true : false;
    if (!instancesData[id]) {
        // Instance already exists, return a failure message
        return {
            success: false,
            statusCode: 404,
            message: `Instance with ID ${id} does not exist.`,
        };
    }

    if (
        instancesData[id].stopTimestamp &&
        !(
            instancesData[id].isEmergencyStopped ||
            instancesData[id].isManuallyStopped
        )
    ) {
        return {
            success: true,
            statusCode: 200,
            instance: instancesData[id],
            message: `Instance with ID ${id} is already stopped.`,
        };
    }

    serverData.instancesStopping.push(id);
    instancesData[id].stopTimestamp = new Date();
    let report: StopReport = {
        statusCode: 200,
        success: true,
        message: `Instance with ID ${id} stopped successfully.`,
        instanceId: id,
    };

    /**
     * If the instance running is the last one, trigger a power off.
     */
    if (
        serverData.runningInstances.length === 1 &&
        serverData.runningInstances[0] === id
    ) {

        const stoppingId = config?.emergency ? "<emergency>" : config?.timeout ? "<timeout>" : id;
        serverData.powerStatus[serverData.powerStatus.length - 1].powerOff = {
            instanceId: stoppingId,
            timestamp: new Date(),
        };
        instancesData[id].powerOffTimestamp = new Date();
        instancesData[id].isEmergencyStopped = config?.emergency ? true : false;
        triggerPowerOff = true;
    }

    serverData.runningInstances = serverData.runningInstances.filter(
        (instanceId) => instanceId !== id,
    );

    if (instancesData[id].timeout) {
        serverData.runningInstancesWithTimeout =
            serverData.runningInstancesWithTimeout.filter(
                (instanceId) => instanceId !== id,
            );
    }
    /**
     * If the stop is an emergency stop, stop the socket and wait for the power off event.
     * If is an emergency stop, we handle it differently and more efficiently
     */
    if (!config?.emergency && triggerPowerOff) {
        try {
            stopSocket();
            const powerData = await waitForEventEmitterPowerData();
            if (!powerData || powerData === "ON") {
                return {
                    success: false,
                    statusCode: 500,
                    message: "An error occurred while stopping the socket",
                };
            }
        } catch (e) {
            return {
                success: false,
                statusCode: 500,
                message: "An error occurred while stopping the socket",
            };
        }
    }

    serverData.instancesStopping = serverData.instancesStopping.filter(
        (instance) => instance !== id,
    );
    report.instance = instancesData[id];

    return report;
};
