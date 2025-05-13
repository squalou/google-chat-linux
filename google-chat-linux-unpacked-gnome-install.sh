#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

npm install && npm run dist
rm -f ~/.local/share/applications/google-chat.desktop
rm -f ./google-chat.desktop
cp ./google-chat.desktop.template ~/.local/share/applications/google-chat.desktop
sed -i "s|{{CURRENT_DIR}}|$SCRIPT_DIR|g" ~/.local/share/applications/google-chat.desktop
update-desktop-database ~/.local/share/applications/
