"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Nedb = require("nedb");
var Q = require("q");
var VersionFile = (function () {
    function VersionFile(fileData, userUpdateGroups, currentVersion, acceptAnyUpdate) {
        if (acceptAnyUpdate === void 0) { acceptAnyUpdate = false; }
        this._updateGroupQuery = [];
        this._fileAsDb = new Nedb();
        this._fileAsDb.ensureIndex({
            fieldName: "version",
            unique: true
        });
        this._fileAsDb.insert(fileData);
        for (var group in userUpdateGroups) {
            this._updateGroupQuery.push({
                updateGroups: {
                    $elemMatch: {
                        name: userUpdateGroups[group].name,
                        percentage: { $gte: userUpdateGroups[group].percentage }
                    }
                }
            });
        }
        this._currentVersion = currentVersion;
        this._acceptAnyUpdate = acceptAnyUpdate;
    }
    VersionFile.prototype.getLatestVersion = function () {
        return this._getAvailableVersions()
            .then(function (updates) {
            return updates.sort(function (updateA, updateB) {
                return updateB.version >= updateA.version ? 1 : -1;
            })[0];
        });
    };
    VersionFile.prototype.getVersionPreviousTo = function (version) {
        var _this = this;
        return this._getVersion(version)
            .then(function (update) {
            if (!!update && !!update.previousVersion) {
                return _this._getVersion(update.previousVersion);
            }
            else {
                return null;
            }
        });
    };
    VersionFile.prototype._getVersion = function (version) {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this._fileAsDb.find({ version: version }).limit(1).exec(function (err, docs) {
                if (!err) {
                    resolve(docs[0]);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    VersionFile.prototype._getAvailableVersions = function () {
        var _this = this;
        if (this._acceptAnyUpdate) {
            return this._getAll();
        }
        var context = this;
        return Q.Promise(function (resolve, reject) {
            _this._fileAsDb.find({
                $or: [
                    {
                        updateGroups: { $exists: false }
                    },
                    {
                        $or: _this._updateGroupQuery
                    }
                ],
                "version": { $gt: context._currentVersion }
            }, function (err, docs) {
                if (!err) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    VersionFile.prototype._getAll = function () {
        var _this = this;
        return Q.Promise(function (resolve, reject) {
            _this._fileAsDb.find({}, function (err, docs) {
                if (!err) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    return VersionFile;
}());
exports.default = VersionFile;
