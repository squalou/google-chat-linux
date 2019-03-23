#!/bin/sh
export PATH=/usr/share/google-chat-linux/node_modules/.bin/:$PATH
export ELECTRON_DISABLE_SANDBOX=true

cd /usr/share/google-chat-linux \
  && electron .

