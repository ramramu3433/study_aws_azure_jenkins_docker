"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var BlobUtilities_1 = require("../../Azure/AzureStorage/Blobs/BlobUtilities");
var Q = require("q");
var BlobQueryHandler = (function () {
    function BlobQueryHandler(query, blobContainerRef) {
        var _this = this;
        this.getNext = function () {
            if (_this._query.blobs && _this._query.blobs.length > 0) {
                var blobRef = _this._query.blobs.shift();
                return Q.resolve(blobRef);
            }
            else if (_this._query.currentContinuationToken || (_this._query.folders && _this._query.folders.length > 0)) {
                return _this._processNextFolder().then(function () { return _this.getNext(); });
            }
            return Q.resolve(null);
        };
        this._processNextFolder = function () {
            if (!_this._getBlobServicePromise) {
                _this._getBlobServicePromise = BlobUtilities_1.getBlobService(_this._blobContainerRef.connectionString, "enumerateFolders");
            }
            var deferred = Q.defer();
            _this._getBlobServicePromise.then(function (blobService) {
                var path = null;
                var continuationToken = null;
                if (_this._query.currentPath) {
                    path = _this._query.currentPath;
                    continuationToken = _this._query.currentContinuationToken;
                    _this._query.currentPath = undefined;
                    _this._query.currentContinuationToken = undefined;
                }
                else {
                    var folder = _this._query.folders.shift();
                    path = folder.path;
                }
                blobService.listBlobsSegmentedWithPrefix(_this._blobContainerRef.name, path, continuationToken, function (error, result) {
                    if (error) {
                        // TODO handle error.
                        deferred.resolve();
                    }
                    else {
                        if (result.continuationToken) {
                            _this._query.currentContinuationToken = result.continuationToken;
                            _this._query.currentPath = path;
                        }
                        result.entries.forEach(function (blobResult) {
                            var blobRef = {
                                fileName: blobResult.name,
                                length: Number(blobResult.contentLength),
                                snapshot: blobResult.snapshot
                            };
                            _this._query.blobs.push(blobRef);
                        });
                        deferred.resolve();
                    }
                });
            });
            return deferred.promise;
        };
        this.hasNext = function () {
            // blob containers can't have empty folders but fileshares can ... don't copy and paste :)
            return Q.resolve(_this._query.currentContinuationToken || (_this._query.blobs && _this._query.blobs.length > 0) || (_this._query.folders && _this._query.folders.length > 0));
        };
        this.getNextQuery = function () {
            return _this._query;
        };
        this._blobContainerRef = blobContainerRef;
        this._query = query;
    }
    return BlobQueryHandler;
}());
exports.default = BlobQueryHandler;
