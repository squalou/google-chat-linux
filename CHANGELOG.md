# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

## CHANGELOG

### 5.11.9-1

Move to **electron 11** that brings *Apple M1* native support.

Change versioning scheme : 
- first number is internal architecture, won't change anytime soon
- second is the electron version.
- third is a 'feature' level
- dash-number is a packaging number : same features, only minor bugfix and packaging changes : no news, only better things


### 0.5.8-1

add FAKE `libappindicator3.so` and `libappindicator3.so1` in /opt/google-chat-linux to fix left click on TRay icon.

**In case tere are side effects** ... remove the files, and open an issue, I'll see what I can do.

see https://github.com/electron/electron/issues/14941

### 0.5.7 : support for external auth system at login page 

0.5.7-5: add "third party auth" in systray menu, and fix a bug there by the way

0.5.7-4: on Force reload : re-apply theme if needed. Useful when Gogole forces a "REFRESH" action that tends toremove theme.

0.5.7-3: cleanup Menu.  Use `Menu / Use temporary thirs party auth mode` in case your login doesn't work (see 0.5.7-2)

0.5.7-2: better support for external auth system at login page (starting with 0.5.7-1 but incomplete)

- add option to disable Node Integration (from Menu). It breaks systray **but** may help with some auth redirection mechanisms (Atlassian Crowd for instance)
- add option to keep  all URL's inside electron client (from Menu), to help debugging some situations
- always keep chat.google.com url inside client

Google 'refresh' action stays inside client.

The "Menu" shows up when hitting "Alt" key.

### 0.5.6

electron 10

### 0.5.2

customize spellcheck language (Windows + Linux) by editing `$HOME/.config/google-hangouts-chat-linux.json`, add `"languages": ["fr","en-US"]` in the json for instance to override default OS locale.

### 0.5.1

Alt-Left / Alt-Right navigation shortcuts are disabled now by default. Reenable them in menu (restart required)

### 0.5.0-3

Electron 9, which has reverted to 'old' systray integration. Should help someDE users to have this work.

**Notes** 

* going back to electron 8 or previous is not as simple as changing version in package.json anymore. Look at package.json history to see the changes.
* packages 0.5.0-1 and 0.5.0-2 do **not** work. Avoid tthem, use 0.5.0-3.


### 0.4.4

- Secure tray icon change.
- Avoid renderer processes to be restarted on every navigation. 
- Add 'About' menu to display version.
- Restart app to 'keep minimized' configuration takes effect.

### 0.4.3

- by default keep window in windows list when 'closing'. Add a 'view' menu to change back to previous behaviour : hiding on 'close'. This is done for DE that does NOT display systray of eletron 8 : *Cinnamon* for instance, any DE that doesn't handle well 'appindicator' in electron 8.
- At first run, shows in windows list on close to prevent lost windows on those DE.
- Change color of minimized window icon for those DE.

### 0.4.2 adds a "Menu" in app, press Alt to reveal it. It's the same as systray menu, for OS's where systray is not (yet?) properly supported

from 0.4.1 : update to electron 8 for better Systray compatibility on linux when appindicator lib is used. see https://github.com/electron/electron/issues/21445. You may have to install some plugnis depending on your DE (xfce4-statusnotifier-plugin for instance)

from 0.4.0 on : **systray** color works without hidden window, so everything should be ok again!

from 0.3.2 on : **systray icon color change IS BACK** through the use of a hidden window ... kind of dirty but seems to work.

on version 0.3.0 and 0.3.1 : **systray icon color change does not work anymore**, I volontarily removed it. Why ? It requires "nodeIntegration: true" in electron, which in turn breaks the "Search" for people (Ctrl K), which is much, much more useful than the icon color change.

As a compensation, there is a custom theme ... :) (activate it from systray menu)

