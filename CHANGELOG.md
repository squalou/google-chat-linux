# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

## CHANGELOG

### 5.24.30-1

Prevent several instances of google chat linux to be launched simultaneously. (https://github.com/squalou/google-chat-linux/issues/67)

* Under X.Org : Starting a new one will restore and focus the existing one.
* Under Wayland : it depends, with Gnome a notification is displayed but no focus given.


### 5.24.19-4

Clean MORE links (https://github.com/squalou/google-chat-linux/issues/66)
### 5.24.19-3

Clean links from google decoration before opening them (https://github.com/squalou/google-chat-linux/issues/66)

### 5.24.19-2

Fix open links in external browser (https://github.com/squalou/google-chat-linux/issues/65)

### 5.24.19-1

- Update to electron 24 to support new functions added to google chat (quote reply among them). As a result, tray icon support gets worse. See https://github.com/squalou/google-chat-linux/issues/63
- Clean some outdated icons.

### 5.21.19-1

- https://github.com/squalou/google-chat-linux/issues/51 : manually set `NO_REDIRECT_URL` to solve login with custom OAuth SSO providers issues. Comma separated list of urls is accepted ! (see issue in github for more details)

### 5.21.18-3

- remove `--ozone-platform-hint=auto` from default launcher
- add a word in README about wayland

### 5.21.18-2

- update to electron 21
- set `--ozone-platform-hint=auto` to for better wayland support when available. (https://releases.electronjs.org/releases/stable?version=21&page=6&limit=2)

### 5.20.18-1

- update to electron 20
- Fix #54 (systray in wayland)


### 5.15.17-1

Fix #40 : client breaks out to browser when login needed.

### 5.15.16-2

Fix language support https://github.com/squalou/google-chat-linux/issues/42

Add "languages": ["fr","en-US"] in the json to override default OS locale.

### 5.15.16-1

Update to electron 15.3.2

### 5.14.16-1

* Good Bye Themes !
   * they never worked in new UI
   * they ceased to work in old UI
   * new UI has native dark theme support ...
   * ... no more theme support !
* Good bye Old UI support : it was finally completely disabled by Google.

### 5.14.15-1

* electron 14
* support native filechooser instead of GTK only.
   * make sure you install `xdg-desktop-portal-gtk` or `xdg-desktop-portal-kde` or xdg-desktop-portal-wlr ... depending on your DE and distrib.
   * `GTK_USE_PORTAL=1` is set at startup by the application. If it fails you may want to set it in your login script (.bashrc, /etc/profile.d/custom.sh ...)
   * logout / login and open google-chat-linux, whenever needing to use the filechooser it should use your DE default one.
   * details here https://tristan.partin.io/blog/2021/04/01/electron-linux-and-your-file-chooser

### 5.12.14-2
- apply node dependencies security fixes

### 5.12.14-1
- Fix #36 : google account login page stays inside client instead of opening in default browser
- Improve #37 : click systray when window is visible without focus gives focus. When has focus : hides it.

### 5.12.13-2

- Fix again old notifications : too many favicons were selected, the wrong ones got displayed.
### 5.12.13-1

- Fix support for new chat UI notifications
- Cleaner notification detection with ipcRenderer, thanks to @ankurk91 (check his fork here https://github.com/ankurk91/google-chat-electron)
- Runs now in sandbox and with contextisolation

### 5.12.12-1

Allow to open previous chat url to restore previous behaviour and fix notification in systray + theme support. (see #35)

### 5.12.11-2

fix #34 : Additional 'Advanced' option to open urls using `xdg-open` rather than `shell.openExternal`. Works better for some users.
### 5.12.11-1

Better windows support :
- add taskbar menu to Quit
- remove option to hide from taskbar (new windows paradigm tends to do without systray and use taskbar instead)

### 5.12.10-1

Upgrade electron version to 12.

With electron 12 : The default values of contextIsolation and worldSafeExecuteJavaScript are now true. #27949 #27502
As a result in this app : contextIsolation is forced to `false` in order to have systray integration work as previously.

### 5.11.10-2 and -3

Upgrade dependencies (vulnerability fix)

Add "windows" packaging configuration : `npm run dist` produces a nice installer on windows platform now :-)

### 5.11.10-1

Add a secondary "dark theme" accessible in "View" Menu.

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

