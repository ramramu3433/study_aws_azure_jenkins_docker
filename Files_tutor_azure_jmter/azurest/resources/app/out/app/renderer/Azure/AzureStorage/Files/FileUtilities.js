"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var azure_storage_1 = require("azure-storage");
var q = require("q");
var FlobManager = require("../FlobManager");
var StorageManagerHelper = require("../StorageManagerHelper");
var StorageCancelFilter_1 = require("../StorageCancelFilter");
var AzureStorage = require("azure-storage");
var host = global.host;
/**
 * @param callerName Identifies the caller for telemetry purposes.
 * In most cases, just pass in the caller function name.
 */
function getFileService(connectionString, callerName, retryDuration) {
    if (retryDuration === void 0) { retryDuration = StorageManagerHelper.RetryDurations.Short; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var storageApiVersion;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!!host) return [3 /*break*/, 2];
                    return [4 /*yield*/, host.executeOperation("StorageApiSettingManager.getStorageApiSetting", {})];
                case 1:
                    storageApiVersion = _a.sent();
                    AzureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION = storageApiVersion;
                    _a.label = 2;
                case 2: return [2 /*return*/, q.Promise(function (resolve, reject) {
                        function prepareFileService(service) {
                            StorageManagerHelper.setRequestEventHandler(service);
                            service.parallelOperationThreadCount = FlobManager.DefaultParallelOperationThreadCount;
                            // Add retry (at the individual Azure operations level, e.g. block upload/download)
                            var retryPolicy = StorageManagerHelper.createStorageRetryPolicy(callerName, retryDuration);
                            service = service.withFilter(retryPolicy);
                            // Expose cancel
                            var cancelFilter = new StorageCancelFilter_1.default(callerName);
                            var cancelableService = service.withFilter(cancelFilter);
                            cancelableService.cancelFilter = cancelFilter;
                            return cancelableService;
                        }
                        var fileService = new azure_storage_1.FileService(connectionString);
                        resolve(prepareFileService(fileService));
                    })];
            }
        });
    });
}
exports.getFileService = getFileService;
