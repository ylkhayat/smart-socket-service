import fs from "fs";
import path from "path";
import Table from "cli-table3";
import { Status10Energy } from "./mqtt/setupMQTT";

export type InstanceDataInput = {
    [K in keyof Pick<InstanceData, "emergencyStopTimeout">]?: string;
};

type InstanceDataEnergy = {
    /**
     * The energy consumption queried from the device at the start of the instance
     */
    initialToday: number;
    /**
     * Cummulative energy consumption for the instance per interval
     * @example consumedToday = initialEnergyToday - API.newEnergyToday
     */
    consumedToday: number;
    /**
     * The amperage per second queried from the device at the start of the instance
     */
} & {
        [K in keyof Omit<Status10Energy, "today">]: number[];
    };

const instanceDataEnergyKeys = [
    "apparentPower",
    "consumedToday",
    "current",
    "factor",
    "initialToday",
    "power",
    "reactivePower",
    "voltage",
] as const;

export type InstanceData = {
    id: string;
    /**
     * Energy report per interval
     */
    energy: InstanceDataEnergy;
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
    "emergencyStopTimeout",
    "isEmergencyStopped",
    "isManuallyStopped",
    "powerOffTimestamp",
    "powerOnTimestamp",
    "startTimestamp",
    "stopTimestamp",
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
    const serverFile = path.join(__dirname, "..", "server-monitor.log");
    const energyFile = path.join(__dirname, "..", "energy-monitor.log");
    const serverLogStream = fs.createWriteStream(serverFile, {
        flags: "w",
    });
    const energyLogStream = fs.createWriteStream(energyFile, {
        flags: "w",
    });
    console.log(`Setting up server monitor log, in ${serverFile}`);
    console.log(`Setting up instance energy monitor log, in ${energyFile}`);
    const prettyPrintServerData = () => {
        if (Object.values(instancesData).length > 0) {
            const instancesDataTable = new Table({
                head: instanceDataKeys.map((key) => key),
            });

            Object.values(instancesData).forEach((instance) => {
                instancesDataTable.push(
                    instanceDataKeys.map((key) => JSON.stringify(instance[key])),
                );
            });

            serverLogStream.write(`Time: ${new Date().toISOString()}\n`);
            serverLogStream.write("Instances:\n");

            serverLogStream.write(instancesDataTable.toString());
            serverLogStream.write("\n");

            const instancesEnergyDataTable = new Table({
                head: ["id", ...instanceDataEnergyKeys],
            });
            Object.values(instancesData).forEach((instance) => {
                const numberOfLines = instance.energy.apparentPower.length;
                for (let i = 0; i < numberOfLines; i++) {
                    instancesEnergyDataTable.push([
                        i === 0 ? instance.id : "",
                        ...instanceDataEnergyKeys.map((key) =>
                            typeof instance.energy[key] === "object"
                                ? (instance.energy[key] as any)[i]
                                : i === 0
                                    ? instance.energy[key]
                                    : "",
                        ),
                    ]);
                }
            });
            energyLogStream.write("Instances Energy Data:\n");
            energyLogStream.write(instancesEnergyDataTable.toString());
            energyLogStream.write("\n");

            energyLogStream.write("\n");
            energyLogStream.write("\n");
            energyLogStream.write("\n");
        }

        const serverDataTable = new Table({
            head: serverDataKeys.map((key) => key),
        });
        serverDataTable.push(
            serverDataKeys.map((key) => JSON.stringify(serverData[key])),
        );

        serverLogStream.write("Server:\n");
        serverLogStream.write(serverDataTable.toString());
        serverLogStream.write("\n");

        const runningInstancesTable = new Table({
            head: ["id"],
        });
        runningInstancesTable.push(serverData.runningInstances);

        serverLogStream.write("Running Instances:\n");
        serverLogStream.write(runningInstancesTable.toString());
        serverLogStream.write("\n");

        const powerStatusTable = new Table({
            head: ["On", "Off"],
        });

        serverData.powerStatus.forEach(({ powerOn, powerOff }) => {
            powerStatusTable.push([powerOn?.instanceId, powerOff?.instanceId]);
        });

        serverLogStream.write("Power Status:\n");
        serverLogStream.write(powerStatusTable.toString());
        serverLogStream.write("\n");

        serverLogStream.write("\n");
        serverLogStream.write("\n");
        serverLogStream.write("\n");
    };

    setInterval(() => {
        prettyPrintServerData();
    }, 10000);
}
