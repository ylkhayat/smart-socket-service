import { InstanceData, instancesData } from "../../store";
import { StopReport, stopInstance } from "./stopInstance";

type OperationReport = StopReport & {
    instance?: InstanceData;
};

/**
 * Deletes a certain instance and updates server-wide data accordingly.
 * @param {string} id - identifier for the instance.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const deleteInstance = (id: string): OperationReport => {
    const {
        success,
        statusCode,
        isLastEmergencyStop,
        triggeredPowerOff,
        message,
        instanceId,
    } = stopInstance(id);
    if (success) {
        const instanceData = instancesData[id];
        delete instancesData[id];
        return {
            success,
            statusCode,
            message: `Instance with ID ${id} deleted successfully.`,
            isLastEmergencyStop,
            triggeredPowerOff,
            instance: instanceData,
        };
    }
    return {
        success,
        message,
        instanceId,
        statusCode,
    };
};
