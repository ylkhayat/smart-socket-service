# 🚀 Smart Socket Service

![Tests](https://github.com/ylkhayat/smart-socket-service/.github/workflows/main.yml/badge.svg)

Welcome to the Smart Socket Service, your one-stop shop for controlling and monitoring smart sockets. This service is like a remote control for your smart sockets, but with superpowers! 💪

This documentation also has a [github page](https://ylkhayat.github.io/smart-socket-service/), maybe check it out for better visualization when it comes to testsets.

## 🖼️ Usage Scenario & Testsets

What is a testset though? And what are we talking about? 🤔

Let me show you a little bit of what we have in store for you! I have annotated this personally over a "testset" that we have that simulates a real life scenario.

Yalla habibi! Go to [testsets](https://ylkhayat.github.io/smart-socket-service/testsets/#README.md) to know more 🚀

## 🛠️ Installation

Just clone this repository, run `npm install` to install the dependencies, and you're good to go!

## 🎛️ Smart Socket Configuration

You can just run the following script to create the `.env` file for you in an interactive way.

```bash
npm run setup
```

The `.env` file is where you can configure the MQTT client used by the Smart Socket Service. Here's an example of what this file might look like:

```bash
# The port that the server listens on
PORT=3000
# MQTT Configuration
MQTT_PROTOCOL=mqtt
MQTT_HOST=your-preferred-host
MQTT_PORT=1883
MQTT_CLIENT_ID=SOME_CLIENT_ID
MQTT_USERNAME=THE_USER
MQTT_PASSWORD=password
MQTT_TOPIC=smart-socket
# Logging Configuration (advised to use only in development)
# It writes a log file that can grow significantly
LOGGING_ENABLED=False
```

This file should be located at the root of your project directory. The `MQTT_PROTOCOL`, `MQTT_HOST`, and `MQTT_PORT` fields are used to construct the URL that the MQTT client connects to. The `MQTT_CLIENT_ID`, `MQTT_USERNAME`, and `MQTT_PASSWORD` fields are used for authentication. And the `PORT` is the port that the server listens on.

You can also include any additional options that are supported by the MQTT.js library. For a full list of options, refer to the [MQTT.js documentation](https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientstreambuilder-options).

## 🎮 Running the Thing!

To start the service, just run `npm start`.
To run in production, use `npm run prod`.

## 🌐 API Endpoints

### You can ask me: "Hey Youssef, I want to start an instance, wait for 5 seconds, and then stop the instance. How can I do that? 🧠"

For a non overwhelming documentation, here's one endpoint that you can use without further diving deeper or further! 🎉

### `POST /api/start-wait-stop`

This endpoint allows you to start an instance, wait for a specific duration, and then stop the instance. It also supports callbacks to notify you when the instance has stopped. Simply provide a header suffixed by `-callback` with the url expecting the response and you will get the non blocking response on this url.

| Parameter  | Type   | Optional | Default | Description                                |
| ---------- | ------ | -------- | ------- | ------------------------------------------ |
| `duration` | number | No       |         | The duration you want to wait, in seconds. |

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 404 Not Found: The instance could not be found after it was created.
- 409 Conflict: The instance could not be created, the socket was turned off instead of on or the socket was emergency stopped.
- 422 Unprocessable Entity: The `duration` parameter was not provided.
- 500 Internal Server Error: An error occurred while managing the socket or fetching the power consumption or while trying to stop the socket when the duration occurs.
- 200 OK: The instance was successfully created.
  - | Parameter  | Type                                  | Description                         |
    | ---------- | ------------------------------------- | ----------------------------------- |
    | `instance` | [`InstanceData`](../src/store.ts#L14) | The instance that was newly created |

### However, we provide even more that that. You can keep reading if you'd like to take control over things!

### `POST /api/instance`

This endpoint allows you to create a new instance.

| Parameter | Type   | Optional | Description                                                                         |
| --------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| `timeout` | number | No       | The timeout used to stop the instance in case it could potentially become untracked |

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 409 Conflict: The instance could not be created, the socket was turned off instead of on or the socket was emergency stopped.
- 422 Unprocessable Entity: The `instanceId` parameter was not provided.
- 500 Internal Server Error: An error occurred while managing the socket or fetching the power consumption.
- 200 OK: The instance was successfully created.

  - | Parameter  | Type                                  | Description                         |
    | ---------- | ------------------------------------- | ----------------------------------- |
    | `instance` | [`InstanceData`](../src/store.ts#L14) | The instance that was newly created |

### `GET /api/instance/:instanceId`

This endpoint allows you to check on a specific instance.

| Parameter    | Type   | Optional | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| `instanceId` | string | No       | The ID of the instance you want to check. |

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 404 Not Found: The instance could not be found after it was created.
- 200 OK: The instance was successfully fetched.
  - | Parameter  | Type                                  | Description                     |
    | ---------- | ------------------------------------- | ------------------------------- |
    | `instance` | [`InstanceData`](../src/store.ts#L14) | The instance that was requested |

### `PUT /api/instance/:instanceId`

This endpoint allows you to stop an instance.

| Parameter    | Type   | Optional | Description                              |
| ------------ | ------ | -------- | ---------------------------------------- |
| `instanceId` | string | No       | The ID of the instance you want to stop. |

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 404 Not Found: The instance does not exist.
- 422 Unprocessable Entity: The `instanceId` parameter was not provided.
- 500 Internal Server Error: An error occurred while stopping the instance.
- 200 OK: The instance was successfully stopped.
  - | Parameter  | Type                                  | Description                         |
    | ---------- | ------------------------------------- | ----------------------------------- |
    | `instance` | [`InstanceData`](../src/store.ts#L14) | The instance that was newly created |

### `DELETE /api/instance/:instanceId`

This endpoint allows you to delete an instance.

| Parameter    | Type   | Optional | Description                                |
| ------------ | ------ | -------- | ------------------------------------------ |
| `instanceId` | string | Yes      | The ID of the instance you want to delete. |

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 404 Not Found: The instance does not exist.
- 422 Unprocessable Entity: The `instanceId` parameter was not provided.
- 500 Internal Server Error: An error occurred while stopping the instance or deleting it.
- 200 OK: The instance was successfully deleted.
  - | Parameter  | Type                                  | Description                         |
    | ---------- | ------------------------------------- | ----------------------------------- |
    | `instance` | [`InstanceData`](../src/store.ts#L14) | The instance that was newly created |

### `GET /api/wait`

This endpoint allows you to wait for a specific duration. It also supports callbacks to notify you when the time runs out. Simply provide a header suffixed by `-callback` with the url expecting the response and you will get the non blocking response on this url.

| Parameter  | Type   | Optional | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `duration` | number | No       | The duration you want to wait, in seconds. |

#### Response

- | Parameter | Type      | Description                    |
  | --------- | --------- | ------------------------------ |
  | `waiting` | `boolean` | Indicator of the waiting state |

### `POST /api/emergency-stop/`

This endpoint allows you to perform an emergency stop the smart socket and put the server in a halted state where you can not start any new instances unless you call `PUT /api/recover`.

#### Response

You get a `message` to describe the outcome of the action and a status code.

- 409 Conflict: The smart socket could was powered on instead of powering off.
- 500 Internal Server Error: An error occurred while stopping the smart socket.
- 200 OK: The instance was successfully deleted.
  - | Parameter          | Type       | Description                                            |
    | ------------------ | ---------- | ------------------------------------------------------ |
    | `stoppedInstances` | `string[]` | IDs of the stopped instances due to the emergency stop |

### `PUT /api/recover`

This endpoint allows you to recover the smart socket from an emergency stop and put the server in a running state where you can start new instances.

#### Response

You get a `message` to describe the outcome of the action and a status code.

### `GET /api/download`

This endpoint allows you to download the server's state retrieving both the `serverData` under `server` and the `instancesData` under `instances`.

### `GET /api/server/status`

This endpoint allows you to check the status of the server.

#### Response

- 500 Internal Server Error: An error occurred while retrieving the data from the server.
- 200 OK: The server status was retrieved successfully.
  - | Parameter            | Type                                            | Description                                                                                           |
    | -------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
    | `isEmergencyStopped` | `boolean`                                       | Indicator if the server underwent an emergency stop and not able to process new instances now or not. |
    | `energyToday`        | `number`                                        | Energy consumption per second.                                                                        |
    | `initialEnergy`      | [`ServerDataEnergy / null`](../src/store.ts#L7) | The first energy readings when the server just started.                                               |
    | `runningInstances`   | `string[]`                                      | An array of instance IDs that are currently running.                                                  |

## 🎛️ Handlers

Handlers in this project are responsible for processing specific actions related to instances and sockets. They are located in the `../src/handlers` directory.

### Instance Handlers

Instance handlers are located in `../src/handlers/instance`. They include:

- [`deleteInstance`](../src/handlers/instance/deleteInstance.ts): This handler is responsible for deleting an instance.
- [`startInstance`](../src/handlers/instance/startInstance.ts): This handler is responsible for starting an instance.
- [`stopInstance`](../src/handlers/instance/stopInstance.ts): This handler is responsible for stopping an instance.

### Socket Handlers

Socket handlers are located in `../src/handlers/socket`. They include:

- [`control`](../src/handlers/socket/control.ts): This handler is responsible for sending control commands to the socket. It includes `startSocket` and `stopSocket` functions.
- [`emergencyStop`](../src/handlers/socket/emergencyStop.ts): This handler is responsible for performing an emergency stop on the socket.
- [`manualStop`](../src/handlers/socket/manualStop.ts): This handler is responsible for performing a manual stop on the socket.
- [`powerMonitor`](../src/handlers/socket/powerMonitor.ts): This handler is responsible for monitoring the power usage of the socket.

Each handler interacts with the [`store`](../src/store.ts) to get or update the data of instances and sockets.

## 📚 Data Store

The application uses a simple in-memory data store to keep track of instances and server data. The data store is defined in the [store.ts](../src/store.ts) file.

### Instance Data

The application keeps track of instances data in the `instancesData` object in the [store.ts](../src/store.ts) file. Each instance is represented by an `InstanceData` object, which contains the following fields:

| Field                | Type                                        | Description                                                                                                                               |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | `string`                                    | The ID of the instance.                                                                                                                   |
| `energy`             | [`InstanceDataEnergy`](../src/store.ts#L10) | The energy object queried from the device at the start of the instance.                                                                   |
| `timeout`            | `number`                                    | The time in milliseconds after which the device will be stopped if it is not stopped manually.                                            |
| `startTimestamp`     | `Date`                                      | Timestamp when the instance was started.                                                                                                  |
| `stopTimestamp`      | `Date / null`                               | Timestamp when the instance was stopped. Might be `null` if the instance is still running.                                                |
| `powerOnTimestamp`   | `Date / null`                               | Timestamp when the socket was powered on. Might be `null` if the socket was already powered on.                                           |
| `powerOffTimestamp`  | `Date / null`                               | Timestamp when the socket was powered off. Might be `null` if the socket is still handling other instances yet this instance has stopped. |
| `isEmergencyStopped` | `boolean`                                   | Flag indicating if the instance was stopped due to an emergency stop.                                                                     |
| `isManuallyStopped`  | `boolean`                                   | Flag indicating if the instance was stopped manually.                                                                                     |

### Server Data

The application also maintains a `serverData` object in the [store.ts](../src/store.ts) file. This object contains data related to the server and its interactions with instances and sockets. Here are the fields in the `serverData` object:

| Field                         | Type                                            | Description                                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `runningInstances`            | `string[]`                                      | An array of instance IDs that are currently running.                                                                                                                                                                                 |
| `energyToday`                 | `number`                                        | Energy consumption per second.                                                                                                                                                                                                       |
| `initialEnergy`               | [`ServerDataEnergy / null`](../src/store.ts#L7) | The first energy readings when the server just started.                                                                                                                                                                              |
| `powerStatus`                 | [`PowerStatus`](../src/store.ts#L62)[]          | An array of `PowerStatus` objects representing the power status of the server. Each `PowerStatus` object contains a `powerOn` field and a `powerOff` field, each of which is an object containing an `instanceId` and a `timestamp`. |
| `instancesStarting`           | `string[]`                                      | An array of instance IDs that are currently triggered to be started.                                                                                                                                                                 |
| `instancesStopping`           | `string[]`                                      | An array of instance IDs that are currently triggered to be stopped.                                                                                                                                                                 |
| `runningInstancesWithTimeout` | `string[]`                                      | Running instances that has a certain timeout.                                                                                                                                                                                        |
| `connectedSocketName`         | `string / null`                                 | The name of the smart socket that the server is connected to                                                                                                                                                                         |
| `isEmergencyStopped`          | `boolean`                                       | Indicator of whether the smart socket was emergency stopped or not.                                                                                                                                                                  |

The `serverData` object is updated by various handlers in the `../src/handlers` directory. For example, the [`startInstance`](../src/handlers/instance/startInstance.ts) handler adds the started instance's ID to the `runningInstances` array, and the [`stopInstance`](../src/handlers/instance/stopInstance.ts) handler removes the stopped instance's ID from the `runningInstances` array and adds it to the `instancesStopping` array.

## 🤝 Contributing

We welcome contributions! Feel free to submit a pull request.

## Author

This project is maintained by [ylkhayat](https://github.com/ylkhayat). You can visit my page for more projects.

## 📜 License

This project is licensed under the ISC License.

So, what are you waiting for? Start controlling your smart sockets like a pro! 🎉
