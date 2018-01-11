// twocaptcha.js [@eggins] [@hunter_bdm]

// define imports
const electron = require('electron');
const readline = require('readline');
const moment = require('moment');
const StreamDeck = require('elgato-stream-deck');
const fs = require('fs');
const path = require('path');
const {app, Menu, Tray, BrowserWindow} = electron;

global.log = require('./classes/logger');
global.t = require('./classes/tools');
global.d = require('./classes/data');
global.gui = require('./classes/gui');
global.update = require('./classes/update');
global.isDev = require('electron-is-dev');

log("-----------------------")
log("crypto-streamdeck", "info")
log("developed by: [@hunter_bdm]", "info")
log("-----------------------")

global.images = {};
global.mainPath = process.env.APPDATA + '/crypto-streamdeck'
global.myStreamDeck = new StreamDeck();
myStreamDeck.setBrightness(50);

const init = function() {
	app.on('ready', function() {
		t.loadFont(path.resolve((isDev) ? './Fonts/SourceSansPro-Regular.ttf' : './resources/app/Fonts/SourceSansPro-Regular.ttf'), 'Source Sans Pro');

		if (!fs.existsSync(mainPath + '/imgs')){
			fs.mkdirSync(mainPath + '/imgs');
		}

		if (!fs.existsSync(mainPath + '/coins.json')) {
			fs.writeFileSync(mainPath + '/coins.json', '[]');
			gui.createMainWindow(true);
		}
		else
			gui.createMainWindow(false);

		global.coins = t.load(mainPath + '/coins.json', true);
		t.removeLastPrices();

		for (let i = 0; i < coins.length; i++) {
			t.pullImage(coins[i].name);
		}

		setInterval(() => {
				for (let i = 0; i < coins.length; i++) {
					t.getPrice(coins[i], (price) => {
						if (coins[i].lastPrice != price) {
							coins[i].lastPrice = price;
							log(`${coins[i].ticker} now at ${price}`, 'info');
							t.buildImage(images[coins[i].name], price, coins[i].name, (ranName) => {
								t.setImage(coins[i].position, `${mainPath}/imgs/${ranName}.png`);
							});
						}
					})
				}
		}, 5000);
	})
}

switch (process.argv[1]) {
    case '--squirrel-firstrun':
		update.createShortcut(function() {
			app.quit();
		});
      	break;
    case '--squirrel-install':
		update.createShortcut(function() {
			app.quit();
		});
      	break;
    case '--squirrel-uninstall':
		update.removeShortcut(function() {
			app.quit();
		});
      	break;
	case '--squirrel-obsolete':
		app.quit();
		break;
    case '--squirrel-updated':
		app.quit();
		break;
    default:
      	init();
}