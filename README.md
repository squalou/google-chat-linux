# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

upstream project : https://github.com/robyf/google-chat-linux

See [Systray support](#systray-support) notes.

## Windows support

Electron is cross platform. I added the minimum required tweaks to have a decently working app on Windows. You can install the _Setup_.exe from [releases](https://github.com/squalou/google-chat-linux/releases).

There will be "SmartScreen" warning about how unsafe this `.exe` is, Windows pretending it has detected something nasty and is protecting you. **I Don't Care** and won't buy a certificate.

If you're now happy with this, build from sources with `npm install && npm run dist` or get a proper OS with a proper distribution system.


## CHANGELOG and news

See full [CHANGELOG](./CHANGELOG.md).

5.12.13-1

Fix support for new chat UI notifications. Thak you @ankurk91 : you should check his fork https://github.com/ankurk91/google-chat-electron.

Keep mechanism to revert to old one while it still works, UI is so much better.
  
5.12.12-1

Google did it again : a new UI that breaks everything. There is still hope (for a time). Default URL is redirected to https://mail.google.com/chat ...
but previous one is still accessible.

To activate it, go to `Menu`, and tick `use old version of chat` OR `right click` in systray icon and choose `Use previous chat UI`.

I don't know how long it will work but for now, it does and make systray notifiction and theme work again.

5.12.11-2: tweak for linux url open

fix #34 : Additional 'Advanced' option to open urls using `xdg-open` rather than `shell.openExternal`. Works better for some users.

5.12.11-1: better windows support

Respect windows UI integration a bit more.

5.12.10-1: electron 12

- Windows support : `npm install && npm run dist` can now be run on Windows platform to build an installer.

5.11.10-1: add experimental dark theme (activate on "View" menu)

5.11.9-1: electron 11 (*Apple M1* native support)

Change versioning scheme : 
- first number is internal architecture, won't change anytime soon
- second is the electron version.
- third is a 'feature' level
- dash-number is a packaging number : same features, only minor bugfix and packaging changes : no news, only better things

## configure spellcheck language

After first run, quit, then edit $HOME/.config/google-hangouts-chat-linux.json, add "languages": ["fr","en-US"] in the json to override default OS locale.

## auth with third party provider

If your login redirects to some OAuth provider (other than Google), login may fail.

In Menu (Alt, or systray right click), choose `use third party auth mode`. Login should work but you loose some features (systray related). Use the same menu after login to restore normal mode. Repeat anytime login is required.

## Freeze ?

If sometimes the app looks like beeing frozen, and comes back to life after a few seconds, you may want to try `--disable-gpu` flag when starting the app from a terminal. It is a known issue with electron, especially with intel video drivers (you may want to try modesetting driver instead by the way).

You may want to /usr/share/applciations/google-chat-linux.desktop and add the flag on the `Exec` line. (do it at each new version or copy the .desktop file to `$HOME/.local/share/applications/`)

## build and run

```sh
npm install
./google-chat-linux.sh
```

## make it work manually

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

### Arch (Manjaro, Antergos)

a package 'google-chat-linux-bin' is availabe on AUR for Arch Linux and derivatives.

### Debian based (Ubuntu, Mint ...)

[Have a look in tags](https://github.com/squalou/google-chat-linux/tags) section, download the relevant .deb file and install with `sudo dpkg -i <package-name.db>` command. (Thank you CYOSP ;-) )

**Tested on** Ubuntu 18.04, 20.04, Mint

**Note** some environment variables are set in index.js : ELECTRON_DISABLE_SANDBOX and NODE_OPTIONS="--no-force-async-hooks-checks". This *should* work. Else, set them manually.

### manually build a deb package

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

## Windows package

A package is available in [releases](https://github.com/squalou/google-chat-linux/releases). Or else build it yourself : 

```sh
npm run dist
```
A _Setup_.exe will be built under `\dist\` directory. 


## Systray Support

**Note** : from 0.5 on, electron 9 bring back Tray integration BUT "click" events are ignored.

### Workaround for the tray 'click' event


```bash
sudo touch /opt/google-chat-linux/libappindicator3.so
sudo touch /opt/google-chat-linux/libappindicator3.so.1
```

this way : left click raises the window again !

These files are added in distributed packages... in hope there are no side effects.


https://github.com/electron/electron/issues/14941

### More precisely :

* On Linux the app indicator will be used if it is supported, otherwise GtkStatusIcon will be used instead.
* When app indicator is used on Linux, the click event is ignored.
* https://www.electronjs.org/docs/api/tray
* There is sadly nothing I can do about it. (except cry a bit as such nonsenses and wonder how other apps (slack, telegram) deal with all this)


**Note** : from 0.4.1 on, electron moved to electron-8, with a different Tray integration implementation. It may fail to work with some window managers (Cinnamon is one of them)

See https://github.com/electron/electron/issues/21445

To use previous Tray implementation :
- edit package.json
- replace `"electron": "^8.0.0"` by `"electron": "^7.0.0"`
- run `npm install`and give it a try. (npm start or ./google-chat-linux.sh, see below for detailed instructions)

