const path = require("path");
const url = require("url");
const electron = require("electron");
const app = electron.app;

app.on("ready", function(){

    let mainwindow = new electron.BrowserWindow({
        width: 800,
        height: 600,
    });

    mainwindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    mainwindow.maximize();
    mainwindow.webContents.openDevTools();

    mainwindow.on("closed", function(){
        mainwindow = null;
        app.exit();
    }); 

});