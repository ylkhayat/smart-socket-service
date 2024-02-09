import { waitForEventEmitterData } from "../eventEmitter";
import { retrieveEnergyToday } from "../handlers/power-stats";
import { serverData, instancesData } from "./dataStore";

let workerRunning = false;
let watcherSetup = false;
let intervalId: NodeJS.Timeout | null = null;

const powerStatisticWorker = async () => {
    workerRunning = true;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    console.log("Worker is working...");
    while (serverData.runningInstances.length > 0) {
        retrieveEnergyToday();
        const [energyTodayData] = await waitForEventEmitterData([
            "energyTodayData",
        ]);
        serverData.energyToday = energyTodayData;
        serverData.runningInstances.forEach((instanceId) => {
            const instanceData = instancesData[instanceId];
            const consumedEnergyToday =
                energyTodayData - instanceData.initialEnergyToday;
            instanceData.consumedEnergyToday = parseFloat(
                consumedEnergyToday.toFixed(3),
            );
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("Worker has stopped.");
    workerRunning = false;
    startInterval();
};

const checkForChangesAndStartWorker = () => {
    console.log(
        "Checking for new instances to run the power statistic worker...",
    );
    const currentState = serverData.runningInstances;
    if (currentState.length > 0 && !workerRunning) {
        powerStatisticWorker();
    }
};

const startInterval = () => {
    if (!intervalId) {
        intervalId = setInterval(checkForChangesAndStartWorker, 1000);
    }
};

export const setupPowerStatisticWatcher = () => {
    if (watcherSetup) {
        return;
    }
    watcherSetup = true;
    console.log("Setting up power statistic watcher...");
    startInterval();
};
