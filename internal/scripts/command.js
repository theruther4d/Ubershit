'use strict';
const osascript = require( 'osascript' );
const exec = require( 'child_process' ).exec;
const fs = require( 'fs' );
const electron = require( 'electron' );
const remote = electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const shell = electron.shell;

var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Show Widgets Folder',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+W';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
            if (focusedWindow) {
                shell.showItemInFolder( '/Users/josh/Library/Application Support/ubershit/widgets' );
            }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
      },
    ]
  },
];

// @TODO: we're only packaging for darwin
if (process.platform == 'darwin') {
  var name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { remote.app.quit(); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring Window to Front',
      role: 'front'
    }
  );
};
var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);


let commands = {};
let execs = {};

window.command = function( file, callback, interval, options ) {
    options = options || {};

    if( commands.hasOwnProperty( file ) ) {
        clearInterval( commands[file] );
    }

    commands[file] = setInterval( () => {
        osascript.file( file, options, callback );
    }, interval );
};

window.execFromFile = function( file, callback, interval ) {
    if( execs.hasOwnProperty( file ) ) {
        clearInterval( execs[file] );
    }

    execs[file] = setInterval( () => {
        return exec( fs.readFileSync( file ), callback );
    }, interval );
};

window.WIDGET_DIR = __dirname.split( '/' );
window.WIDGET_DIR.splice( -1, 1 );
window.WIDGET_DIR = `${WIDGET_DIR.join( '/' )}/widgets`
// window.WIDGET_DIR = `${__dirname.split( '/' ).splice( -1, 1 ).join( '/' )}/widgets`;
