"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var syswidecas = require("syswide-cas");
var constants = require("../Constants");
var DialogsManager = require("./DialogsManager");
var NotificationBarManager = require("./NotificationBarManager");
var SslCertificateManager = (function () {
    function SslCertificateManager() {
        this.userCertsDirectory = path.join(electron_1.remote.app.getPath("userData"), "certs/");
    }
    SslCertificateManager.prototype.SslCertificateManager = function () {
        // noop
    };
    SslCertificateManager.prototype.loadTrustedCerts = function () {
        if (!fs.existsSync(this.userCertsDirectory)) {
            fs.mkdirSync(this.userCertsDirectory);
        }
        syswidecas.addCAs(this.userCertsDirectory);
    };
    SslCertificateManager.prototype.showTrustedCerts = function () {
        // add a dot so we actually go into the directly
        // we don't use path.join because it will ignore the dot
        electron_1.remote.shell.showItemInFolder(this.userCertsDirectory + "/.");
    };
    SslCertificateManager.prototype.addCertificatesViaDailog = function () {
        var _this = this;
        DialogsManager.showOpenDialog("Select SSL Certificates", false, true)
            .then(function (certsToAdd) {
            var successfulImportCount = 0;
            for (var i = 0; i < certsToAdd.length; i++) {
                try {
                    _this.addCertificate(certsToAdd[i]);
                    successfulImportCount++;
                }
                catch (e) {
                    console.error(e);
                }
            }
            // TODO: localize
            var allImportsFailed = (successfulImportCount === 0);
            var message;
            var link;
            var closeText;
            if (allImportsFailed) {
                // I don't expect this to ever happen since we are doing a simple read and write, but let's cover the case just incase
                message = "Unable to import the selected certificates.";
                link = null;
                closeText = null;
            }
            else {
                message = "Succesfully imported " + successfulImportCount.toString() + "/" + certsToAdd.length + " certificates. " + "Storage Explorer must restart for the changes to take effect.";
                link = "Restart Now";
                closeText = "Restart later";
            }
            NotificationBarManager.showSingleLink(message, link, constants.InfoBarTypes.other, closeText)
                .then(function (restartNowClicked) {
                if (restartNowClicked && !allImportsFailed) {
                    electron_1.remote.app.relaunch();
                    electron_1.remote.app.quit();
                }
            });
        });
    };
    SslCertificateManager.prototype.getCertsDir = function () {
        return this.userCertsDirectory;
    };
    SslCertificateManager.prototype.addCertificate = function (certPath) {
        if (!fs.existsSync(certPath)) {
            return;
        }
        var certData = fs.readFileSync(certPath, "utf-8");
        fs.writeFileSync(path.join(this.userCertsDirectory, path.basename(certPath)), certData);
    };
    return SslCertificateManager;
}());
exports.default = new SslCertificateManager();
