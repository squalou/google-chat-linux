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

## AppImage support

See further below if you ever need to build an AppImage for your distribution.

## Windows support

Electron is cross platform. I added the minimum required tweaks to have a decently working app on Windows. You can install the _Setup_.exe from [releases](https://github.com/squalou/google-chat-linux/releases).

There will be "SmartScreen" warning about how unsafe this `.exe` is, Windows pretending it has detected something nasty and is protecting you. **I Don't Care** and won't buy a certificate.

If you're not happy with this, build from sources with `npm install && npm run dist` or get a proper OS with a proper distribution system.

## Linux dependencies

Starting with 5.14.x, xdg-desktop-portal must be installed. It's probably already the case on most distributions. [see here](README.md/#support-native-filechooser)

Dependency is taken care of in AUR Arch package and Debian package.

## Message notifications

Desktop notifications show the sender, message text and room information supplied
by Google Chat. In Google Chat settings, enable **Desktop notifications → Allow
chat notifications**. Chat's muted conversations, Do Not Disturb and active-chat
rules still apply; the app does not generate notifications by reading the chat
list or detecting an unread favicon. Your desktop's notification permissions and
Do Not Disturb settings must also allow Google Chat Linux notifications.

The application menu provides:

- **Enable native notifications**: enable or disable all app notifications.
- **Show sender and message preview**: enabled by default. Turn it off to show
  only “Google Chat” and a generic unread-message notice, without sender names,
  message text or notification images.
- **Notification language**: choose the language of the generic notice and test
  notification. Google-provided sender names and messages are not translated.
- **Notification duration**: set separate durations for **With sender and message
  preview** and **Without preview**. Choose 3, 5, 10, 15, 30 or 60 seconds,
  **System default** (the initial setting) or **Until dismissed**.
- **Test native notification**: test the desktop notification service. This does
  not test incoming Google Chat messages or their conversation links.

Message previews are limited to 1024 Unicode code points, including a trailing
ellipsis when truncated. Emoji sequences and combining characters stay intact.
The limit applies to both page and service-worker notifications; the full message
remains available in the conversation.

These settings apply immediately and persist across restarts. Disabling previews
or notifications dismisses existing app notifications. Clicking a notification
restores the main window and preserves Google's conversation click handler; Chat
links opened by that handler reuse the main window. If no handler supplies a
destination, the window is shown without switching conversations.

Duration changes apply to subsequent notifications, including the test
notification. Timed notifications request persistent display, then the app closes
them after the selected number of seconds from their display event. Timers for
page notifications run in the main process so hidden/minimized windows do not
delay dismissal. Your desktop can still dismiss or suppress a banner earlier.
**Until dismissed** requests persistent display without an app timer; **System
default** preserves Google's/your desktop's usual behavior. Closing a notification
also removes it from the notification service, rather than merely hiding its
banner.

For a custom duration, edit `notificationPreviewDurationSeconds` and
`notificationGenericDurationSeconds` in `~/.config/google-hangouts-chat-linux.json`
while the app is closed: integer seconds from 1 to 3600, `0` for the system default,
or `-1` for manual dismissal. Custom values appear checked in the duration menu.

Notifications work while the app is running, including when it is hidden or
minimized and when its tray icon is disabled. They do not work after quitting the
app. Missing message text uses a localized unread-message notice; information
that Google does not supply is not reconstructed.

### Implementation and compatibility

Page notifications retain Chromium's native `Notification` objects and event
handlers. Electron 39 does not implement persistent service-worker notifications,
so `ServiceWorkerRegistration.showNotification()` uses Electron's main-process
notification service. Its click/close events are relayed to the worker's existing
handlers, preserving `notification.data` and `waitUntil()` work. This compatibility
path supplies notification-like objects rather than native persistent
`Notification`/`NotificationEvent` instances; it supports basic notifications,
not notification action buttons or replies. Worker notifications live only for
the running app session.

The renderer now runs sandboxed with Node.js disabled; sandboxed preloads also run
in Chat iframes. The former Advanced-menu Node integration toggle and the legacy
`enableNodeIntegration` setting are no longer used. Launching with `--no-sandbox`
or `ELECTRON_DISABLE_SANDBOX` prevents service-worker preloads from working.

### Notification verification

Run `npm test` for unit tests and `npm run test:notifications:electron` for isolated
Electron checks. The latter uses synthetic pages under intercepted Google origins
in a temporary profile, requires a graphical session (or Xvfb), and does not
contact Google or use your login. It verifies real Chromium notification objects,
iframe/worker adapters, conversation click routing, and live privacy settings;
the persistent-notification OS presenter is stubbed.

Real Google Chat acceptance checks still require receiving a direct message and
a group/space message with desktop notifications enabled. Verify the sender and
text, another message while the favicon stays unread, clicking each conversation,
hidden/minimized windows, muted conversations and Do Not Disturb. Synthetic tests
do not establish which notification API the current Google Chat deployment uses
or prove desktop delivery of real messages.

## Custom CSS

To inject custom CSS, create a file called `custom.css` in `~/.config/google-chat-linux` for Linux or `%APPDATA%\google-chat-linux\` for Windows.

To find out how Google Chat makes their themes, go to Developer Tools (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>) > Sources > `gtn-roster-iframe-id (world)` > `(no domain)` > the large purple CSS file (begins with `/_/scs/mss-static/_/ss/k=boq-dynamite.DynamiteWebUi...`). The file is pretty scattered, but searching for terms such as

- `color-scheme: light;`
- `:root {`
- `[data-theme=dark] {`

can prove to be helpful.

## Open Google Chat URLs from web browser in the app

You can configure your web browser to detect Google Chat URLs and open them in the Google Chat Alt application:

Step 0: Install Google Chat Alt.

Step 1: Install a user script manager. See [Step 1 on Greasy Fork](https://greasyfork.org/) for various options.

Note: the script manager must be able to cope with content security policy (CSP) headers. Tampermonkey on Firefox is known to work.

Step 2: Install the user script [Google Chat Alt landing page](https://greasyfork.org/en/scripts/481609-google-chat-alt-landing-page) by clicking the green install button on the user script's page, and your user script manager will ask you to confirm the install.

Step 3: Try it out by navigating e.g. to https://mail.google.com/chat/ in your web browser. If the user script is working correctly instead of Google Chat web UI your browser should ask you:

> Allow this site to open the gchat link with Google Chat Alt?

You can check the checkmark:

> Always allow [...] to open gchat links

Once you press the button Open Link, Google Chat Alt will be either started or (if you have it already running) restore its window. You can then close the tab in your browser.

Note: If navigating to Google Chat opens Google Chat web UI the user script manager might not be compatible with the user script, Google might have changed something on the web site or you might have failed to install the script properly.

Note: If navigating to Google Chat opens landing page that says "Launching Google Chat Alt" but web browser doesn't ask to open the link in the application, verify if you have installed Google Chat Alt. Running `gio mime x-scheme-handler/gchat` should display `google-chat-linux.desktop` as a default application.

On technical level this functionality works in following way: Google Chat Alt uses [XDG Desktop file to claim to support URI scheme](https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html#uri-schemes-handling) gchat://. No browser is able to handle this (made up) URI scheme but we use this to pass URI to the app. App looks for URI with this scheme and if found, it replaces gchat:// with https:// and navigates to that address. This should work for channel and direct message links out of box.

## Wayland support

### TL/DR; 

Improved with electron 29 : declare environment variable `export ELECTRON_OZONE_PLATFORM_HINT=auto` (values can be `auto`, `x11`, `wayland`), for instance in `.zshenv`, no need to use --ozone-platform flag, so no need to use custom .desktop file !

Improved with electron 27 : WaylandWindowDecorations is now enabled by default.

Run with `--ozone-platform=wayland`.


### Detailed story

Electron 20 introduced a command line to mimic chromium way to switch to Wayland if available. Simply run electron ap with `--ozone-platform-hint=auto` to make it use Wayland if available, Xorg else. The default value is `default` and does not try Wayland at all.

This has side effects on window decoration (absent on Gnome for instance, fixed with electron 27).

Another side effect is the lack of notification in systray. (Which only works already with a workaround on Gnome, see further). 

So you have to enable yet another feature flag (see https://github.com/electron/electron/pull/29618) `--enable-features=WaylandWindowDecorations`

So, feel free to enable **both** options if you want, it will work with this lmitation.

I first enforced the ozone flag in the .desktop shortcut, bad idea sorry about that ;-), forget the 5.21-18-2 version.

I didn't find a way to make this a runtime option, this setting must be taken into account very early in electron startup I'm not even sure it's possible to do that.

So, **to use electron's Wayland rendering** edit `/usr/share/applciations/google-chat-linux.desktop` and add `--enable-features=WaylandWindowDecorations --ozone-platform-hint=auto`.

## CHANGELOG and news

See full [CHANGELOG](./CHANGELOG.md).

### 5.39.29-2

Minor fix : ellipsis too long notification messages.

### 5.39.29-1

Huge improvements with native notifications support, including message preview. See doc above.

### 5.39.28-1

'Quit' behaviour changes.

When using systray : things go on as previously, (including latest improvements especially for KDE quitting)

When **not** using systray, closing window also quits entirely the app. (So, 'Super+Q' on COSMIC or 'Alt F4' elsewhere maybe will indeed Quit)

This is coherent with other great chat apps behaviour, and consistent accrosse DE.

Thanks again to @Adiker ... I guess I found a future maintainer for the day I quit google for good ;)

### 5.39.27-2

Minor additional KDE quit fix.

### 5.39.27-1

Improve Shutdown : now app properly closes when system powers off, thanks to @Adiker !

Fix downloads experience : no more empty window appearing. @Adiker again :)

### 5.39.26-1

Add native notification support (with toggle to disable it if needed). Thanks to @Adiker.

### 5.39.25-1

Fix try icon after Google canged their names *again*.

Several dependencies vulnerability fixes.
### 5.39.24-1

Bump to electron 39.0 as maintainance chore.

Add option (in View menu) to disable use of Tray icon, as it's becoming useless (and painful) in some DE, for instance Cosmic.

### 5.29.23-1

bump electron to 29 with better wayland support. Define `ELECTRON_OZONE_PLATFORM_HINT=auto` to take advantage of it. Values can be `auto`, `wayland`, `x11`, with `auto` being a reasonable default.

Set it in `.zshenv` for instance, and logout / login again. Must be in a placed sourced when .desktop applications launchers are used, will certainly be DE dependant.

### 5.27.23-6 5.27.23-5 5.27.23-4 and 5.27.23-3

empty release - AUR only pkg release version

### 5.27.23-2

Add a menu in 'View' to change tray icon theme.

### 5.27.23-1

Add support for several iconThemes, to match some 'monochrome' desktop themes. 3 values are supported : 

* `default` : the good old green ones
* `colored` : the new colored google ones
* `mono` : an attempt at monochrome icon theme

Edit `~/.config/google-hangouts-chat-linux.json` and set `"iconTheme":"colored"` for instance, then **restart**.

No GUI setting for now.

### 5.27.22-4

Fix systray notification (favicon name changed on google side) see https://github.com/squalou/google-chat-linux/issues/87

### 5.27.22-3

Add a nice pseudo-protocol support : open gchat:// urls in client instead of browser. See "Open Google Chat URLs from web browser in the app" above. 
Thanks again https://github.com/pbabinca !

### 5.27.22-2

* Desktop shortcut name changed to `Google Chat Alt`
* `rpm` build available
* build using containers available

And thank you https://github.com/pbabinca for all this !


`--- %< --- snip` 

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
sudo chown root:root $HOME/node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 $HOME/node_modules/electron/dist/chrome-sandbox
electron .
```
    
Keep the sandbox enabled: the notification service-worker preload requires it.

## Linux packages

### Arch (Manjaro, Anarchy)

a package 'google-chat-linux-bin' is availabe on AUR for Arch Linux and derivatives.

### Debian based (Ubuntu, Mint ...)

[Have a look in tags](https://github.com/squalou/google-chat-linux/tags) section, download the relevant .deb file and install with `sudo dpkg -i <package-name.db>` command. (Thank you CYOSP ;-) )

**Tested on** Ubuntu 18.04, 20.04, 21.04, Mint 20.1

**Note** `GTK_USE_PORTAL` and `NODE_OPTIONS="--no-force-async-hooks-checks"` are set in index.js. The app no longer sets `ELECTRON_DISABLE_SANDBOX`.

### rpm based (Fedora)

[Have a look in tags](https://github.com/squalou/google-chat-linux/tags) section, download the relevant .rpm file and install with `sudo dnf install <package-name.rpm>` command.

### AppImage (useful for arm64 and other distributions)

edit `package.json`, replace target `deb` by `AppImage`.

before

```json
  "build": {
    "appId": "Google Chat Linux",
    "linux": {
      "desktop": {
        "Name": "Google Chat Alt",
        "MimeType": "x-scheme-handler/gchat;"
      },
      "category": "Network;InstantMessaging",
      "target": "deb"  // <--here remove deb and put AppImage
    },
  }
```

then `npm run dist`

The package will be built in `dist` subfolder. AppImage is fine for instance on Asahi Linux on Apple silicium.


### manually build a deb package

You have two options - either install all build dependencies and then run :

```sh
npm run dist
```

Or install docker (or podman) container engine and then create a local container with all build dependencies :

```sh
npm run container:setup
```

and then create the package by running:

```sh
npm run container:build:deb
```

In the end you'll end up with .deb file in `dist/`. Run for instance `sudo dkpg -i dist/google-chat-linux*.deb`.

Installation of the .deb file is tested under Ubuntu, and works fine. Under Mint it installs well but react with emotes crashes the app. Go wonder.

NOTE : to run from a terminal you'll have to :

- either `sudo chown root:root /opt/google-chat-linux/chrome-sandbox && sudo chmod 4755 /opt/google-chat-linux/chrome-sandbox` after the .deb is inYYstalled
- keep the sandbox enabled when launching `/opt/google-chat-linux/google-chat-linux`, so service-worker notifications can work

The provided .desktop file takes care of it, so running from your desktop launcher will work.

## Windows package

A package is available in [releases](https://github.com/squalou/google-chat-linux/releases). Or else build it yourself : 

```sh
npm run dist
```
A _Setup_.exe will be built under `\dist\` directory. 


### rpm based distributions (Fedora)

Install podman (or docker) container engine and then create a local container with all build dependencies :

```sh
npm run container:setup
```

and then create the package by running:

```sh
npm run container:build:rpm
```

In the end you'll end up with .rpm file in `dist/`. Run for instance `sudo dnf install dist/google-chat-linux*.rpm`.

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

### More precisely:

* On Linux the app indicator will be used if it is supported, otherwise GtkStatusIcon will be used instead.
* When app indicator is used on Linux, the click event is ignored.
* https://www.electronjs.org/docs/api/tray
* There is sadly nothing I can do about it. (except cry a bit as such nonsenses and wonder how other apps (slack, telegram) deal with all this)

