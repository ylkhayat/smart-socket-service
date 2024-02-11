import fs from "fs";
import path from "path";
import Table from "cli-table3";
import { instancesData, serverData } from "./store";

const instanceDataEnergyKeys = [
    "apparentPower",
    "current",
    "factor",
    "power",
    "reactivePower",
    "today",
    "voltage",
] as const;

const serverDataKeys = [
    "connectedSocketName",
    "energyToday",
    "initialEnergy",
    "instancesStarting",
    "instancesStopping",
    "runningInstancesWithEmergencyStop",
] as const;

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

const serverFile = path.join(__dirname, "..", "server-monitor.log");
const energyFile = path.join(__dirname, "..", "energy-monitor.log");
let printedServerEnergyData = false;
const serverLogStream = fs.createWriteStream(serverFile, {
    flags: "w",
});

console.log(`Setting up server monitor log, in ${serverFile}`);
console.log(`Setting up instance energy monitor log, in ${energyFile}`);

export const logServerData = () => {
    if (serverData.initialEnergy !== null && !printedServerEnergyData) {
        const serverEnergyDataTable = new Table({
            head: instanceDataEnergyKeys.map((key) => key),
        });
        serverEnergyDataTable.push(
            instanceDataEnergyKeys.map((key) => serverData.initialEnergy![key]),
        );

        serverLogStream.write("Server Energy Data:\n");
        serverLogStream.write(serverEnergyDataTable.toString());
        serverLogStream.write("\n");

        serverLogStream.write("\n");
        serverLogStream.write("\n");
        serverLogStream.write("\n");
        printedServerEnergyData = true;
    }

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
                    ...instanceDataEnergyKeys.map((key) => instance.energy[key][i]),
                ]);
            }
        });
        const energyLogStream = fs.createWriteStream(energyFile, {
            flags: "w",
        });
        energyLogStream.write("Instances Energy Data:\n");
        energyLogStream.write(instancesEnergyDataTable.toString());
        energyLogStream.write("\n");
        energyLogStream.end();
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


if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        logServerData();
    }, 20000);
}
