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

    while (serverData.runningInstances.length > 0) {
        console.log("Worker is working...");
        retrieveEnergyToday();
        const [energyTodayData] = await waitForEventEmitterData([
            "energyTodayData",
        ]);
        serverData.energyToday = energyTodayData;
        serverData.runningInstances.forEach((instanceId) => {
            const instanceData = instancesData[instanceId];
            const consumedEnergyToday = energyTodayData - instanceData.initialEnergyToday;
            instanceData.consumedEnergyToday = parseFloat(consumedEnergyToday.toFixed(3));
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("Worker has stopped.");
    workerRunning = false;
    startInterval();
};

const checkForChangesAndStartWorker = () => {
    console.log("Checking for changes in runningInstances from the watcher...");
    const currentState = serverData.runningInstances;
    let prevState = [...currentState]; // This needs to be managed to reflect the latest state before each check

    if (
        currentState.length !== prevState.length ||
        !currentState.every((value, index) => value === prevState[index])
    ) {
        console.log(`Detected change in runningInstances: ${currentState}`);
        prevState = [...currentState];
        if (currentState.length > 0 && !workerRunning) {
            powerStatisticWorker().then(() => {
                // Worker has finished; the interval will be restarted inside the worker
            });
        }
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
