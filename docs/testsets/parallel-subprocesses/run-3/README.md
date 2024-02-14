# 🧪 Parallel Subprocesses Testset - Run 3

A run is simply the environment or the setup in which the testset was executed.

## 📊 Process Graph

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/parallel-subprocesses/parallel-subprocesses.svg)

## 📋 Description

Quoting the description from the main `parallel-subprocesses` README:

> Unlike the `smart-wait-stop`, this one assumes many people want to control the exact same smart socket concurrently. A real-life scenario could be a shared office space where different teams want to use the same projector. Each team wants to turn on the projector, use it for a certain duration, and then turn it off. However, if one team's usage overlaps with another, the projector should stay on. Thus, we want to start the projector, wait for it to be used for a certain duration, and then stop it. If the projector is already on, we don't need to do anything - as long as it stays on for the duration needed.
>
> Once again, refer back to my personal explanation of what is a testset (the `start-wait-stop` one) in the document [start-wait-stop](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop.pdf) 🚀

For this run, the testset was executed for me, connecting my personal laptop and charging it for 20 seconds before stopping the socket again.

### Manual Intervention

- Socket was `off` before starting.

## Results

Check the results through the [energy-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#parallel-processes/run-1/energy-monitor.html) and the [server-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#parallel-processes/run-1/server-monitor.html) files.
