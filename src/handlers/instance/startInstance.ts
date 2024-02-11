import shortid from "shortid";
import { InstanceData, instancesData, serverData } from "../../store";
import { waitForEventEmitterData } from "../../events/eventEmitter";
import { startSocket } from "../socket/control";
import { retrieveEnergyToday } from "../socket/powerMonitor";

type OperationReport = {
    success: boolean;
    message: string;
    statusCode: number;
    instanceId?: string;
    instance?: InstanceData;
};

/**
 * Initializes a new instance and updates server-wide data accordingly.
 * @param {InstanceData} data - Data for the instance being initialized.
 * @returns {OperationReport} An object indicating the operation's report.
 */
export const startInstance = async (
    data: InstanceData,
): Promise<OperationReport> => {
    const id = shortid.generate();
    const augmentedData = {
        ...data,
        id,
    };

    if (instancesData[id]) {
        // Instance already exists, return a failure message
        return {
            success: false,
            statusCode: 409,
            message: `Instance with ID ${id} already exists. Initialization aborted.`,
            instanceId: id,
        };
    }

    let report: OperationReport = {
        success: true,
        statusCode: 200,
        message: `New instance with ID ${id} initialized successfully.`,
        instanceId: id,
    };

    serverData.runningInstances.push(id);
    serverData.energyToday = 0;
    if (augmentedData.emergencyStopTimeout) {
        serverData.runningInstancesWithEmergencyStop.push(id);
    }
    serverData.instancesStarting.push(id);
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
    } else if (lastPowerStatus.powerOff !== null) {
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
    if (augmentedData.powerOnTimestamp) {
        startSocket();
    }
    retrieveEnergyToday();
    const eventData = await waitForEventEmitterData(["energyData", "powerData"]);
    if (eventData === undefined) {
        return {
            success: false,
            statusCode: 500,
            message: "An error occurred while waiting for the socket to start",
            instanceId: id,
        };
    }

    const [energyData, powerData] = eventData;
    if (powerData === "OFF") {
        return {
            success: false,
            statusCode: 409,
            message: "The socket turned off unexpectedly",
            instanceId: id,
        };
    }
    serverData.instancesStarting = serverData.instancesStarting.filter(
        (instance) => instance !== id,
    );

    augmentedData.energy = {
        apparentPower: [energyData.apparentPower],
        current: [energyData.current],
        factor: [energyData.factor],
        today: [energyData.today],
        power: [energyData.power],
        reactivePower: [energyData.reactivePower],
        voltage: [energyData.voltage],
    };

    instancesData[id] = augmentedData;
    report.instance = augmentedData;
    return report;
};
