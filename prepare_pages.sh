#!/bin/bash

find . -type f -name "docs/**/*.log" | while read -r file; do
    cat "${file}" | aha >"${file%.log}.html"
done

node docs/testsets/js/generate-tree.js
