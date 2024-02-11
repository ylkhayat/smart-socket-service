import fs from "fs";
import path from "path";
import Table from "cli-table3";

export type InstanceDataInput = {
    [K in keyof Pick<
        InstanceData,
        "samplingInterval" | "emergencyStopTimeout"
    >]?: string;
};
export type InstanceData = {
    id: string;
    /**
     * The energy consumption queried from the device at the start of the instance
     */
    initialEnergyToday: number;
    /**
     * Cummulative energy consumption for the instance per interval
     * @example consumedEnergyToday = initialEnergyToday - API.newEnergyToday
     */
    consumedEnergyToday: number;
    /**
     * Amperage report per interval
     */
    amperage: number[];
    /**
     * The interval in milliseconds at which the power monitoring is sampled
     */
    samplingInterval: number;
    /**
     * The time in milliseconds after which the device will be stopped if it is not stopped manually
     */
    emergencyStopTimeout: number;
    /**
     * Timestamp when the instance was started
     */
    startTimestamp: Date;
    /**
     * Timestamp when the instance was stopped
     *
     * Might be `null` if the instance is still running
     */
    stopTimestamp: Date | null;
    /**
     * Timestamp when the socket was powered on
     */
    powerOnTimestamp: Date;
    /**
     * Timestamp when the socket was powered off.
     *
     * Might be `null` if the socket is still handling other instances yet this instance has stopped
     */
    powerOffTimestamp: Date | null;
    /**
     * Flag indicating if the instance was stopped due to an emergency stop
     */
    isEmergencyStopped: boolean;
    /**
     * Flag indicating if the instance was stopped manually
     */
    isManuallyStopped: boolean;
};
const instanceDataKeys = [
    "id",
    "initialEnergyToday",
    "consumedEnergyToday",
    "amperage",
    "samplingInterval",
    "emergencyStopTimeout",
    "startTimestamp",
    "stopTimestamp",
    "powerOnTimestamp",
    "powerOffTimestamp",
    "isEmergencyStopped",
    "isManuallyStopped",
] as const;

type InstancesData = {
    [id: string]: InstanceData;
};

export let instancesData: InstancesData = {};

type PowerStatus = {
    /**
     * Timestamp when the socket was powered on
     *
     * Might be `null` if no instances were started yet
     */
    powerOn: {
        instanceId: string;
        timestamp: Date;
    } | null;
    /**
     * Timestamp when the socket was powered off.
     *
     * Might be `null` if the socket is still handling other instances yet this instance has stopped
     */
    powerOff: {
        instanceId: string;
        timestamp: Date;
    } | null;
};

type ServerData = {
    /**
     * List of running instances
     */
    runningInstances: string[];
    /**
     * Energy consumption per second
     */
    energyToday: number;
    runningInstancesWithEmergencyStop: string[];
    powerStatus: PowerStatus[];
    instancesTriggeringPowerOff: string[];
};

const serverDataKeys = [
    "energyToday",
    "runningInstancesWithEmergencyStop",
    "instancesTriggeringPowerOff",
] as const;

type ServerDataKeys = keyof ServerData;

export let serverData: ServerData = {
    runningInstances: [],
    energyToday: 0,
    runningInstancesWithEmergencyStop: [],
    instancesTriggeringPowerOff: [],
    powerStatus: [
        {
            powerOn: null,
            powerOff: null,
        },
    ],
};

export const resetAllData = () => {
    instancesData = {};
    serverData = {
        runningInstances: [],
        energyToday: 0,
        runningInstancesWithEmergencyStop: [],
        instancesTriggeringPowerOff: [],
        powerStatus: [
            {
                powerOn: null,
                powerOff: null,
            },
        ],
    };
};

if (process.env.NODE_ENV !== "test") {
    const file = path.join(__dirname, "..", "server.log");
    const logStream = fs.createWriteStream(file, {
        flags: "w",
    });
    console.log(`Setting up server log, in ${file}`);
    const prettyPrintServerData = () => {
        if (Object.values(instancesData).length > 0) {
            const instancesDataTable = new Table({
                chars: {
                    top: "═",
                    "top-mid": "╤",
                    "top-left": "╔",
                    "top-right": "╗",
                    bottom: "═",
                    "bottom-mid": "╧",
                    "bottom-left": "╚",
                    "bottom-right": "╝",
                    left: "║",
                    "left-mid": "╟",
                    mid: "─",
                    "mid-mid": "┼",
                    right: "║",
                    "right-mid": "╢",
                    middle: "│",
                },
                head: instanceDataKeys.map((key) => key),
            });

            Object.values(instancesData).forEach((instance) => {
                instancesDataTable.push(
                    instanceDataKeys.map((key) => JSON.stringify(instance[key])),
                );
            });

            logStream.write(`Time: ${new Date().toISOString()}\n`);
            logStream.write("Instances:\n");

            logStream.write(instancesDataTable.toString());
            logStream.write("\n");
        }

        const powerStatusTable = new Table({
            head: ["On", "Off"],
        });

        serverData.powerStatus.forEach(({ powerOn, powerOff }) => {
            powerStatusTable.push([powerOn?.instanceId, powerOff?.instanceId]);
        });

        const serverDataTable = new Table({
            head: serverDataKeys.map((key) => key),
        });
        serverDataTable.push(
            serverDataKeys.map((key) => JSON.stringify(serverData[key])),
        );

        logStream.write("Server:\n");
        logStream.write(serverDataTable.toString());
        logStream.write("\n");

        const runningInstancesTable = new Table({
            head: ["id"],
        });
        runningInstancesTable.push(serverData.runningInstances);

        logStream.write("Running Instances:\n");
        logStream.write(runningInstancesTable.toString());
        logStream.write("\n");

        logStream.write("Power Status:\n");
        logStream.write(powerStatusTable.toString());
        logStream.write("\n");
        logStream.write("\n");
        logStream.write("\n");
        logStream.write("\n");
    };

    setInterval(() => {
        prettyPrintServerData();
    }, 10000);
}
