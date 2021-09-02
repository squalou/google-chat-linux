#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo $SCRIPTPATH
export NODE_PATH="$SCRIPTPATH/node_modules/.bin"
export PATH=$NODE_PATH:$PATH
# GTK_USE_PORTAL=1 is set from index.js
${NODE_PATH}/electron  "${SCRIPTPATH}/src/index.js" --trace-warnings

