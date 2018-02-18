"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ExceptionSerialization_1 = require("../Components/Errors/ExceptionSerialization");
var ZoomLevelManager_1 = require("../ZoomLevelManager");
var electron_1 = require("electron");
var q = require("q");
var host = global.host;
var DialogManagerProxy = (function () {
    function DialogManagerProxy() {
        var _this = this;
        this._dialogReservationRequestQueue = [];
        this._dialogReservationTime = Number.MIN_VALUE;
        console.log("Constructing dialog manager.");
        electron_1.ipcRenderer.on("execute-operation", function (e, messageID, namespace, args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var result, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, host.executeOperation(namespace, args)];
                    case 1:
                        result = _a.sent();
                        e.sender.send("did-execute-operation", messageID, undefined, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        e.sender.send("did-execute-operation", messageID, error_1, undefined);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    }
    /**
     * Asynchronously returns the result of the specified dialog.
     * @param id The ID of the dialog.
     * @param args
     */
    DialogManagerProxy.prototype.getDialogResult = function (id, args) {
        var _this = this;
        return this.reserveDialog()
            .then(function (reservation) {
            return _this.doGetDialogResult(reservation, id, args);
        });
    };
    DialogManagerProxy.prototype.onThemeChanged = function (newTheme) {
        electron_1.ipcRenderer.send("dialog-theme-change", newTheme);
        return q.resolve(undefined);
    };
    DialogManagerProxy.prototype.onZoomChanged = function (zoomFactor) {
        electron_1.ipcRenderer.send("dialog-zoom-change", zoomFactor);
        return q.resolve(undefined);
    };
    DialogManagerProxy.prototype.tryStartNextReservation = function () {
        var _this = this;
        var now = Date.now();
        if (this._dialogReservationTime < now && this._dialogReservationRequestQueue.length > 0) {
            this._dialogReservationTime = now + 2000;
            var reservationDeferred = this._dialogReservationRequestQueue.shift();
            reservationDeferred.resolve(this._dialogReservationTime);
            setTimeout(function () {
                if (_this._dialogReservationTime < now) {
                    _this.tryStartNextReservation();
                }
            }, this._dialogReservationTime + 50);
        }
    };
    ;
    DialogManagerProxy.prototype.reserveDialog = function () {
        var deferred = q.defer();
        this._dialogReservationRequestQueue.push(deferred);
        this.tryStartNextReservation();
        return deferred.promise;
    };
    DialogManagerProxy.prototype.doGetDialogResult = function (reservation, id, args) {
        var _this = this;
        if (reservation === this._dialogReservationTime && this._dialogReservationTime >= Date.now()) {
            this._dialogReservationTime = Number.MAX_VALUE;
            var openDialogPromise = q.Promise(function (resolve, reject) {
                var shellInfo = {
                    zoomFactor: ZoomLevelManager_1.default.zoomFactor
                };
                electron_1.ipcRenderer.send("get-dialog-result", id, shellInfo, args);
                electron_1.ipcRenderer.once("did-get-dialog-result", function (e, error, result) {
                    if (error) {
                        reject(ExceptionSerialization_1.default.deserialize(error));
                    }
                    else {
                        resolve(result);
                    }
                });
            });
            openDialogPromise.then(function () {
                _this._dialogReservationTime = Number.MIN_VALUE;
                _this.tryStartNextReservation();
            }).catch(function () {
                _this._dialogReservationTime = Number.MIN_VALUE;
                _this.tryStartNextReservation();
            });
            return openDialogPromise;
        }
        return q.reject("Invalid dialog reservation");
    };
    return DialogManagerProxy;
}());
var instance = new DialogManagerProxy();
exports.default = instance;
