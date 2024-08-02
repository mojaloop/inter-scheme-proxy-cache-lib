#!/bin/bash

while [ "$(docker ps --format '{{.Names}}:{{.Status}}' | grep -v 'healthy')" != "" ]; do
  echo "Waiting for Docker containers to be healthy..."
  sleep 10
done