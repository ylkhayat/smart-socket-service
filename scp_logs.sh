#!/bin/bash

# Check if a folder name was provided as an argument
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <testset-name> <folder-name>"
    exit 1
fi

if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Assign the first argument to a variable
TESTSET_NAME=$1
FOLDER_NAME=$2

# Define the remote directory path
REMOTE_DIR="/home/students/ge86xiq/smart-socket-service"

# Define the local directory path, incorporating the folder name
LOCAL_DIR="$HOME/Desktop/masters/local/PRAK/smart-socket-service/docs/testsets/$TESTSET_NAME/$FOLDER_NAME"

# Create the local directory if it doesn't exist
mkdir -p "$LOCAL_DIR"

# File names to copy
FILES=("server-monitor.log" "energy-monitor.log")

# Loop through the files and copy each one
for FILENAME in "${FILES[@]}"; do
    echo "Copying $FILENAME to $LOCAL_DIR"
    scp "$REMOTE_SERVER:$REMOTE_DIR/$FILENAME" "$LOCAL_DIR/$FILENAME"
done

echo "Files have been copied to $LOCAL_DIR"
