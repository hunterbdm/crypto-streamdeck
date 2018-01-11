const {BrowserWindow, ipcMain, Menu, Tray, app} = require('electron');
const fs = require('fs');
const isDev = require('electron-is-dev');

let gui = {};

gui.createMainWindow = function(show) {
    gui.createListeners();
    global.mainWin = new BrowserWindow({
        height: 450,
        width: 450,
        show: show,
        minHeight: 450,
        minWidth: 450,
        maxHeight: 450,
        maxWidth: 450,
        icon: './images/logo.png'
    })
    mainWin.loadURL(`file://${__dirname}/../html/index.html`);
    mainWin.setMenu(null);
    if (isDev) mainWin.openDevTools();

    mainWin.on('minimize', function(event){
        event.preventDefault();
        mainWin.hide();
    });

    app.on('window-all-closed', () => {
        app.quit();
    })
}

gui.createListeners = function() {
    ipcMain.on('ready', function(event, data) {
        log('Renderer ready!', 'success');

        d.getAllCoins();
        d.getBinancePairs();
        d.getBittrexPairs();
        d.getCryptopiaPairs();
    })

    ipcMain.on('updateSearchVars', function(event, data) {
        let searchPairs;
        let searchMatches = [];

        switch(data.market) {
            case 'binance':
                searchPairs = d.binancePairs;
                for (let i = 0; i < searchPairs.length; i++) {
                    if (searchPairs[i].startsWith(data.coin))
                        searchMatches.push(searchPairs[i]);
                }
                break;
            case 'bittrex':
                searchPairs = d.bittrexPairs;
                for (let i = 0; i < searchPairs.length; i++) {
                    if (searchPairs[i].endsWith('-' + data.coin))
                        searchMatches.push(searchPairs[i]);
                }
                break;
            case 'cryptopia':
                searchPairs = d.cryptopiaPairs;
                for (let i = 0; i < searchPairs.length; i++) {
                    if (searchPairs[i].startsWith(data.coin + '/'))
                        searchMatches.push(searchPairs[i]);
                }
                break;
            default:
                break;
        }

        mainWin.webContents.send('updateResults', searchMatches);
    })

    ipcMain.on('saveCoin', function(event, data) {
        // Check if an existing coin is using this slot
        const e = t.find(coins, {position: data.position});
        if (e)
            coins = coins.splice(coins.indexOf(e), 0);

        t.pullImage(data.name);
        coins.push(data);
        fs.writeFileSync(mainPath + '/coins.json', JSON.stringify(coins));
    })

    ipcMain.on('clearCoin', function(event, data) {
        myStreamDeck.clearKey(parseInt(data));

        const e = t.find(coins, {position: data});
        if (e) {
            coins = coins.splice(coins.indexOf(e), 0);
            fs.writeFileSync(mainPath + '/coins.json', JSON.stringify(coins));
        }
    })
}

module.exports = gui;