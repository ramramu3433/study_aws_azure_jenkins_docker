"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.themePath = "./app/renderer/theme";
exports.StatusCode = {
    noContent: 204
};
var InfoBarTypes;
(function (InfoBarTypes) {
    InfoBarTypes[InfoBarTypes["errorLink"] = 1] = "errorLink";
    InfoBarTypes[InfoBarTypes["addAccount"] = 2] = "addAccount";
    InfoBarTypes[InfoBarTypes["selectAccount"] = 3] = "selectAccount";
    InfoBarTypes[InfoBarTypes["signUpSubscriptions"] = 4] = "signUpSubscriptions";
    InfoBarTypes[InfoBarTypes["reauthentication"] = 5] = "reauthentication";
    InfoBarTypes[InfoBarTypes["other"] = 6] = "other";
})(InfoBarTypes = exports.InfoBarTypes || (exports.InfoBarTypes = {}));
// A constant used for pass arguments from main process to renderer process.
exports.sharedObjectName = "sharedObject";
exports.macParams = "macParams";
// A storage account deeplink:
//  storageexplorer:v=1&subscriptionid=value1&accountid=value2
// A Blob Container deeplink:
//   storageexplorer:v=1&subscriptionid=value1&accountid=value2&resourcetype="Azure.BlobContainer"&resourcename=value3
// Note: all value parts are URI encoded.
exports.deeplinkProtocol = "storageexplorer:";
// ID for Attach and Local node.
exports.externalSubscriptionId = "Azure.ExternalSubscription";
exports.startupParameterNames = {
    accountId: "accountid",
    subscriptionId: "subscriptionid",
    resourceType: "resourcetype",
    resourceName: "resourcename",
    source: "source"
};
exports.storageTypes = {
    blobContainer: "Azure.BlobContainer",
    fileShare: "Azure.FileShare",
    table: "Azure.Table",
    queue: "Azure.Queue"
};
exports.storageTypeNames = {
    blobContainer: "container",
    fileShare: "file share",
    table: "table",
    queue: "queue"
};
exports.panelInfos = {
    settingsPanel: {
        displayName: {
            value: "Settings"
        },
        name: "Settings",
        panelNamespace: "azureFilterPanel",
        providerNamespace: "Azure.FilterPanel"
    }
};
exports.Int32 = {
    Min: -2147483648,
    Max: 2147483647
};
exports.Int64 = {
    Min: -9223372036854775808,
    Max: 9223372036854775807
};
exports.MaxNumOfMessagesToPeek = 32;
var yearMonthDay = "\\d{4}[- ][01]\\d[- ][0-3]\\d";
var timeOfDay = "T[0-2]\\d:[0-5]\\d(:[0-5]\\d(\\.\\d+)?)?";
var timeZone = "Z|[+-][0-2]\\d:[0-5]\\d";
exports.Validate = {
    Guid: /^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i,
    Float: /^[+-]?\d+(\.\d+)?(e[+-]?\d+)?$/i,
    // OData seems to require an "L" suffix for Int64 values, yet Azure Storage errors out with it. See http://www.odata.org/documentation/odata-version-2-0/overview/
    Integer: /^[+-]?\d+$/i,
    Boolean: /^"?(true|false)"?$/i,
    DateTime: new RegExp("^" + yearMonthDay + timeOfDay + timeZone + "$")
};
exports.UncaughtExceptionRendererEvent = "STORAGEEXPLORER_UNCAUGHTEXCEPTION_RENDERER_PROCESS";
exports.ClearCookieJarIpcChannel = "STORAGEEXPLORER_CLEARCOOKIEJAR";
exports.DownloadFileIpcChannel = "STORAGEEXPLORER_DOWNLOADFILE";
exports.DownloadDoneIpcChannel = "STORAGEEXPLORER_DOWNLOADDONE";
