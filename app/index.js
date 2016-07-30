const {app, BrowserWindow, Menu, Tray} = require('electron')
const Positioner = require('electron-positioner')

// Setup
let win
let tray = null
let positioner


app.dock.hide()



const pug = require('electron-pug')({pretty: true})

var createApp = function () {

  win = new BrowserWindow({
    width: 450, 
    height: 390,
    resizable: false,
    movable: false,
    show: false,
    frame: false,
    alwaysOnTop: true
  })

  init_trayAppIcon()

  win.loadURL(`file://${__dirname}/index.pug`)


  win.on('closed', () => {
    win = null
  })

  // Hide window when user clicks anywhere else
  win.on('blur', () => {
    trayToggle()
  })
}

app.on('ready', createApp)

var init_trayAppIcon = function () {

  tray = new Tray('IconTemplate@2x.png')
  tray.setToolTip('This is my application.')

  setWindowPosition()

  tray.on('click', (event, bounds) => {
    trayToggle()
  })

}

var setWindowPosition = function () {
  positioner = new Positioner(win)
  var trayBounds = positioner.calculate('trayCenter', tray.getBounds())
  win.setPosition(trayBounds.x, trayBounds.y + 20)
}

var trayToggle = function () {
  if (!win.isVisible()){
    win.show()
  } else {
    win.hide()
  }
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.