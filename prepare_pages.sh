#!/bin/bash

find ./docs -type f -name "*.log" | while read -r file; do
    echo "Processing ${file}"
    cat "${file}" | aha >"${file%.log}.html"
done

node docs/testsets/js/generate-tree.js
