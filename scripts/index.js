window.$ = window.jQuery = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

let selected;
let tray = null;

$('.hori').click(function(event) {
    if (selected) selected.removeClass('selected');
    selected = $(this);
    selected.addClass('selected');
})

$('#coin').change(function(event) {
    ipcRenderer.send('updateSearchVars', {
        coin: $('#coin').val(),
        market: $('#market').val()
    })
})

$('#market').change(function(event) {
    ipcRenderer.send('updateSearchVars', {
        coin: $('#coin').val(),
        market: $('#market').val()
    })
})

$('#save').click(function(event) {
    if ($('#coin').val() == '' || $('#pair').val() == '' || selected == undefined)
        return;

    ipcRenderer.send('saveCoin', {
        name: $($('#coin').find(":selected")).attr('id'),
        ticker: $('#pair').val(),
        market: $('#market').val(),
        position: selected.attr('index')
    })
})

$('#clear').click(function(event) {
    if (selected == undefined)
        return;

    ipcRenderer.send('clearCoin', selected.attr('index'));
})

ipcRenderer.on('updateCoins', function(event, data) {
    const coinSelect = $('#coin');

    for (let i = 0; i < data.length; i++) {
        coinSelect.append(`<option value="${data[i].symbol}" id="${data[i].id}">${data[i].name}</option>`);
    }
})

ipcRenderer.on('updateResults', function(event, data) {
    const pairSelect = $('#pair');
    pairSelect.empty();

    for (let i = 0; i < data.length; i++) {
        pairSelect.append(`<option value="${data[i]}">${data[i]}</option>`);
    }
})

function addToTray() {
    const {remote} = require('electron')
    const {Tray, Menu, BrowserWindow} = remote
    const path = require('path');
    const window = remote.getCurrentWindow();
    const isDev = require('electron-is-dev');

    tray = new Tray(path.resolve((isDev) ? './images/logo.png' : './resources/app/images/logo.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click:  function()  {
                window.show();
            }
        },
        {
            label: 'Quit', 
            click:  function(){
                window.close();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
}

ipcRenderer.send('ready', {});
addToTray();