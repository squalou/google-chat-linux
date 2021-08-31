#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo $SCRIPTPATH
export NODE_PATH="$SCRIPTPATH/node_modules/.bin"
export PATH=$NODE_PATH:$PATH
export GTK_USE_PORTAL=1

${NODE_PATH}/electron  "${SCRIPTPATH}/src/index.js" --trace-warnings

