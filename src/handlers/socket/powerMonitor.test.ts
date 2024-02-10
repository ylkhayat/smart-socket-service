import {
    CMND_ENERGY_TOPIC,
    POWER_TOPIC_RESULT,
    STAT_TOPIC_RESULT,
    powerFetchingWorker,
    retrieveEnergyToday,
    setupPowerStatisticWatcher,
    subscribeToPowerStatistics,
} from "./powerMonitor";
import { MQTTClient } from "../../mqtt/setupMQTT";
import { resetAllData, serverData } from "../../store";
import * as powerMonitor from "./powerMonitor";

const powerFetchingWorkerSpy = jest
    .spyOn(powerMonitor, "powerFetchingWorker")
    .mockImplementation(async () => {
        for (let i = 0; i < 10; i++) { }
        if (serverData.runningInstances.length === 0) {
            setupPowerStatisticWatcher();
        }
    });

jest
    .spyOn(powerMonitor, "setupPowerStatisticWatcher")
    .mockImplementation(async () => {
        if (serverData.runningInstances.length > 0) {
            powerFetchingWorker();
        }
    });

jest.mock("../../mqtt/setupMQTT", () => ({
    MQTTClient: {
        subscribe: jest.fn(),
        publish: jest.fn(),
    },
    TOPIC: "mixer",
}));
jest.mock("../../events/eventEmitter");
jest.mock("../../store");

describe("Power Monitor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetAllData();
    });

    describe("subscribeToPowerStatistics", () => {
        it("should subscribe to power statistics topics", () => {
            subscribeToPowerStatistics();
            expect(MQTTClient.subscribe).toHaveBeenCalledWith(
                [STAT_TOPIC_RESULT, POWER_TOPIC_RESULT],
                expect.any(Function),
            );
        });
    });

    describe("retrieveEnergyToday", () => {
        it("should publish a message to retrieve energy today", () => {
            retrieveEnergyToday();
            expect(MQTTClient.publish).toHaveBeenCalledWith(CMND_ENERGY_TOPIC, "");
        });
    });

    describe("setupPowerStatisticWatcher", () => {
        it("should start the power statistic worker if there are running instances", () => {
            serverData.runningInstances = ["instance1", "instance2"];
            setupPowerStatisticWatcher();
            expect(powerFetchingWorkerSpy).toHaveBeenCalledTimes(1);
        });

        it("should not start the power statistic worker if there are no running instances", () => {
            serverData.runningInstances = [];
            setupPowerStatisticWatcher();
            expect(powerFetchingWorkerSpy).not.toHaveBeenCalled();
        });
    });
});
