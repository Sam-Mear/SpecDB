# SpecDB

SpecDB is a beautiful and easy-to-use AMD equivalent to Intel's ARK. It's powered by Mithril and Browserify on the front-end, and has no backend (just static files).

SpecDB (master branch) is live at https://specdb.info/, and the beta branch is deployed at https://beta.specdb.info/

Visit our [Discord channel](https://discord.gg/xfVHZAb) to chat with other developers!

Look at the [wiki](https://github.com/markasoftware/SpecDB/wiki) for more detailed technical info than this readme!

## Setting up

1. Update your Node.js to latest version (see https://nodejs.org)
2. Clone the repo — `git clone https://github.com/markasoftware/SpecDB.git`
3. `cd SpecDB`
4. `npm install` — install project dependencies
5. On Mac or Linux, from the project's root directory, execute `npm run build` to build it. You can also run `build/build.bash` if `npm run build` is too slow for you. If you're on Windows, run `build\build-win.bat` instead. You can also just navigate to that directory in a file manager and double click `build-win.bat` if you're a terminal-o-phobe.

Then, you can view SpecDB at file:///home/markasoftware/whatever/specdb/, which should be good enough for development. You may wish to use a proper file server, like Nginx, instead.

## Contributing

Specs are in the specs/ folder. You can probably see how they're done by looking at the files there, but there's more detailed documentation in the [wiki](https://github.com/markasoftware/SpecDB/wiki). Additionally, some rudimentary Node.js scripts which can be used to make part creation a bit easier are there.

To contribute, please make a fork, and in your fork branch off from master to something like `myusername-bulldozer-cpus`, and when making a pull request, go from that branch to `beta`.

## BrowserStack

![BrowserStack logo](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)

Browserstack won't let me get their open-source plan without including their logo here. I can tell they really love open source and aren't just trying to get free advertising. Especially since the Browserstack backend/whatever is used to do real-device testing remotely isn't open source. But whatever, they're the only ones who provide decent real-device testing so I guess I have to use them because I don't want to buy Apple shit.
