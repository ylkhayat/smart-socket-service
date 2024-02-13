# 🧪 Start Wait Stop Testset - Run 5

A run is simply the environment or the setup in which the testset was executed.

## 📊 Process Graph

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop/start-wait-stop.svg)

## 📋 Description

Quoting the description from the main `start-wait-stop` README:

> So... We just want to charge our phone or something, right? The important thing is that the charger is connected to our start socket. Thus, we want to start the socket, wait for it to charge for a certain duration, and then stop it. Tada, that's it 🎉
>
> Once again, check out my personal explanation of the testset in the document [start-wait-stop](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop.pdf) 🚀

For this run, the testset was executed for me, connecting my personal laptop and charging it for 20 seconds before stopping the socket again.

### Manual Intervention

- Socket was `off` before starting.
- I manually turnt `off` the socket after some time of charging.
- Then I manually turnt `on` the socket again after some time of turning it `off`.

## Results

Check the results through the [energy-monitor.html](./energy-monitor.html) and the [server-monitor.html](./server-monitor.html) files.
