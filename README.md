Tray has changed ... again
https://github.com/electron/electron/pull/36472
https://github.com/electron/electron/pull/36333
https://github.com/electron/electron/issues/36602

broken *again* on electron 22+

See below Changelog **5.24.19-1**

# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

upstream project : https://github.com/robyf/google-chat-linux
clever other for : https://github.com/ankurk91/google-chat-electron

See [Systray support](#systray-support) notes.

## Windows support

Electron is cross platform. I added the minimum required tweaks to have a decently working app on Windows. You can install the _Setup_.exe from [releases](https://github.com/squalou/google-chat-linux/releases).

There will be "SmartScreen" warning about how unsafe this `.exe` is, Windows pretending it has detected something nasty and is protecting you. **I Don't Care** and won't buy a certificate.

If you're not happy with this, build from sources with `npm install && npm run dist` or get a proper OS with a proper distribution system.

## Linux dependencies

Starting with 5.14.x, xdg-desktop-portal must be installed. It's probably already the case on most distributions. [see here](README.md/#support-native-filechooser)

Dependency is taken care of in AUR Arch package and Debian package.

## Wayland support

### TL/DR; 

Run with **both** command line options : `--enable-features=WaylandWindowDecorations --ozone-platform-hint=auto`


### Detailed story

Electron 20 introduced a command line to mimic chromium way to switch to Wayland if available. Simply run electron ap with `--ozone-platform-hint=auto` to make it use Wayland if available, Xorg else. The default value is `default` and does not try Wayland at all.

This has side effects on window decoration (absent on Gnome for instance).

Another side effect is the lack of notification in systray. (Which only works already with a workaround on Gnome, see further). 

So you have to enable yet another feature flag (see https://github.com/electron/electron/pull/29618) `--enable-features=WaylandWindowDecorations`

So, feel free to enable **both** options if you want, it will work with this lmitation.

I first enforced the ozone flag in the .desktop shortcut, bad idea sorry about that ;-), forget the 5.21-18-2 version.

I didn't find a way to make this a runtime option, this setting must be taken into account very early in electron startup I'm not even sure it's possible to do that.

So, **to use electron's Wayland rendering** edit `/usr/share/applciations/google-chat-linux.desktop` and add `--enable-features=WaylandWindowDecorations --ozone-platform-hint=auto`.

## CHANGELOG and news

See full [CHANGELOG](./CHANGELOG.md).

### 5.24.19-3

Clean links from google decoration before opening them (https://github.com/squalou/google-chat-linux/issues/66)

### 5.24.19-2

Fix open links in external browser (https://github.com/squalou/google-chat-linux/issues/65)

### 5.24.19-1

Update to electron 24.

**Why ?**

Some functionalities are blocked for older browsers, for instance "quoted-reply", which has finally arrived in google chat. (2023, hello guys, wake up)

**Bad news**

electron sucks with Tray ... again

gnome users will want to try https://extensions.gnome.org//extension/615/appindicator-support/

instead of Ubuntu Appindicators (if in use on the distro)

Note that ... looks like it's a crappy situation (again)
- Ubuntu Appindicator required for electron -> 21, wont work for 22+
- Appindicator and KStatusNotifierItem required for electron 22+

AND THEN AGAIN ! Double click must be used instead of single click,

and that shit is on Gnome only, and of course poor to no wayland support

Tray F***ng Icons still failing in 2023, not like it's been around since 28 years.


**Weird news** though : notification on application shortcut seems to work on Gnome ... only when app is launched from sources ! (`./google-chat-linux.sh`)

I'm probably definitively done with this electron nightmare.

Best solution is probably hte ArchLinux packagine approach : without electron embedded/packaged. go wonder.

I've added `google-chat-linux-nvm-launcher.sh` that uses nvm, uses `nvm use --lts`, then starts `./google-chat-linux/google-chat-linux.sh`,
it can be referenced in a local .desktop file, and it will work. That's hjow I personally launch it.


### 5.21.19-1

- https://github.com/squalou/google-chat-linux/issues/51 : manually set `NO_REDIRECT_URL` to solve login with custom OAuth SSO providers issues. Comma separated list of urls is accepted ! (see issue in github for more details)

### 5.21.18-3

- remove `--ozone-platform-hint=auto` from default launcher
- add a word in README about wayland
 
### 5.21.18-2

- update to electron 21
- set `--ozone-platform-hint=auto` to for better wayland support when available.

### 5.20.18-1

- update to electron 20
- Fix #54 (systray in wayland)

### 5.15.17-1

Fix #40 : client breaks out to browser when login needed.

### 5.15.16-2

Fix language support https://github.com/squalou/google-chat-linux/issues/42

Add "languages": ["fr","en-US"] in the json to override default OS locale.

### 5.15.16-1

electron 15

### 5.14.16-1

* Good Bye Themes ! (they didn't work anymore anyway)
* Good bye Old UI support : Google removed it

This **may be the last version**, since ... it doesn't bring anything more than using Ferdi, or the native "installed" app from Chrome. Except systray integration 
for people where it works anyway.


5.14.15-1

* electron 14
* support native filechooser instead of GTK only. [see here](README.md/#support-native-filechooser)
* WARNING : native filechooser may not work as nicely as expected on all distributions, see [#38](https://github.com/squalou/google-chat-linux/issues/38)

5.12.14-1

Details about systray click behaviour and google account login page.

5.12.13-2

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

## versioning scheme

Starting with 5.11.9-1 :

- first number is internal architecture, won't change anytime soon
- second is the electron version.
- third is a 'feature' level
- dash-number is a packaging number : same features, only minor bugfix and packaging changes : no news, only better things

## support native filechooser

   * make sure you install `xdg-desktop-portal` or `xdg-desktop-portal` or `xdg-desktop-portal-kde` or `xdg-desktop-portal-wlr` ... depending on your DE and distrib.
   * logout / login and open google-chat-linux, whenever needing to use the filechooser it should use your DE default one.

Troubleshooting

   * in case nothing happens when needing to upload / download a file
      * launch from console, and check for `Can't open portal file chooser: GDBus.Error`. If
   it is displayed, then your `xdg-desktop-portal` is not installed.

   * if the wrong filechooser is displayed (gtk on kde), make sure `GTK_USE_PORTAL=1` is set. It should be set by the app itself, you may want to set it yourself and check if it works better. `export GTK_USE_PORTAL=1; /opt/google-chat-linux/google-chat-linux` for instance

      * if necessary set `GTK_USE_PORTAL=1` in your login script (`/etc/profile.d/custom.sh`, or `$HOME/.bashrc`, whatever).

## configure spellcheck language

After first run, quit, then edit $HOME/.config/google-hangouts-chat-linux.json, add "languages": ["fr","en-US"] in the json to override default OS locale.

## auth with third party provider

If your login redirects to some OAuth provider (other than Google), login may fail.

In Menu (Alt, or systray right click), choose `use third party auth mode`. Login should work but you loose some features (systray related). Use the same menu after login to restore normal mode. Repeat anytime login is required.

**NEW** Since 5.21.19-1 you can also set `NO_REDIRECT_URL` environment variable to the url (or a comma separated list of urls) of the OAuth provider.

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

### Arch (Manjaro, Anarchy)

a package 'google-chat-linux-bin' is availabe on AUR for Arch Linux and derivatives.

### Debian based (Ubuntu, Mint ...)

[Have a look in tags](https://github.com/squalou/google-chat-linux/tags) section, download the relevant .deb file and install with `sudo dpkg -i <package-name.db>` command. (Thank you CYOSP ;-) )

**Tested on** Ubuntu 18.04, 20.04, 21.04, Mint 20.1

**Note** some environment variables are set in index.js : GTK_USE_PORTAL, ELECTRON_DISABLE_SANDBOX and NODE_OPTIONS="--no-force-async-hooks-checks". This *should* work. Else, set them manually.

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

