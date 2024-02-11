import { Status10Energy } from "./mqtt/setupMQTT";

export type InstanceDataInput = {
    [K in keyof Pick<InstanceData, "emergencyStopTimeout">]?: string;
};

type ServerDataEnergy = {
    [K in keyof Status10Energy]: number;
};
type InstanceDataEnergy = {
    [K in keyof Status10Energy]: number[];
};

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
    initialEnergy: ServerDataEnergy | null;
    runningInstancesWithEmergencyStop: string[];
    powerStatus: PowerStatus[];
    instancesStarting: string[];
    instancesTriggeringPowerOff: string[];
    connectedSocketName: string | null;
};

export let serverData: ServerData = {
    runningInstances: [],
    energyToday: 0,
    runningInstancesWithEmergencyStop: [],
    instancesTriggeringPowerOff: [],
    instancesStarting: [],
    powerStatus: [
        {
            powerOn: null,
            powerOff: null,
        },
    ],
    connectedSocketName: null,
    initialEnergy: null,
};

export const resetAllData = () => {
    instancesData = {};
    serverData = {
        connectedSocketName: null,
        runningInstances: [],
        energyToday: 0,
        runningInstancesWithEmergencyStop: [],
        instancesStarting: [],
        instancesTriggeringPowerOff: [],
        powerStatus: [
            {
                powerOn: null,
                powerOff: null,
            },
        ],
        initialEnergy: null,
    };
};
