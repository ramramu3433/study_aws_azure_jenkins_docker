"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var blobManager = require("../Azure/AzureStorage/BlobManager");
var fileManager = require("../Azure/AzureStorage/FileManager");
var commonStorageManager = require("../Azure/AzureStorage/CommonStorageManager");
var environmentMarshaler = require("../marshalers/EnvironmentMarshaler");
var tableManager = require("../Azure/AzureStorage/TableManager");
var queueManager = require("../Azure/AzureStorage/QueueManager");
var storageProvider = {
    "Azure.Actions.Storage.showEditor": function (args) { return commonStorageManager.showStorageEditor(args.editorNamespace, args.connectionString, args.name, args.connectionType, args.source === "singleClick", // temporaryTab,
    args.path, args.target, args.openNewTab, args.subscription); },
    "Azure.Actions.Storage.closeEditor": function (args) { return commonStorageManager.closeStorageEditor(); },
    "Azure.Actions.Storage.getEditorInfo": function (args) { return commonStorageManager.getStorageEditorInfo(); },
    "Azure.Actions.Storage.storageRequest": function (args) { return commonStorageManager.listContainersSegmented(args.requestNamespace, args.connectionString, args.searchQuery, args.continuationToken, args.numberOfResults); },
    "Azure.Actions.Storage.createBlobContainer": function (args) { return blobManager.createBlobContainer(args.connectionString, args.containerName, args.accessLevel); },
    "Azure.Actions.Storage.createBlobContainerFromExisting": function (args) { return blobManager.createBlobContainerFromExisting(args.sourceConnectionString, args.sourceContainerName, args.targetConnectionString, args.targetContainerName); },
    "Azure.Actions.Storage.getBlobContainer": function (args) { return blobManager.getBlobContainer(args.connectionString, args.containerName); },
    "Azure.Actions.Storage.getBlobContainerProperties": function (args) { return blobManager.getContainerProperties(args.connectionString, args.containerName); },
    "Azure.Actions.Storage.getBlobContainerPublicAccessLevel": function (args) { return blobManager.getContainerPublicAccessLevel(args.connectionString, args.containerName); },
    "Azure.Actions.Storage.getSASBlobContainer": function (args) { return blobManager.getSASBlobContainer(args.connectionString, args.searchQuery, args.containerName); },
    "Azure.Actions.Storage.deleteBlobContainer": function (args) { return blobManager.deleteBlobContainer(args.connectionString, args.containerName); },
    "Azure.Actions.Storage.acquireLease": function (args) { return blobManager.acquireLease(args.connectionString, args.containerName, args.blobName // optional
    ); },
    "Azure.Actions.Storage.breakLease": function (args) { return blobManager.breakLease(args.connectionString, args.containerName, args.blobName // optional
    ); },
    "Azure.Actions.Storage.createFileShare": function (args) { return fileManager.createFileShare(args.connectionString, args.shareName, args.quota); },
    "Azure.Actions.Storage.createFileShareFromExisting": function (args) { return fileManager.createFileShareFromExisting(args.sourceConnectionString, args.sourceShareName, args.targetConnectionString, args.targetShareName); },
    "Azure.Actions.Storage.getFileShare": function (args) { return fileManager.getFileShare(args.connectionString, args.shareName); },
    "Azure.Actions.Storage.getFileShareProperties": function (args) { return fileManager.getFileShareProperties(args.connectionString, args.shareName); },
    "Azure.Actions.Storage.getSASFileShare": function (args) { return fileManager.getSASFileShare(args.connectionString, args.searchQuery, args.shareName); },
    "Azure.Actions.Storage.deleteFileShare": function (args) { return fileManager.deleteFileShare(args.connectionString, args.shareName); },
    "Azure.Actions.Storage.createQueue": function (args) { return queueManager.createQueue(args.connectionString, args.queueName); },
    "Azure.Actions.Storage.getQueue": function (args) { return queueManager.getQueue(args.connectionString, args.queueName); },
    "Azure.Actions.Storage.getSASQueue": function (args) { return queueManager.getSASQueue(args.connectionString, args.searchQuery, args.queueName); },
    "Azure.Actions.Storage.deleteQueue": function (args) { return queueManager.deleteQueue(args.connectionString, args.queueName); },
    "Azure.Actions.Storage.createTable": function (args) { return tableManager.createTable(args.connectionString, args.tableName); },
    "Azure.Actions.Storage.getTable": function (args) { return tableManager.getTable(args.connectionString, args.tableName); },
    "Azure.Actions.Storage.getSASTable": function (args) { return tableManager.getSASTable(args.connectionString, args.searchQuery, args.tableName); },
    "Azure.Actions.Storage.deleteTable": function (args) { return tableManager.deleteTable(args.connectionString, args.tableName); },
    "Azure.Attributes.Storage.getCanPasteBlobContainerAttribute": function (args) {
        var containsBlobContainer = environmentMarshaler.clipboardContainsData("CloudHub.Azure.Storage.BlobContainer");
        var attributes = [
            {
                name: "canPasteBlobContainerToBlobContainersNode",
                value: containsBlobContainer,
                expiration: Date.now() + 300
            }
        ];
        return { results: attributes };
    },
    "Azure.Attributes.Storage.getCanPasteFileShareAttribute": function (args) {
        var containsFileShare = environmentMarshaler.clipboardContainsData("CloudHub.Azure.Storage.FileShare");
        var attributes = [
            {
                name: "canPasteFileShareToFileSharesNode",
                value: containsFileShare,
                expiration: Date.now() + 300
            }
        ];
        return { results: attributes };
    },
    "Azure.Attributes.Storage.getCanPasteTableAttribute": function (args) {
        var containsTable = environmentMarshaler.clipboardContainsData("CloudHub.Azure.Storage.Table");
        var attributes = [
            {
                name: "canPasteTable",
                value: containsTable,
                expiration: Date.now() + 300
            }
        ];
        return { results: attributes };
    }
};
module.exports = storageProvider;
