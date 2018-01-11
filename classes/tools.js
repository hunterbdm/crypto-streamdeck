const fs = require('fs');
const PImage = require('pureimage');
const request = require('request');

let tools = {}

tools.checkExists = function(file) {
    try {
      fileString = file.replace('./', '')
      return (fs.existsSync(fileString)) ? true : false
  } catch ($e) {
       log(`Fatal Error: Please check file - ${fileString}`, "error");
       process.exit(1);
     }
}

tools.load = function(file, print) {
  try {
    if(tools.checkExists(file)) {
      if(print) {
        log(fileString + " has been loaded.", "success")
      }
      return require.main.require(file)
    } else {
      log("Please rename " + fileString.replace('config/', 'setup/') + " to " + fileString, "error")
      process.exit(1);
    }
  } catch ($e) {
    log(`Please check formatting on: ${fileString}`, "error");
    process.exit(1);
  }
};

tools.grabRandom = function(list) {
  return list[Math.floor(Math.random() * list.length)]
}

tools.randomNumber = function(a, b) {
  return Math.floor(Math.random() * (b - a + 1) + a);
}

tools.printj = function(jsonObj) {
  return JSON.stringify(jsonObj);
}

tools.loadFont = function(path, name) {
  tools.checkExists(path);
  let fnt = PImage.registerFont(path,'Source Sans Pro');
  fnt.load();
}

tools.loadImage = function(name) {
  PImage.decodePNGFromStream(fs.createReadStream(`${mainPath}/imgs/${name}.png`)).then((img) => {
    global.images[name] = img;
  });
}

tools.buildImage = function(prevImg, text, name, callback) {
  let img = PImage.make(72, 72);
  let ctx = img.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,72,72);
  ctx.drawImage(prevImg,
    0, 0, prevImg.width, prevImg.height, // source dimensions
    8, 16, 56, 56   // destination dimensions
  );
  ctx.fillStyle = '#ffffff';
  ctx.font = "18pt 'Source Sans Pro'";
  ctx.fillText(text, tools.getGap(text), 15);

  let ranName = tools.randomNumber(1000, 9999).toString();

  PImage.encodePNGToStream(img, fs.createWriteStream(`${mainPath}/imgs/${ranName}.png`)).then(()=> {
    callback(ranName);
  }).catch((err)=>{
    log(`Error writing ${name} built image: ${err}`, 'error');
  });
}

tools.getPrice = function(coin, callback) {
  switch(coin.market) {
    case 'binance':
      d.getPriceBinance(coin.ticker, callback);
      break;
    case 'cryptopia':
      d.getPriceCryptopia(coin.ticker, callback);
      break;
    case 'bittrex':
      d.getPriceBittrex(coin.ticker, callback);
      break;
    default:
      break;
  }
}

tools.fixUsd = function(str) {
  if (str.indexOf('.') < 0)
    return '$' + str;
  else if (str.indexOf('.') > 2) {
    return '$' + str.substring(0, str.indexOf('.'));
  }
  else
    return '$' + str.substring(0, str.indexOf('.') + 4);
}

tools.fixSats = function(str) {
  str = t.fixDecimal(str);
  str = str.replace('.', '');
  return parseInt(str).toString();
}

tools.setImage = function(index, path) {
  index = parseInt(index);
  myStreamDeck.clearKey(index);
  myStreamDeck.fillImageFromFile(index, path).then(() => {
    fs.unlinkSync(path);
  });
}

/* There is no proper way to center the text yet, so this is a ghetto way of finding the gap */
tools.getGap = function(str) {
  // remove dots because they don't take up much space
  str = str.replace('.', '');
  // 9 is the average pixel width of a number
  return (72 - (str.length * 9)) / 2;
}

tools.pullImage = function(name) {
  if (!fs.existsSync(`${mainPath}/imgs/${name}.png`)) {
    request({
      url: `https://files.coinmarketcap.com/static/img/coins/128x128/${name}.png`,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
      }
    }, (err, resp, body) => {
      if (err) {
        log(`Failed to pull image from ${name}, make sure its on CoinMarketcap: ${err}`, 'error');
        return process.exit();
      }
      else {
        log(`Successfully downloaded ${name} image.`, 'success');
        t.loadImage(name);
      }
    }).pipe(fs.createWriteStream(`${mainPath}/imgs/${name}.png`))
  }
  else {
    t.loadImage(name);
  }
}

tools.fixDecimal = function(price) {
  let decimalPlaces = (price.length) - (price.indexOf('.') + 1);
  let needed = 8 - decimalPlaces;

  for (let i = 0; i < needed; i++) {
    price = price + '0';
  }

  return price;
}

tools.find = function(jArray, objTerm) {
  for (let i = 0; i < jArray.length; i++) {
    let matches = true;

    for (let k in objTerm) {
      if (jArray[i][k] != objTerm[k]) {
        matches = false;
        break;
      }
    }

    if (matches)
      return jArray[i];
  }

  return undefined;
}

tools.removeLastPrices = function() {
  for (let i = 0; i < coins.length; i++) {
    coins[i].lastPrice = undefined;
  }
}

module.exports = tools;
