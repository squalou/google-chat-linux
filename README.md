# google-chat-linux-git

An electron-base client for Google Hangouts Chat, since Google didn't see fit to provide one.

upstream project : https://github.com/robyf/google-chat-linux

I'm not the author of the app : praise **robyf** for his excellent work.

I'm barely maintaining it for my own use now that he left off.

# make it work manually

electron 5 beta is required
```sh
npm install electron@beta
```

fix the rights on sandbox executable as the error message will suggest, OR if you're in a hurry :

```sh
export PATH=/path/to/node_modules/.bin:$PATH
export ELECTRON_DISABLE_SANDBOX=true; electron .
```

# package

a package 'google-chat-linux-git' is availabe on AUR for Arch Linux and derivatives.

