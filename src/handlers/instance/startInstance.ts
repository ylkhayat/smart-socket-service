import shortid from "shortid";
import { InstanceData, instancesData, serverData } from "../../store";

type OperationReport = {
    success: boolean;
    message: string;
    instanceId?: string;
    instance?: InstanceData;
};

/**
 * Initializes a new instance and updates server-wide data accordingly.
 * @param {InstanceData} data - Data for the instance being initialized.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const startInstance = (data: InstanceData): OperationReport => {
    const id = shortid.generate();
    const augmentedData = {
        ...data,
        id,
    };

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
        instanceId: id,
    };

    serverData.runningInstances.push(id);
    serverData.energyToday = 0;
    if (augmentedData.emergencyStopTimeout) {
        serverData.runningInstancesWithEmergencyStop.push(id);
    }

    const lastPowerStatus =
        serverData.powerStatus[serverData.powerStatus.length - 1];
    if (lastPowerStatus.powerOn === null) {
        serverData.powerStatus[serverData.powerStatus.length - 1] = {
            powerOn: {
                instanceId: id,
                timestamp: new Date(),
            },
            powerOff: null,
        };
        augmentedData.powerOnTimestamp = new Date();
    } else if (
        lastPowerStatus.powerOff !== null &&
        lastPowerStatus.powerOff.timestamp < augmentedData.startTimestamp
    ) {
        serverData.powerStatus.push({
            powerOn: {
                instanceId: id,
                timestamp: new Date(),
            },
            powerOff: null,
        });
        augmentedData.powerOnTimestamp = new Date();
    } else {
        augmentedData.powerOnTimestamp = lastPowerStatus.powerOn.timestamp;
    }

    instancesData[id] = augmentedData;
    report.instance = augmentedData;
    return report;
};
