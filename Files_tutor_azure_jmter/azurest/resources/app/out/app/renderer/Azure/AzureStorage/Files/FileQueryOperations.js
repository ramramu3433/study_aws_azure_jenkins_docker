"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Path = require("path");
var q = require("q");
var _string = require("underscore.string");
var FileUtilities = require("./FileUtilities");
var StorageManagerHelper = require("../StorageManagerHelper");
/**
 * List all files and directories in a share directory.
 */
function listFilesAndDirectoriesSegmented(shareReference, directory, prefix, currentToken, numResults) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var connectionString, fileService, shareName, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectionString = shareReference.connectionString;
                    return [4 /*yield*/, FileUtilities.getFileService(connectionString, "listFilesAndDirectoriesSegmented")];
                case 1:
                    fileService = _a.sent();
                    shareName = shareReference.shareName;
                    options = {
                        maxResults: numResults
                    };
                    return [2 /*return*/, q.Promise(function (resolve, reject) {
                            fileService.listFilesAndDirectoriesSegmented(shareName, directory, currentToken, options, function (error, result, ignoredResponse) {
                                if (error) {
                                    reject(StorageManagerHelper.processError(error));
                                }
                                else {
                                    var files = [];
                                    var fileResults = result.entries.files || [];
                                    fileResults.forEach(function (fileResult) {
                                        if (!!prefix && prefix !== "" && !_string.startsWith(fileResult.name, prefix)) {
                                            return;
                                        }
                                        // No network calls here
                                        var fullName = Path.posix.join(directory, fileResult.name);
                                        var uri = fileService.getUrl(shareName, directory, fileResult.name, /* sasToken */ null, /* primary */ true);
                                        // Properties returned are file name and content length as of the Azure Storage Client Library v0.10.0.
                                        // This behavior matches the File Service REST API, see: https://msdn.microsoft.com/en-us/library/azure/dn166980.aspx
                                        files.push({
                                            FileName: fileResult.name,
                                            FullName: fullName,
                                            Size: fileResult.contentLength,
                                            Uri: uri,
                                            ContentType: "" // Not available, see comment regarding properties returned above.
                                        });
                                    });
                                    var directories = [];
                                    var directoryResults = result.entries.directories || [];
                                    directoryResults.forEach(function (directoryResult) {
                                        if (!!prefix && prefix !== "" && !_string.startsWith(directoryResult.name, prefix)) {
                                            return;
                                        }
                                        // No network calls here
                                        // Add slash to end to mimic what we're currently doing with StorageManagerHelpers
                                        var fullName = Path.posix.join(directory, directoryResult.name) + "/";
                                        var uri = fileService.getUrl(shareName, fullName, /* file */ null, /* sasToken */ null, /* primary */ true);
                                        // Only the directory name is returned as of the Azure Storage Client Library v0.10.0.
                                        // This behavior matches the File Service REST API, see: https://msdn.microsoft.com/en-us/library/azure/dn166980.aspx
                                        directories.push({
                                            FileName: directoryResult.name,
                                            FullName: fullName,
                                            Uri: uri,
                                            ContentType: "Folder" // StorageExplorerConstants.ContentTypes.Folder
                                        });
                                    });
                                    resolve({
                                        Files: files,
                                        Directories: directories,
                                        ContinuationToken: result.continuationToken
                                    });
                                }
                            });
                        })];
            }
        });
    });
}
exports.listFilesAndDirectoriesSegmented = listFilesAndDirectoriesSegmented;
