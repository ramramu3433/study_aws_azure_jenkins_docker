"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var fs = require("fs");
var telemetryManager = require("./telemetry/TelemetryManager");
var BlobOverwriteOptions_1 = require("./JobHandlers/Blob/BlobOverwriteOptions");
var fileIsWatched = {};
var _host = global.host;
/**
 * Watches a file for any changes
 */
function watchFileChange(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            fs.watchFile(args.filePath, { persistent: true, interval: 300 }, function (curr, prev) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var dialogParameters, dialogResult, uploadPolicy;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(curr.mtime.getTime() !== prev.mtime.getTime() && !args.blobArgs.blobRef.snapshot)) return [3 /*break*/, 3];
                            if (!!fileIsWatched[args.filePath]) return [3 /*break*/, 3];
                            fileIsWatched[args.filePath] = true;
                            dialogParameters = {
                                title: "File Changes Detected",
                                message: "\u2019" + args.fileName + "\u2019 has been modified by an external program. " + args.messagePrompt,
                                options: [
                                    {
                                        title: "Upload",
                                        value: BlobOverwriteOptions_1.default.Overwrite
                                    },
                                    {
                                        title: "Snapshot original blob then upload",
                                        value: BlobOverwriteOptions_1.default.Snapshot
                                    },
                                    {
                                        title: "Ignore for now and save later",
                                        value: BlobOverwriteOptions_1.default.Skip
                                    },
                                    {
                                        title: "Ignore all changes from this file",
                                        value: BlobOverwriteOptions_1.default.Never
                                    }
                                ],
                                defaultOptionValue: "skip",
                                buttons: [
                                    {
                                        title: "Apply",
                                        value: "apply"
                                    }
                                ]
                            };
                            return [4 /*yield*/, _host.executeOperation("Environment.Dialogs.getDialogResult", {
                                    id: "options",
                                    parameters: dialogParameters
                                })];
                        case 1:
                            dialogResult = _a.sent();
                            if (!!!dialogResult) return [3 /*break*/, 3];
                            uploadPolicy = dialogResult.option;
                            telemetryManager.sendEvent("StorageExplorer.BlobOpen.UploadBlobPromptAction", { "Action": uploadPolicy });
                            return [4 /*yield*/, processUploadOption(uploadPolicy, args.callBackNameSpace, args.callBackArgs, args.filePath, args.blobArgs)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
exports.watchFileChange = watchFileChange;
function processUploadOption(uploadOption, callBackNameSpace, callBackArgs, filePath, args) {
    var jobArgs = callBackArgs.job.properties.args;
    switch (uploadOption) {
        case BlobOverwriteOptions_1.default.Overwrite:
            jobArgs.blobOverwritePolicy = BlobOverwriteOptions_1.default.Overwrite;
            _host.executeOperation(callBackNameSpace, callBackArgs);
            fileIsWatched[filePath] = null;
            _host.executeOperation("StorageExplorer.Blob.BlobUpdate", { blobContainerRef: args.blobContainerRef });
            break;
        case BlobOverwriteOptions_1.default.Skip:
            fileIsWatched[filePath] = false;
            break;
        case BlobOverwriteOptions_1.default.Never:
            fs.unwatchFile(filePath);
            fileIsWatched[filePath] = false;
            break;
        case BlobOverwriteOptions_1.default.Snapshot:
            jobArgs.blobOverwritePolicy = BlobOverwriteOptions_1.default.Snapshot;
            _host.executeOperation(callBackNameSpace, callBackArgs);
            fileIsWatched[filePath] = false;
            _host.executeOperation("StorageExplorer.Blob.BlobUpdate", { blobContainerRef: args.blobContainerRef });
            break;
    }
    return Promise.resolve(null);
}
function unWatchFile(filePath) {
    fs.unwatchFile(filePath);
    return Promise.resolve(null);
}
exports.unWatchFile = unWatchFile;
