# 🧪 Start Wait Stop Testset

This directory contains all the runs for the Start Wait Stop testset.

## 💡 Explanation

### Simple

So... We just want to charge our phone or something, right? The important thing is that the charger is connected to our start socket. Thus, we want to start the socket, wait for it to charge for a certain duration, and then stop it. Tada, that's it 🎉

Once again, check out my personal explanation of the testset in the document [start-wait-stop](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop.pdf) 🚀

### More Technical

The scenario that's happening here is that we are starting a subprocess, waiting for it to finish, and then stopping it. This is a very basic testset that is used to verify the basic functionality of our application.

## 📊 Process Graph

![Process Graph](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop/start-wait-stop.svg)

## HTML Reports

Please click on each [`run-<x>/README.md`] to view what is happening in each run and further information on why is a run different from another.

- [Run 1](run-1/README.md)
- [Run 2](run-2/README.md)
- [Run 3](run-3/README.md)
- [Run 4](run-4/README.md)
- [Run 5](run-5/README.md)

## Run the thing online!

You can start a process through this link which will take you to cpee.org and start the process for you! [Click me to create a process and get started!](https://cpee.org/flow/graph.html?load=https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop/start-wait-stop.xml)
