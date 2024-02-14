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
export const deleteInstance = async (id: string): Promise<OperationReport> => {
    const { success, statusCode, message } =
        await stopInstance(id);
    const instanceData = instancesData[id];
    delete instancesData[id];
    return {
        success,
        statusCode,
        message,
        instance: instanceData,
    };
};
