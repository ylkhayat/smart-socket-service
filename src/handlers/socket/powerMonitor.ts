import { waitForEventEmitterData } from "../../events/eventEmitter";
import { serverData, instancesData } from "../../store";
import { MQTTClient, TOPIC } from "../../mqtt/setupMQTT";

let workerRunning = false;
let watcherSetup = false;
let intervalId: NodeJS.Timeout | null = null;

const FETCH_POWER_TIMEOUT_MS = 2000;
const CHECK_CHANGES_TIMEOUT_MS = 2000;

export const CMND_ENERGY_TOPIC = `cmnd/${TOPIC}/EnergyToday`;
export const STAT_TOPIC_RESULT = `stat/${TOPIC}/RESULT`;
export const POWER_TOPIC_RESULT = `stat/${TOPIC}/POWER`;

export const subscribeToPowerStatistics = () => {
    MQTTClient.subscribe([STAT_TOPIC_RESULT, POWER_TOPIC_RESULT], (err) => {
        if (!err) {
            console.log(`Subscribed to topic: '${STAT_TOPIC_RESULT}'`);
            console.log(`Subscribed to topic: '${POWER_TOPIC_RESULT}'`);
        }
    });
};

export const retrieveEnergyToday = () => {
    MQTTClient.publish(CMND_ENERGY_TOPIC, "");
};

const waitForFetchTimeout = () =>
    new Promise((resolve) => setTimeout(resolve, FETCH_POWER_TIMEOUT_MS));

export const powerFetchingWorker = async () => {
    workerRunning = true;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    while (serverData.runningInstances.length > 0) {
        retrieveEnergyToday();
        const energyData = await waitForEventEmitterData(["energyTodayData"]);
        if (energyData === undefined) {
            return;
        }
        const energyTodayData = energyData[0];
        serverData.energyToday = energyTodayData;
        serverData.runningInstances.forEach((instanceId) => {
            const instanceData = instancesData[instanceId];
            const consumedEnergyToday =
                energyTodayData - instanceData.initialEnergyToday;
            instanceData.consumedEnergyToday = parseFloat(
                consumedEnergyToday.toFixed(3),
            );
        });
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
