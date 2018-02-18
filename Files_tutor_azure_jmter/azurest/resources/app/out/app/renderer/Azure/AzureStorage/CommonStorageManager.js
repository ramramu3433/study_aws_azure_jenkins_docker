"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var IsolatedEnvironment_1 = require("../../UI/Tabs/IsolatedEnvironment");
var HostProxyMarshaler_1 = require("../../marshalers/HostProxyMarshaler");
var ShellViewModel_1 = require("../../UI/ShellViewModel");
var StandardMarshaler_1 = require("../../marshalers/StandardMarshaler");
var activityLogMarshalerFactory = require("../../marshalers/ActivityLogMarshalerFactory");
var DaytonaTabMessengerMarshalerFactory_1 = require("../../marshalers/DaytonaTabMessengerMarshalerFactory");
var azureMarshaler = require("../marshalers/AzureMarshaler");
var azureBlobMarshaler = require("../marshalers/AzureBlobMarshaler");
var azureFileMarshaler = require("../marshalers/AzureFileMarshaler");
var azureQueueMarshaler = require("../marshalers/AzureQueueMarshaler");
var azureTableMarshaler = require("../marshalers/AzureTableMarshaler");
var blobManager = require("./BlobManager");
var environmentMarshaler = require("../../marshalers/EnvironmentMarshaler");
var fileManager = require("./FileManager");
var queueManager = require("./QueueManager");
var tableManager = require("./TableManager");
var telemetryMarshaler = require("../../marshalers/TelemetryMarshaler");
function showStorageEditor(editorNamespace, connectionString, name, connectionType, temporaryTab, path, target, openInNewTab, subscription) {
    if (temporaryTab === void 0) { temporaryTab = true; }
    if (path === void 0) { path = null; }
    if (target === void 0) { target = null; }
    if (openInNewTab === void 0) { openInNewTab = false; }
    if (subscription === void 0) { subscription = null; }
    var storageExplorerManifest;
    var parameters;
    var iconPath;
    switch (editorNamespace) {
        case "BlobContainer":
            storageExplorerManifest = "./app/renderer/manifests/StorageExplorerBlobs.json";
            parameters = {
                connectionString: connectionString,
                containerName: name,
                subscription: subscription
            };
            iconPath = "../../CloudHub/images/CloudExplorer/AzureBlob_16x.png";
            break;
        case "Table":
            storageExplorerManifest = "./app/renderer/manifests/StorageExplorerTables.json";
            parameters = {
                connectionString: connectionString,
                tableName: name,
                connectionType: connectionType
            };
            iconPath = "../../CloudHub/images/CloudExplorer/AzureTable_16x.png";
            break;
        case "Queue":
            storageExplorerManifest = "./app/renderer/manifests/StorageExplorerQueues.json";
            parameters = {
                connectionString: connectionString,
                queueName: name
            };
            iconPath = "../../CloudHub/images/CloudExplorer/AzureQueue_16x.png";
            break;
        case "FileShare":
            storageExplorerManifest = "./app/renderer/manifests/StorageExplorerFiles.json";
            parameters = {
                connectionString: connectionString,
                shareName: name
            };
            iconPath = "../../CloudHub/images/CloudExplorer/AzureFileShare_16x.png";
            break;
        default:
            throw new Error("");
    }
    ShellViewModel_1.default.editorPanelViewModel.showTab(name, path, {
        environment: IsolatedEnvironment_1.default.DaytonaIframe,
        iconPath: iconPath,
        nodeID: target,
        parameters: parameters,
        editorNamespace: editorNamespace,
        source: storageExplorerManifest,
        marshalers: {
            "ActivityLog": activityLogMarshalerFactory.createMarshaler(),
            "Environment": StandardMarshaler_1.default.getStandardMarshaler(environmentMarshaler),
            "Azure": StandardMarshaler_1.default.getStandardMarshaler(azureMarshaler),
            "AzureBlobs": StandardMarshaler_1.default.getStandardMarshaler(azureBlobMarshaler),
            "AzureFiles": StandardMarshaler_1.default.getStandardMarshaler(azureFileMarshaler),
            "AzureQueues": StandardMarshaler_1.default.getStandardMarshaler(azureQueueMarshaler),
            "AzureTables": StandardMarshaler_1.default.getStandardMarshaler(azureTableMarshaler),
            "Telemetry": StandardMarshaler_1.default.getStandardMarshaler(telemetryMarshaler),
            "HostProxy": HostProxyMarshaler_1.default,
            "DaytonaTabMessenger": DaytonaTabMessengerMarshalerFactory_1.default.createMarshaler()
        },
        temporaryTab: temporaryTab,
        newTab: openInNewTab,
        cacheOnClose: true
    });
}
exports.showStorageEditor = showStorageEditor;
function getStorageEditorInfo() {
    return ShellViewModel_1.default.editorPanelViewModel.getActiveTabInfo();
}
exports.getStorageEditorInfo = getStorageEditorInfo;
function closeStorageEditor() {
    ShellViewModel_1.default.editorPanelViewModel.closeActiveTab();
}
exports.closeStorageEditor = closeStorageEditor;
/**
 * List all storage resources of the given type for the given account.
 */
function listContainersSegmented(containerType, connectionString, searchQuery, currentToken, numResults) {
    if (numResults === null || numResults === undefined) {
        numResults = 20;
    }
    switch (containerType) {
        case "ListBlobContainers":
            return blobManager.listBlobContainersSegmented(connectionString, currentToken, searchQuery, numResults);
        case "ListSingleBlobContainerByName":
            return blobManager.listSingleBlobContainerByName(connectionString, searchQuery);
        case "ListFileShares":
            return fileManager.listFileSharesSegmented(connectionString, currentToken, searchQuery, numResults);
        case "ListSingleFileShareByName":
            return fileManager.listSingleFileShareByName(connectionString, searchQuery);
        case "ListQueues":
            return queueManager.listQueuesSegmented(connectionString, currentToken, searchQuery, numResults);
        case "ListSingleQueueByName":
            return queueManager.listSingleQueueByName(connectionString, searchQuery);
        case "ListTables":
            return tableManager.listTablesSegmented(connectionString, currentToken, searchQuery, numResults);
        case "ListSingleTableByName":
            return tableManager.listSingleTableByName(connectionString, searchQuery);
        case "SASBlobContainers":
            var blobContainers = JSON.parse(connectionString);
            return blobManager.getSASBlobContainers(blobContainers, searchQuery);
        case "SASFileShares":
            var fileShares = JSON.parse(connectionString);
            return fileManager.getSASFileShares(fileShares, searchQuery);
        case "SASQueues":
            var queues = JSON.parse(connectionString);
            return queueManager.getSASQueues(queues, searchQuery);
        case "SASTables":
            var tables = JSON.parse(connectionString);
            return tableManager.getSASTables(tables, searchQuery);
        default:
            return Q.reject("Invalid container type");
    }
}
exports.listContainersSegmented = listContainersSegmented;
