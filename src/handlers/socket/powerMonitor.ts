import { waitForEventEmitterEnergyData } from "../../events/eventEmitter";
import { serverData, instancesData } from "../../store";
import { MQTTClient } from "../../mqtt/setupMQTT";
import { TOPIC } from "../../mqtt/topic";

let workerRunning = false;
let intervalId: NodeJS.Timeout | null = null;

const FETCH_POWER_TIMEOUT_MS = 5000;
const CHECK_CHANGES_TIMEOUT_MS = 2000;

export const CMND_STATUS_TOPIC = `cmnd/${TOPIC}/STATUS`;
export const STATUS_TOPIC_RESULT = `stat/${TOPIC}/STATUS`;
export const ENERGY_TOPIC_RESULT = `stat/${TOPIC}/STATUS10`;
export const POWER_TOPIC_RESULT = `stat/${TOPIC}/POWER`;

export const retrieveGeneralStatus = () => {
    MQTTClient.publish(CMND_STATUS_TOPIC, "");
};

export const retrieveEnergyToday = () => {
    MQTTClient.publish(CMND_STATUS_TOPIC, "10");
};

const waitForFetchTimeout = () =>
    new Promise((resolve) => setTimeout(resolve, FETCH_POWER_TIMEOUT_MS));

type EnergyFetchReport = {
    today: number;
    apparentPower: number;
    current: number;
    factor: number;
    power: number;
    reactivePower: number;
    voltage: number;
} | null;

export const energyFetch = async (): Promise<EnergyFetchReport> => {
    retrieveEnergyToday();
    const energyData = await waitForEventEmitterEnergyData();
    if (energyData === undefined) {
        return null;
    }
    const {
        today,
        apparentPower,
        current,
        factor,
        power,
        reactivePower,
        voltage,
    } = energyData;
    serverData.energyToday = today;
    if (serverData.initialEnergy === null) {
        serverData.initialEnergy = {
            today,
            apparentPower,
            current,
            factor,
            power,
            reactivePower,
            voltage,
        };
    }

    serverData.runningInstances.forEach((instanceId) => {
        /**
         * If the instance does not have energy data, create it.
         */
        if (!instancesData[instanceId].energy) {
            instancesData[instanceId].energy = {
                today: [today],
                apparentPower: [apparentPower],
                current: [current],
                factor: [factor],
                power: [power],
                reactivePower: [reactivePower],
                voltage: [voltage],
            };
        } else {
            instancesData[instanceId].energy.today?.push(today);
            instancesData[instanceId].energy.apparentPower?.push(apparentPower);
            instancesData[instanceId].energy.current?.push(current);
            instancesData[instanceId].energy.factor?.push(factor);
            instancesData[instanceId].energy.power?.push(power);
            instancesData[instanceId].energy.reactivePower?.push(reactivePower);
            instancesData[instanceId].energy.voltage?.push(voltage);
        }
    });
    return energyData;
};

export const powerFetchingWorker = async () => {
    workerRunning = true;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    while (serverData.runningInstances.length > 0) {
        await energyFetch();
        await waitForFetchTimeout();
    }
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    workerRunning = false;
    setupPowerStatisticWatcher();
};

const checkForChangesAndStartWorker = () => {
    const currentState = serverData.runningInstances;
    if (currentState.length > 0 && !workerRunning) {
        powerFetchingWorker();
    }
};

export const setupPowerStatisticWatcher = () => {
    if (!intervalId) {
        intervalId = setInterval(
            checkForChangesAndStartWorker,
            CHECK_CHANGES_TIMEOUT_MS,
        );
    }
};
