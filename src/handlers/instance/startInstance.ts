import shortid from "shortid";
import { InstanceData, instancesData, instancesStartingTimeout, serverData } from "../../store";
import { waitForEventEmitterPowerData } from "../../events/eventEmitter";
import { energyFetch } from "../socket/powerMonitor";
import { startSocket } from "../socket/control";
import { stopInstance } from "./stopInstance";

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
    let triggerPowerOn = false;
    const id = shortid.generate();
    const augmentedData = {
        ...data,
        id,
    };

    if (serverData.isSocketEmergencyStopped) {
        return {
            success: false,
            statusCode: 409,
            message: "The socket is emergency stopped. You cannot start instances.",
            instanceId: id,
        };
    }

    if (instancesData[id]) {
        return {
            success: true,
            statusCode: 200,
            message: `Instance with ID ${id} already exists. Initialization aborted.`,
            instance: instancesData[id]
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
    if (augmentedData.timeout) {
        serverData.runningInstancesWithTimeout.push(id);
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
        triggerPowerOn = true;
    } else if (lastPowerStatus.powerOff !== null) {
        serverData.powerStatus.push({
            powerOn: {
                instanceId: id,
                timestamp: new Date(),
            },
            powerOff: null,
        });
        augmentedData.powerOnTimestamp = new Date();
        triggerPowerOn = true;
    } else {
        augmentedData.powerOnTimestamp = null;
    }

    instancesData[id] = augmentedData;

    if (triggerPowerOn) {
        startSocket();
    }
    try {
        const energyReportPromise = energyFetch();
        const powerDataPromise = triggerPowerOn
            ? waitForEventEmitterPowerData()
            : Promise.resolve(true);

        const [energyReport, powerData] = await Promise.all([
            energyReportPromise,
            powerDataPromise,
        ]);

        if (triggerPowerOn) {
            if (powerData === "OFF") {
                return {
                    success: false,
                    statusCode: 409,
                    message: "The socket turned off unexpectedly",
                    instanceId: id,
                };
            }
        }
        if (!powerData || !energyReport) {
            return {
                success: false,
                statusCode: 500,
                message:
                    "An error occurred while waiting for the socket to start or while fetching the energy report",
                instanceId: id,
            };
        }

        serverData.instancesStarting = serverData.instancesStarting.filter(
            (instance) => instance !== id,
        );

        augmentedData.energy = {
            apparentPower: [energyReport.apparentPower],
            current: [energyReport.current],
            factor: [energyReport.factor],
            today: [energyReport.today],
            power: [energyReport.power],
            reactivePower: [energyReport.reactivePower],
            voltage: [energyReport.voltage],
        };
    } catch (e) {
        return {
            success: false,
            statusCode: 500,
            message:
                "An error occurred while starting the socket and fetching the data",
            instanceId: id,
        };
    }

    if (augmentedData.timeout) {
        instancesStartingTimeout[id] = setTimeout(() => {
            stopInstance(id, { timeout: true });
        }, augmentedData.timeout);
    }

    instancesData[id] = augmentedData;
    report.instance = augmentedData;
    return report;
};
