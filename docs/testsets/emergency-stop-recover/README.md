# 🧪 Emergency Stop & Recover Testset

This directory contains all the runs for the Emergency Stop & Recover testset.

This process uses instances of the previously defined `Start Wait Stop` testset!

## 💡 Explanation

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/emergency-stop-recover/emergency-stop-recover.svg)

### Literal Description

The testset simulates a situation where the process wants to run the smart socket for a `requiredDurationForPowerOn` in seconds, and branches out parallel branches to trigger a certain scenario. On one branch, the process starts an instance wants to keep this instance running but accounts for unexpected emergency stops to the smart socket. Then it handles it through recovering the system after a wait of 5 seconds and then start a new instance and continues the countdown till that the `requiredDurationForPowerOn` has passed. And further proceeds to stop the instance and potentially power off the smart socket. On the other branch, the testset includes a `emergencyAfterDuration` timeout and then triggers an emergency stop. Then it tries to instantly start an instance but it should fail gracefully as is expected since the server is in emergency mode and needs to be recovered.

### Real-life Scenario

Imagine you're running a data center with multiple servers. Each server is expected to run continuously for a requiredDurationForPowerOn in hours. However, due to various reasons like maintenance, hardware issues, or power outages, a server might unexpectedly shut down.

In such a scenario, the data center management system branches out into two parallel processes. On one branch, the system starts a server instance and aims to keep it running for the required duration. If an unexpected shutdown occurs, the system waits for 5 seconds, then starts a new instance and continues the countdown until the requiredDurationForPowerOn has passed. After this, it proceeds to stop the instance and potentially power off the server.

On the other branch, the system includes an emergencyAfterDuration timeout and then triggers an emergency stop after this duration. It then tries to instantly start a new instance, but this should fail gracefully as expected, since the server is in emergency mode and needs to be recovered. This could represent a scenario where an immediate restart after a failure is not possible due to cooling requirements or hardware checks.

Once again, refer back to my personal explanation of what is a testset (the `start-wait-stop` one) in the document [start-wait-stop](https://ylkhayat.github.io/smart-socket-service/testsets/#start-wait-stop.pdf) 🚀

## 📊 HTML Reports

Please click on each [`run-<x>/README.md`] to view what is happening in each run and further information on why is a run different from another.

- [Run 1](https://ylkhayat.github.io/smart-socket-service/testsets/#emergency-stop-recover/run-1/README.md)

## Run the thing online!

You can start a process through this link which will take you to cpee.org and start the process for you! [Click me to create a process and get started!](https://cpee.org/flow/graph.html?load=https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/emergency-stop-recover/emergency-stop-recover.xml)
