import request from "supertest";
import express from "express";
import routes from "./routes";

import { waitForEventEmitterData } from "./events/eventEmitter";
import { InstanceData, instancesData, resetAllData, serverData } from "./store";
import shortid from "shortid";

jest.mock("shortid");

jest.mock("./events/eventEmitter.ts");

jest.mock("./handlers/socket/powerMonitor.ts", () => ({
    retrieveEnergyToday: jest.fn(),
    setupPowerStatisticWatcher: jest.fn(),
}));
jest.mock("./handlers/socket/control.ts", () => ({
    startSocket: jest.fn(),
    stopSocket: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api", routes);

describe("Routes", () => {
    beforeEach(() => {
        resetAllData();
    });
    describe("POST /api/instance", () => {
        it("should start a new instance and return success", async () => {
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve([0.25, "ON"]),
            );
            const response = await request(app).post("/api/instance");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("instance");
            expect(response.body.instance).toHaveProperty("id");
        });

        it("should return an error if the socket turned off unexpectedly", async () => {
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve([0, "OFF"]),
            );
            const response = await request(app).post("/api/instance");
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("message");
        });

        it("should return an error if starting the instance fails", async () => {
            (shortid.generate as jest.Mock).mockImplementationOnce(() => "123");
            instancesData["123"] = {
                id: "123",
            } as any;
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve([0.25, "ON"]),
            );
            const response = await request(app).post("/api/instance");
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("instanceId");
        });

        it("should return an error if an error occurs while controlling the socket", async () => {
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.reject(),
            );
            const response = await request(app).post("/api/instance");
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/instance", () => {
        beforeEach(() => {
            resetAllData();
        });
        it("should stop the instance and return success", async () => {
            (shortid.generate as jest.Mock).mockImplementationOnce(() => "123");
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve([0.25, "ON"]),
            );
            await request(app).post("/api/instance");
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve(["OFF"]),
            );
            const response = await request(app).put("/api/instance/123");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("instance");
        });

        it("should return an error if instanceId is not provided", async () => {
            const response = await request(app).put("/api/instance");
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty("message");
        });

        it("should return an error if stopping the instance fails", async () => {
            (shortid.generate as jest.Mock).mockImplementationOnce(() => "123");
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve([0.25, "ON"]),
            );
            await request(app).post("/api/instance");

            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.reject(),
            );
            const response = await request(app).put("/api/instance/123");
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message");
        });

        it("should not stop the socket if the instance is already stopped", async () => {
            instancesData["1234"] = {
                id: "1234",
                stopTimestamp: new Date(),
            } as any;
            const response = await request(app).put("/api/instance/1234");
            expect(response.status).toBe(409);
        });

        it("should call emergencyStop and return the expected values", async () => {
            (waitForEventEmitterData as jest.Mock).mockImplementation(() =>
                Promise.resolve([0.25, "ON"]),
            );
            await request(app).post("/api/instance");
            await request(app).post("/api/instance");
            (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve(["OFF"]),
            );
            const response = await request(app).put("/api/emergency-stop");
            expect(response.status).toBe(200);
            expect(response.body.stoppedInstances).toHaveLength(2);
            expect(serverData.runningInstances).toEqual([]);
        });
    });
});

describe("DELETE /api/instance", () => {
    beforeEach(() => {
        resetAllData();
    });

    it("should delete the instance and return success", async () => {
        const id = "123";
        (shortid.generate as jest.Mock).mockImplementationOnce(() => id);
        (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve([0.25, "ON"]),
        );
        await request(app).post("/api/instance");
        (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve(["OFF"]),
        );
        const response = await request(app).delete(`/api/instance/${id}`);
        expect(response.status).toBe(200);
        expect(response.body.instance.id).toBe(id);
        expect(instancesData[id]).toBeUndefined();
    });

    it("should return an error if the instance does not exist", async () => {
        const response = await request(app).delete(`/api/instance/123`);
        expect(response.status).toBe(404);
    });

    it("should return an error if an error occurs while deleting the instance", async () => {
        const id = "123";
        (shortid.generate as jest.Mock).mockImplementationOnce(() => id);
        (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve([0.25, "ON"]),
        );
        await request(app).post("/api/instance");
        (waitForEventEmitterData as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(),
        );
        const response = await request(app).delete(`/api/instance/${id}`);
        expect(response.status).toBe(500);
    });
});

describe("GET /download", () => {
    beforeAll(() => {
        resetAllData();
        instancesData["instance1"] = {
            energy: {
                today: [0],
            },
            id: "instance1",
        } as InstanceData;
        instancesData["instance2"] = {
            energy: {
                today: [5],
            },
            id: "instance2",
        } as InstanceData;
    });
    it("should return a JSON file with the current server state", async () => {
        const res = await request(app).get("/api/download");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.headers["content-disposition"]).toEqual(
            "attachment; filename=server_state.json",
        );

        const expectedData = {
            instances: instancesData,
            server: serverData,
        };

        expect(JSON.parse(res.text)).toEqual(expect.objectContaining(expectedData));
    });
});
