declare global {
    namespace NodeJS {
        interface ProcessEnv extends NodeJS.ProcessEnv {
            PORT: string;
            MQTT_PROTOCOL: string;
            MQTT_HOST: string;
            MQTT_PORT: string;
            MQTT_CLIENT_ID: string;
            MQTT_USERNAME: string;
            MQTT_PASSWORD: string;
            MQTT_TOPIC: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }