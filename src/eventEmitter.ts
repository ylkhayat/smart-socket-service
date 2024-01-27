import EventEmitter from "events";
class Emitter extends EventEmitter {}
const mqttEventEmitter = new Emitter();
export default mqttEventEmitter;
