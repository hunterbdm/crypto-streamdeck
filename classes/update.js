const ChildProcess = require('child_process');
const { app, BrowserWindow, dialog, Menu, session, ipcMain, autoUpdater } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let update = {};

update.createShortcut = function(callback) {
    update.spawnUpdate([
      '--createShortcut=' + path.basename(process.execPath)
    ], callback)
}

update.removeShortcut = function(callback) {
    update.spawnUpdate([
      '--removeShortcut',
      path.basename(process.execPath)
    ], callback)
}

update.spawnUpdate = function(args, callback) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe')
    var stdout = ''
    var spawned = null
  
    try {
      spawned = ChildProcess.spawn(updateExe, args)
    } 
    catch (error) {
      if (error && error.stdout == null)
        error.stdout = stdout
      process.nextTick(function() {
        callback(error)
      })
      return
    }
  
    var error = null
  
    spawned.stdout.on('data', function(data) {
      stdout += data
    })
  
    spawned.on('error', function(processError) {
      if (!error)
        error = processError
    })
  
    spawned.on('close', function(code, signal) {
      if (!error && code !== 0) {
        error = new Error('Command failed: ' + code + ' ' + signal)
      }
      if (error && error.code == null)
        error.code = code
      if (error && error.stdout == null)
        error.stdout = stdout
      callback(error)
    })
}

module.exports = update;