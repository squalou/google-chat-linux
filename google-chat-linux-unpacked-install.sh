#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

DATA_HOME=${XDG_DATA_HOME:-"~/.local/share/applications"}

npm install && npm run dist
rm -f $DATA_HOME/google-chat.desktop
rm -f ./google-chat.desktop
cp ./google-chat.desktop.template $DATA_HOME/google-chat.desktop
sed -i "s|{{CURRENT_DIR}}|$SCRIPT_DIR|g" $DATA_HOME/google-chat.desktop
update-desktop-database $DATA_HOME/
