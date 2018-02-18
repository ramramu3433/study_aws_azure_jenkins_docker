"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var fs = require("fs");
var SessionStatus_1 = require("./SessionStatus");
var TelemetryManager = require("../telemetry/TelemetryManager");
var Q = require("q");
var ExceptionSerialization_1 = require("../Components/Errors/ExceptionSerialization");
var Session = (function () {
    function Session(sessionsDirectory, guid) {
        if (!!sessionsDirectory && !!guid) {
            this._guid = guid;
            this._expiration = Date.now() + Session.leaseDuration;
            this._resumeInfo = {};
            this._sessionFolderPath = path.join(sessionsDirectory, this._guid);
            this._sessionFilePath = path.join(this._sessionFolderPath, Session.sessionFileName);
            this._status = SessionStatus_1.default.Active;
            fs.mkdirSync(this._sessionFolderPath);
            this.writeToDisk();
        }
    }
    Session.readFromSessionDirectory = function (sessionDirectory) {
        var obj;
        var potentialSessionFile = path.join(sessionDirectory, Session.sessionFileName);
        if (fs.existsSync(potentialSessionFile)) {
            try {
                obj = JSON.parse(fs.readFileSync(potentialSessionFile, "utf-8"));
            }
            catch (err) {
                console.warn("Unable to parse session file at " + potentialSessionFile);
                TelemetryManager.sendEvent("StorageExplorer.ReadSessionFileError", {
                    err: err,
                    stringErr: ExceptionSerialization_1.default.summarize(err)
                });
            }
        }
        else {
            console.warn("No session file found at " + sessionDirectory);
        }
        if (!obj) {
            // if session.json isn't there or we fail to read it, we create a fake JSON
            // object that marks the session for deletion
            obj = {
                _sessionFolderPath: sessionDirectory,
                _status: SessionStatus_1.default.Delete
            };
        }
        var session = new Session();
        session._guid = obj._guid;
        session._expiration = obj._expiration;
        session._sessionFolderPath = obj._sessionFolderPath;
        session._sessionFilePath = obj._sessionFilePath;
        session._status = obj._status;
        session._resumeInfo = obj._resumeInfo;
        return session;
    };
    Session.prototype.getGuid = function () {
        return this._guid;
    };
    Session.prototype.getResumeInfo = function () {
        return this._resumeInfo;
    };
    Session.prototype.setComponentToBeResumed = function (resp) {
        if (resp.files) {
            for (var i = 0; i < resp.files.length; i++) {
                resp.files[i] = path.join(this._sessionFolderPath, resp.files[i]);
            }
        }
        this._resumeInfo[resp.component] = resp;
    };
    Session.prototype.getFolderPath = function () {
        return this._sessionFolderPath;
    };
    Session.prototype.getExpirationDate = function () {
        this.refresh();
        return this._expiration;
    };
    Session.prototype.getStatus = function () {
        this.refresh();
        return this._status;
    };
    Session.prototype.setStatus = function (status) {
        if (this._status !== status) {
            this._status = status;
            return this.writeToDisk();
        }
        else {
            Promise.resolve(true);
        }
    };
    Session.prototype.renew = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var writeSuccessful;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._expiration < Date.now()) {
                            console.error("Session expired. This should not happen!");
                            TelemetryManager.sendEvent("StorageExplorer.SessionExpiredWhenRenewing", {
                                originalExpiration: this._expiration.toString(),
                                currentTime: Date.now().toString(),
                                howLate: (Date.now() - this._expiration).toString()
                            });
                        }
                        this._expiration = Date.now() + Session.leaseDuration;
                        return [4 /*yield*/, this.writeToDisk()];
                    case 1:
                        writeSuccessful = _a.sent();
                        return [2 /*return*/, writeSuccessful];
                }
            });
        });
    };
    Session.prototype.isExpired = function () {
        var readTime = Date.now();
        this.refresh();
        return this._expiration < readTime;
    };
    Session.prototype.getAvailableFiles = function () {
        return fs.readdirSync(this._sessionFolderPath);
    };
    Session.prototype.refresh = function () {
        if (fs.existsSync(this._sessionFilePath)) {
            var obj = JSON.parse(fs.readFileSync(this._sessionFilePath, "utf-8"));
            this._expiration = obj._expiration;
            this._status = obj._status;
            this._resumeInfo = obj._resumeInfo;
        }
    };
    Session.prototype.writeToDisk = function (retryCount) {
        var _this = this;
        if (retryCount === void 0) { retryCount = 10; }
        return Q.Promise(function (resolve, reject) {
            if (retryCount < 1) {
                resolve(false);
                return;
            }
            if (!fs.existsSync(_this._sessionFolderPath)) {
                fs.mkdirSync(_this._sessionFolderPath);
            }
            try {
                var writeStream = fs.createWriteStream(_this._sessionFilePath);
                writeStream.on("error", function (err) {
                    _this._reportWriteError(retryCount, err);
                    resolve(_this.writeToDisk(retryCount - 1));
                });
                writeStream.write(JSON.stringify(_this));
                writeStream.end(function () {
                    resolve(true);
                });
            }
            catch (err) {
                writeStream.end();
                _this._reportWriteError(retryCount, err);
                resolve(_this.writeToDisk(retryCount - 1));
            }
        });
    };
    Session.prototype._reportWriteError = function (retryCount, err) {
        if (Session._errorReportLimit < 1) {
            return;
        }
        Session._errorReportLimit--;
        TelemetryManager.sendEvent("StorageExplorer.WriteSessionToDiskError", {
            err: err,
            retryCount: retryCount.toString(),
            sessionFolderExists: fs.existsSync(this._sessionFolderPath) ? "true" : "false",
            sessionFileExists: fs.existsSync(this._sessionFilePath) ? "true" : "false"
        });
    };
    return Session;
}());
Session.leaseDuration = 30 * 1000;
Session._errorReportLimit = 10;
Session.sessionFileName = "session.json";
exports.default = Session;
