const request = require('request');
const WebSocket = require('ws');

let data = {};
let lastBTCPrice;

data.allCoins = [];
data.binancePairs = [];
data.bittrexPairs = [];
data.cryptopiaPairs = [];

/* 
https://api.coinmarketcap.com/v1/ticker/?limit=2000
https://www.cryptopia.co.nz/api/GetMarkets
https://api.binance.com/api/v1/ticker/allBookTickers
https://bittrex.com/api/v1.1/public/getmarkets
*/

data.getPriceCryptopia = function(ticker, callback) {
    request({
        method: 'get',
        url: `https://www.cryptopia.co.nz/api/GetMarkets`
    }, (err, resp, body) => {
        if (err) {
            log(`Error when pulling ${ticker} data: ${err}`, 'error');
        }
        else if (resp.statusCode != 200) {
            log(`Bad res(${resp.statusCode}) when pulling ${ticker} data`, 'error');
        }
        else {
            try {
                body = JSON.parse(body).Data;

                let c = t.find(body, {Label: ticker});
                if (!c) return log(`${ticker} could not be found on cryptopia`, 'error');

                if (ticker.includes('/USDT'))
                    return callback(t.fixUsd(c.LastPrice.toString()));
                else
                    return callback(t.fixSats(c.LastPrice.toString()));
            }
            catch(err) {
                log(`Failed to parse ${ticker} data: ${err}`, 'error');
            }
        }
    })
}

data.getPriceBinance = function(ticker, callback) {
    request({
        method: 'get',
        url: `https://api.binance.com/api/v1/ticker/24hr`,
        qs: {
            symbol: ticker.replace('/', '')
        }
    }, (err, resp, body) => {
        if (err) {
            log(`Connection error when pulling ${ticker} data: ${err}`, 'error');
        }
        else if (resp.statusCode != 200) {
            log(`Bad response(${resp.statusCode}) when pulling ${ticker} data`, 'error');
        }
        else {
            try {
                let c = JSON.parse(body);

                if (ticker.includes('USDT'))
                    return callback(t.fixUsd(c.lastPrice.toString()));
                else
                    return callback(t.fixSats(c.lastPrice.toString()));
            }
            catch(err) {
                log(`Failed to parse ${ticker} data: ${err}`, 'error');
            }
        }
    })
}

data.getPriceBittrex = function(ticker, callback) {
    request({
        method: 'get',
        url: `https://bittrex.com/api/v1.1/public/getticker`,
        qs: {
            market: ticker.replace('/', '-')
        }
    }, (err, resp, body) => {
        if (err) {
            log(`Connection error when pulling ${ticker} data: ${err}`, 'error');
        }
        else if (resp.statusCode != 200) {
            log(`Bad response(${resp.statusCode}) when pulling ${ticker} data`, 'error');
        }
        else {
            try {
                body = JSON.parse(body);

                if (ticker.includes('USDT'))
                    return callback(t.fixUsd(body.result.Last.toString()));
                else
                    return callback(t.fixSats(body.result.Last.toString()));
            }
            catch(err) {
                log(`Failed to parse ${ticker} data: ${err}`, 'error');
            }
        }
    })
}

data.getAllCoins = function() {
    log('Pulling all coins...');

    request({
        url: 'https://api.coinmarketcap.com/v1/ticker/?limit=2000'
    }, (err, resp, body) => {
        if (err) {
            log(`Unable to pull coins from CoinMarketCap, retrying...`, 'error');
            log(err, 'error');
            return setTimeout(() => data.getAllCoins(), 1000);
        }
        else if (resp.statusCode != 200) {
            log(`Unable to pull coins from CoinMarketCap, retrying...`, 'error');
            log(`Got response code ${resp.statusCode}`, 'error');
            return setTimeout(() => data.getAllCoins(), 1000);
        }
        else {
            try {
                body = JSON.parse(body);

                let allCoins = [];
                for (let i = 0; i < body.length; i++) {
                    allCoins.push({
                        symbol: body[i].symbol,
                        id: body[i].id,
                        name: `${body[i].symbol} (${body[i].name})`
                    })
                }

                mainWin.webContents.send('updateCoins', allCoins);
                
                log('Finished pulling all coins', 'info');
            }
            catch(err) {
                log(`Unable to parse data from CoinMarketCap, retrying...`, 'error');
                log(err, 'error');
                return setTimeout(() => data.getAllCoins(), 1000);
            }
        }
    })
}

data.getBinancePairs = function() {
    log('Pulling all Binance pairs...');

    request({
        url: 'https://api.binance.com/api/v1/ticker/allBookTickers'
    }, (err, resp, body) => {
        if (err) {
            log(`Unable to pull pairs from Binance, retrying...`, 'error');
            log(err, 'error');
            return setTimeout(() => data.getBinancePairs(), 1000);
        }
        else if (resp.statusCode != 200) {
            log(`Unable to pull pairs from Binance, retrying...`, 'error');
            log(`Got response code ${resp.statusCode}`, 'error');
            return setTimeout(() => data.getBinancePairs(), 1000);
        }
        else {
            try {
                body = JSON.parse(body);

                let allPairs = [];

                for (let i = 0; i < body.length; i++) {
                    allPairs.push(body[i].symbol);
                }

                data.binancePairs = allPairs;
            }
            catch(err) {
                log(`Unable to parse data from Binance, retrying...`, 'error');
                log(err, 'error');
                return setTimeout(() => data.getBinancePairs(), 1000);
            }
        }
    })
}

data.getBittrexPairs = function() {
    log('Pulling all Bittrex pairs...');

    request({
        url: 'https://bittrex.com/api/v1.1/public/getmarkets'
    }, (err, resp, body) => {
        if (err) {
            log(`Unable to pull pairs from Bittrex, retrying...`, 'error');
            log(err, 'error');
            return setTimeout(() => data.getBittrexPairs(), 1000);
        }
        else if (resp.statusCode != 200) {
            log(`Unable to pull pairs from Bittrex, retrying...`, 'error');
            log(`Got response code ${resp.statusCode}`, 'error');
            return setTimeout(() => data.getBittrexPairs(), 1000);
        }
        else {
            try {
                body = JSON.parse(body).result;

                let allPairs = [];

                for (let i = 0; i < body.length; i++) {
                    allPairs.push(body[i].MarketName);
                }

                data.bittrexPairs = allPairs;
            }
            catch(err) {
                log(`Unable to parse data from Bittrex, retrying...`, 'error');
                log(err, 'error');
                return setTimeout(() => data.getBittrexPairs(), 1000);
            }
        }
    })
}

data.getCryptopiaPairs = function() {
    log('Pulling all Cryptopia pairs...');

    request({
        url: 'https://www.cryptopia.co.nz/api/GetMarkets'
    }, (err, resp, body) => {
        if (err) {
            log(`Unable to pull pairs from Cryptopia, retrying...`, 'error');
            log(err, 'error');
            return setTimeout(() => data.getCryptopiaPairs(), 1000);
        }
        else if (resp.statusCode != 200) {
            log(`Unable to pull pairs from Cryptopia, retrying...`, 'error');
            log(`Got response code ${resp.statusCode}`, 'error');
            return setTimeout(() => data.getCryptopiaPairs(), 1000);
        }
        else {
            try {
                body = JSON.parse(body).Data;

                let allPairs = [];

                for (let i = 0; i < body.length; i++) {
                    allPairs.push(body[i].Label);
                }

                data.cryptopiaPairs = allPairs;
            }
            catch(err) {
                log(`Unable to parse data from Cryptopia, retrying...`, 'error');
                log(err, 'error');
                return setTimeout(() => data.getCryptopiaPairs(), 1000);
            }
        }
    })
}

module.exports = data;