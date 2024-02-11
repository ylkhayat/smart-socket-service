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


export const prettyPrintServerData = () => {
    console.clear();
    console.log("Instances:");
    console.table(instancesData);
    const prettyServerData = Object.keys(serverData).reduce(
        (acc, key) => ({
            ...acc,
            [key]:
                typeof serverData[key as ServerDataKeys] === "object"
                    ? Array.isArray(serverData[key as ServerDataKeys])
                        ? serverData[key as ServerDataKeys]?.toString()
                        : JSON.stringify(serverData[key as ServerDataKeys])
                    : serverData[key as ServerDataKeys],
        }),
        {},
    );

    const prettyPowerStatus = serverData.powerStatus
        .map(
            ({ powerOn, powerOff }) =>
                `ON: ${powerOn?.instanceId}, OFF: ${powerOff?.instanceId}`,
        )
        .toString();
    const prettierServerData = {
        ...prettyServerData,
        powerStatus: prettyPowerStatus,
    };
    console.log("Server:");
    console.table(prettierServerData);
};

if (process.env.NODE_ENV !== "test") {


    setInterval(() => {
        prettyPrintServerData();
    }, 20000);
}
