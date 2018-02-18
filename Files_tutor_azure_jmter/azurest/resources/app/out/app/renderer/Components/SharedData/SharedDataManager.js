"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteSharedDataManager_1 = require("./ProviderBasedSharedData/Remote/RemoteSharedDataManager");
exports.Remote = RemoteSharedDataManager_1.default;
// Consider using https://github.com/Ivshti/linvodb3 if we need large scale
var Nedb = require("nedb");
var Q = require("q");
var SharedDataManager = (function () {
    function SharedDataManager(filePath) {
        this._getLeaseQueue = Object.create(null);
        this._leaseTimeouts = Object.create(null);
        this._database = new Nedb({
            autoload: true,
            filename: filePath
        });
        this._database.persistence.setAutocompactionInterval(60000);
    }
    SharedDataManager.prototype.createSharedData = function (data) {
        var _this = this;
        var entry = {
            data: data,
            leaseExpiration: 0
        };
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.insert(entry, function (err, entry) {
                if (err) {
                    reject(err);
                }
                else if (entry) {
                    var entryRef = {
                        id: entry._id
                    };
                    resolve(entryRef);
                }
                else {
                    reject("Failed to add entry.");
                }
            });
        });
    };
    SharedDataManager.prototype.getSharedDataLease = function (dataRef, leaseMs) {
        var _this = this;
        if (leaseMs === void 0) { leaseMs = SharedDataManager._defaultLeaseDuration; }
        return Q.Promise(function (resolve, reject, notify) {
            if (!_this._getLeaseQueue[dataRef.id]) {
                _this._getLeaseQueue[dataRef.id] = [];
            }
            _this._getLeaseQueue[dataRef.id].push(function () { return _this._getSharedDataLease(resolve, reject, dataRef, leaseMs); });
            var onlyOneInLine = _this._getLeaseQueue[dataRef.id].length === 1;
            if (onlyOneInLine) {
                _this._getLeaseQueue[dataRef.id][0]();
            }
        });
    };
    SharedDataManager.prototype.readSharedData = function (dataRef) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            if (!_this._getLeaseQueue[dataRef.id]) {
                _this._getLeaseQueue[dataRef.id] = [];
            }
            _this._getLeaseQueue[dataRef.id].push(function () { return _this._readSharedData(resolve, reject, dataRef); });
            var onlyOneInLine = _this._getLeaseQueue[dataRef.id].length === 1;
            if (onlyOneInLine) {
                _this._getLeaseQueue[dataRef.id][0]();
            }
        });
    };
    SharedDataManager.prototype._readSharedData = function (resolve, reject, dataRef) {
        var _this = this;
        this._database.find({ "_id": dataRef.id }, function (err, entries) {
            if (err) {
                reject(err);
            }
            else if (!!entries && entries.length > 0) {
                resolve(entries[0].data);
            }
            else {
                resolve(null);
            }
            _this._leaseExpiredOrEnded(dataRef.id);
        });
    };
    SharedDataManager.prototype._getSharedDataLease = function (resolve, reject, dataRef, leaseMs) {
        var _this = this;
        if (leaseMs === void 0) { leaseMs = SharedDataManager._defaultLeaseDuration; }
        this._database.update({ "_id": dataRef.id }, { "$set": { leaseExpiration: Date.now() + leaseMs } }, { returnUpdatedDocs: true, multi: false }, function (err, n, entry) {
            if (err) {
                reject(err);
            }
            else if (!!entry) {
                _this._leaseTimeouts[entry._id] = setTimeout(function () {
                    _this._leaseExpiredOrEnded(entry._id);
                }, entry.leaseExpiration - Date.now());
                resolve(_this._convertEntryToLease(entry));
            }
            else if (!entry) {
                _this._leaseExpiredOrEnded(dataRef.id);
                resolve(null);
            }
        });
    };
    SharedDataManager.prototype.renewSharedDataLease = function (lease, leaseMs) {
        var _this = this;
        if (leaseMs === void 0) { leaseMs = SharedDataManager._defaultLeaseDuration; }
        return Q.Promise(function (resolve, reject, notify) {
            if (lease.expiration < Date.now()) {
                reject("Existing lease has already expired.");
            }
            clearTimeout(_this._leaseTimeouts[lease.id]);
            _this._database.update({ _id: lease.id, leaseExpiration: lease.expiration }, { "$set": { leaseExpiration: Date.now() + leaseMs } }, { returnUpdatedDocs: true, multi: false }, function (err, n, entry) {
                if (err) {
                    reject(err);
                }
                else if (n === 0) {
                    reject("Unable to renew lease.");
                }
                else {
                    _this._leaseTimeouts[entry._id] = setTimeout(function () {
                        _this._leaseExpiredOrEnded(entry._id);
                    }, entry.leaseExpiration - Date.now());
                    resolve(_this._convertEntryToLease(entry));
                }
            });
        });
    };
    SharedDataManager.prototype.endSharedDataLease = function (lease) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            if (lease.expiration < Date.now()) {
                resolve(null);
            }
            _this._database.update({ _id: lease.id, leaseExpiration: lease.expiration }, { "$set": { leaseExpiration: null } }, { returnUpdatedDocs: true, multi: false }, function (err, n, entry) {
                if (err) {
                    reject(err);
                }
                else if (n === 0) {
                    reject("Unable to end lease");
                }
                else {
                    _this._leaseExpiredOrEnded(lease.id);
                    resolve(null);
                }
            });
        });
    };
    SharedDataManager.prototype.updateSharedData = function (lease, data) {
        var _this = this;
        if (!data) {
            data = lease.data;
        }
        return Q.Promise(function (resolve, reject, notify) {
            if (lease.expiration < Date.now()) {
                reject("Existing lease has already expired.");
            }
            _this._database.update({ _id: lease.id, leaseExpiration: lease.expiration }, { "$set": { data: data, leaseExpiration: null } }, { returnUpdatedDocs: true, multi: false }, function (err, n, entry) {
                if (err) {
                    reject(err);
                }
                else if (n === 0) {
                    reject("Unable to update data.");
                }
                else {
                    _this._leaseExpiredOrEnded(lease.id);
                    resolve(null);
                }
            });
        });
    };
    SharedDataManager.prototype.deleteSharedData = function (lease) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            if (lease.expiration < Date.now()) {
                reject("Existing lease has already expired.");
            }
            _this._database.remove({ _id: lease.id, leaseExpiration: lease.expiration }, { multi: false }, function (err, n) {
                if (err) {
                    reject(err);
                }
                else if (n === 0) {
                    reject("Unable to delete data.");
                }
                else {
                    _this._leaseExpiredOrEnded(lease.id);
                    resolve(null);
                }
            });
        });
    };
    SharedDataManager.prototype._convertEntryToLease = function (entry) {
        return {
            id: entry._id,
            expiration: entry.leaseExpiration,
            data: entry.data
        };
    };
    SharedDataManager.prototype._leaseExpiredOrEnded = function (dataId) {
        this._getLeaseQueue[dataId].shift();
        clearTimeout(this._leaseTimeouts[dataId]);
        if (this._getLeaseQueue[dataId].length > 0) {
            this._getLeaseQueue[dataId][0]();
        }
    };
    return SharedDataManager;
}());
SharedDataManager._defaultLeaseDuration = 5 * 1000; // in ms
exports.default = SharedDataManager;
