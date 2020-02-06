# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

upstream project : https://github.com/robyf/google-chat-linux

I'm not the author of the app : praise **robyf** for his excellent work.

I'm barely maintaining it for my own use now that he left off.

## IMPORTANT NEWS

from 0.4.1 : update to electron 8 for better Systray compatibility on linux when appindicator lib is used. see https://github.com/electron/electron/issues/21445. You may have to install some plugnis depending on your DE (xfce4-statusnotifier-plugin for instance)

from 0.4.0 on : **systray** color works without hidden window, so everything should be ok again!

from 0.3.2 on : **systray icon color change IS BACK** through the use of a hidden window ... kind of dirty but seems to work.

on version 0.3.0 and 0.3.1 : **systray icon color change does not work anymore**, I volontarily removed it. Why ? It requires "nodeIntegration: true" in electron, which in turn breaks the "Search" for people (Ctrl K), which is much, much more useful than the icon color change.

As a compensation, there is a custom theme ... :) (activate it from systray menu)

## build and run

```sh
npm install
./google-chat-linux.sh
```

## make it work manually

electron 6 beta is required, 7 recommended
(works with 5.0.1 and up, with some minor annoyances)

```sh
npm install electron
export PATH=$HOME/node_modules/.bin:$PATH
```

fix the rights on sandbox executable as the error message will suggest:

```sh
sudo chown root:root $HOME/node_modules/electron/dist/chrome-sandbox && sudo chown 4755 $HOME/node_modules/electron/dist/chrome-sandbox
electron .
```
    
OR if you're in a hurry :

```sh
export ELECTRON_DISABLE_SANDBOX=true; export NODE_OPTIONS="--no-force-async-hooks-checks"; electron .
```

## Linux packages

## Arch (Manjaro, Antergos)

a package 'google-chat-linux-git' is availabe on AUR for Arch Linux and derivatives.

## Debian based (Ubuntu, Mint ...)

**Tested on** Ubuntu 18.04, Mint

**Note** some envionment varaibles are set in index.js : ELECTRON_DISABLE_SANDBOX and NODE_OPTIONS="--no-force-async-hooks-checks". This *should* work. Else, set them manually.

Run :

```sh
npm run dist
```

will build a .deb file in `dist/`. Run for instance `sudo dkpg -i dist/google-chat-linux*.deb`.

Installation of the .deb file is tested under Ubuntu, and works fine. Under Mint it installs well but react with emotes crashes the app. Go wonder.

NOTE : to run from a terminal you'll have to :

- either `sudo chown root:root /opt/google-chat-linux/chrome-sandbox && sudo chown 4755 /opt/google-chat-linux/chrome-sandbox` after the .deb is inYYstalled
- or run `export ELECTRON_DISABLE_SANDBOX=true; export NODE_OPTIONS="--no-force-async-hooks-checks"` before the launch of `/opt/google-chat-linux/google-chat-linux`

The provided .desktop file takes care of it, so running from your desktop launcher will work.
