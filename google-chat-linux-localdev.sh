#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cp -rf assets/icon node_modules/electron/dist/resources/
echo $SCRIPTPATH
export NODE_PATH="$SCRIPTPATH/node_modules/.bin"
export PATH=$NODE_PATH:$PATH
# GTK_USE_PORTAL=1 is set from index.js
# for wayland : --ozone-platform=wayland
${NODE_PATH}/electron  "${SCRIPTPATH}/src/index.js" --trace-warnings "$@" 

