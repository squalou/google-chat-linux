#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo $SCRIPTPATH
export NODE_PATH="$SCRIPTPATH/node_modules/.bin"
export PATH=$NODE_PATH:$PATH
export ELECTRON_DISABLE_SANDBOX=true
export NODE_OPTIONS="--no-force-async-hooks-checks"

${NODE_PATH}/electron "${SCRIPTPATH}/src/index.js"

