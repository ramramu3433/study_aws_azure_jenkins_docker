"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var fs = require("fs");
var path = require("path");
var LocalFileQueryHandler = (function () {
    function LocalFileQueryHandler(query) {
        var _this = this;
        this.getNext = function () {
            if (_this._query.errors && _this._query.errors.length > 0) {
                var error = _this._query.errors.shift();
                throw error;
            }
            else if (_this._query.files && _this._query.files.length > 0) {
                var blobRef = _this._query.files.shift();
                if (!blobRef.size) {
                    return LocalFileQueryHandler._getStats(blobRef.path)
                        .then(function (stats) {
                        blobRef.size = stats.size;
                        return blobRef;
                    });
                }
                else {
                    return Q.resolve(blobRef);
                }
            }
            else if ((_this._query.folders && _this._query.folders.length > 0)) {
                return _this._processNextFolder().then(function () { return _this.getNext(); });
            }
            return Q.resolve(null);
        };
        this._processNextFolder = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var folder;
            return tslib_1.__generator(this, function (_a) {
                folder = this._query.folders.shift();
                return [2 /*return*/, LocalFileQueryHandler._readdir(folder.path)
                        .then(function (files) {
                        var handleFile = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var relativePath, absolutePath, stats, err_1;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (files.length === 0) {
                                            return [2 /*return*/];
                                        }
                                        relativePath = files.shift();
                                        absolutePath = path.resolve(folder.path, relativePath);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, LocalFileQueryHandler._getStats(absolutePath)];
                                    case 2:
                                        stats = _a.sent();
                                        if (stats.isDirectory()) {
                                            this._query.folders.push({ path: absolutePath });
                                        }
                                        else {
                                            this._query.files.push({ path: absolutePath, size: stats.size });
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _a.sent();
                                        this._query.errors.push(err_1);
                                        return [3 /*break*/, 4];
                                    case 4: return [4 /*yield*/, handleFile()];
                                    case 5:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return handleFile();
                    })];
            });
        }); };
        this.hasNext = function () {
            return Q.resolve((_this._query.errors && _this._query.errors.length > 0) || (_this._query.files && _this._query.files.length > 0) || (_this._query.folders && _this._query.folders.length > 0));
        };
        this.getNextQuery = function () {
            return _this._query;
        };
        this._query = query;
    }
    return LocalFileQueryHandler;
}());
LocalFileQueryHandler._readdir = function (localPath) {
    return Q.nfcall(fs.readdir, localPath);
};
LocalFileQueryHandler._getStats = function (localPath) {
    return Q.nfcall(fs.stat, localPath);
};
exports.default = LocalFileQueryHandler;
