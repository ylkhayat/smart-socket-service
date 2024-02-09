import { waitForEventEmitterData } from "../eventEmitter";
import { retrieveEnergyToday } from "../handlers/power-stats";
import { serverData } from "./dataStore";


// // Simulates adding or removing instances to/from serverData.runningInstances
// function toggleRunningState(addInstance: boolean) {
//     if (addInstance) {
//         // Simulate adding an instance
//         const newInstanceId = `instance-${Date.now()}`;
//         serverData.runningInstances.push(newInstanceId);
//         console.log(`Added instance ${newInstanceId}, runningInstances: ${serverData.runningInstances}`);
//     } else {
//         // Simulate removing an instance
//         serverData.runningInstances.pop();
//         console.log(`Removed an instance, runningInstances: ${serverData.runningInstances}`);
//     }
// }

// Worker function that performs tasks
const powerStatisticWorker = async () => {
    while (serverData.runningInstances.length > 0) {
        console.log("Worker is working...");
        retrieveEnergyToday();
        const [energyTodayData] = await waitForEventEmitterData([
            "energyTodayData",
        ]);
        serverData.energyToday = energyTodayData;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("Worker has stopped.");
}



function setupPowerStatisticWatcher() {
    let prevState = [...serverData.runningInstances];
    setInterval(() => {
        // Check for changes in the runningInstances array
        const currentState = serverData.runningInstances;
        if (currentState.length !== prevState.length || !currentState.every((value, index) => value === prevState[index])) {
            console.log(`Detected change in runningInstances: ${currentState}`);
            prevState = [...currentState];
            if (currentState.length > 0 && !workerRunning) {
                workerRunning = true;
                powerStatisticWorker().then(() => { workerRunning = false; });
            }
        }
    }, 2000);
}

let workerRunning = false;

setupPowerStatisticWatcher();
