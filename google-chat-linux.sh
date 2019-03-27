#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
export NODE_PATH="$SCRIPTPATH/node_modules/.bin"
export PATH=$NODE_PATH:$PATH
export ELECTRON_DISABLE_SANDBOX=true

${NODE_PATH}/electron $SCRIPTPATH

