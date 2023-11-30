#!/bin/bash

set -eu

image=${CONTAINER_IMAGE_NAME:-"google-chat-linux-containerbuild"}

# Initialize CONTAINER_ENGINE with a default value if not already set
CONTAINER_ENGINE=${CONTAINER_ENGINE:-}

# Check if CONTAINER_ENGINE is set and valid
if [ -n "$CONTAINER_ENGINE" ]; then
    if ! type "$CONTAINER_ENGINE" &> /dev/null; then
        >&2 echo "The specified CONTAINER_ENGINE '$CONTAINER_ENGINE' does not exist or is not executable."
        exit 1
    fi
else
    # If CONTAINER_ENGINE is empty, try setting it to podman or docker
    if type podman &> /dev/null; then
        CONTAINER_ENGINE="podman"
    elif type docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
    else
        >&2 echo "Neither podman nor docker container engines found."
        exit 1
    fi
fi

if ! "${CONTAINER_ENGINE}" inspect "${image}" >/dev/null; then
    echo "Container image ${image} not found. Have you run npm run container:setup?"
    exit 1
fi

# Adapted https://www.electron.build/multi-platform-build#docker to podman
"${CONTAINER_ENGINE}" run --rm -ti \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v "${PWD}:/project:Z" \
  -v "${PWD##*/}-node-modules:/project/node_modules:Z" \
  -v ~/.cache/electron:/root/.cache/electron:Z \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder:Z \
  "${image}" "$@"
