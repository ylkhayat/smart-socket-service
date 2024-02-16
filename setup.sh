#!/bin/bash

source .env.example

read -p "Enter the server port (default: $PORT): " input
PORT=${input:-$PORT}

read -p "Enter the MQTT protocol (default: $MQTT_PROTOCOL): " input
MQTT_PROTOCOL=${input:-$MQTT_PROTOCOL}

read -p "Enter the MQTT host (default: $MQTT_HOST): " input
MQTT_HOST=${input:-$MQTT_HOST}

read -p "Enter the MQTT port (default: $MQTT_PORT): " input
MQTT_PORT=${input:-$MQTT_PORT}

read -p "Enter the MQTT username (default: $MQTT_USERNAME): " input
MQTT_USERNAME=${input:-$MQTT_USERNAME}

read -p "Enter the MQTT password (default: $MQTT_PASSWORD): " input
MQTT_PASSWORD=${input:-$MQTT_PASSWORD}

read -p "Enter the MQTT client ID (default: $MQTT_CLIENT_ID): " input
MQTT_CLIENT_ID=${input:-$MQTT_CLIENT_ID}

read -p "Enter the MQTT topic (default: $MQTT_TOPIC): " input
MQTT_TOPIC=${input:-$MQTT_TOPIC}

while true; do
    read -p "Should we enable logging? (default: $LOGGING_ENABLED): " input
    input=${input:-$LOGGING_ENABLED}
    case $input in
    [Tt]rue)
        LOGGING_ENABLED=True
        break
        ;;
    [Ff]alse)
        LOGGING_ENABLED=False
        break
        ;;
    *) echo "Please answer True or False." ;;
    esac
done

cat <<EOF >.env
PORT=$PORT
MQTT_PROTOCOL=$MQTT_PROTOCOL
MQTT_HOST=$MQTT_HOST
MQTT_PORT=$MQTT_PORT
MQTT_USERNAME=$MQTT_USERNAME
MQTT_PASSWORD=$MQTT_PASSWORD
MQTT_CLIENT_ID=$MQTT_CLIENT_ID
MQTT_TOPIC=$MQTT_TOPIC
LOGGING_ENABLED=$LOGGING_ENABLED
EOF

echo "Configuration saved to .env! 🚀"
