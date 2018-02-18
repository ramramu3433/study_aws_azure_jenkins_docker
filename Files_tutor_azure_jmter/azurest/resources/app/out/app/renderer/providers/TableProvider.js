"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var TableManager = require("../Azure/AzureStorage/TableManager");
var TableProvider = {
    "Azure.Storage.Table.addEntity": function (args) {
        return TableManager.addEntity(args.connectionString, args.tableName, args.newEntity, args.operation);
    },
    "Azure.Storage.Table.addEntities": function (args) {
        return TableManager.addEntities(args.connectionString, args.tableName, args.newEntities, args.operation);
    },
    "Azure.Storage.Table.updateEntity": function (args) {
        return TableManager.updateEntity(args.connectionString, args.tableName, args.newEntity);
    },
    "Azure.Storage.Table.deleteEntities": function (args) {
        return TableManager.deleteEntities(args.connectionString, args.tableName, args.entities);
    },
    "Azure.Storage.Table.listTableEntitiesSegmented": function (args) {
        return TableManager.listTableEntitiesSegmented(args.tableReference, args.continuationToken, args.numResults, args.tableQuery);
    },
    "Azure.Storage.Table.doesTableExist": function (args) {
        return TableManager.doesTableExist(args.connectionString, args.tableName);
    },
    "Azure.Storage.Table.setCorsRules": function (args) {
        return TableManager.setCorsRules(args.connectionString, args.rules);
    },
    "Azure.Storage.Table.getCorsRules": function (args) {
        return TableManager.getCorsRules(args.connectionString);
    },
    "Azure.Storage.Table.parseFromCsv": function (args) {
        return TableManager.parseFromCsv(args.lines);
    },
    "Azure.Storage.Table.getAccessControlList": function (args) {
        return TableManager.getAccessControlList(args.connectionString, args.tableName);
    },
    "Azure.Storage.Table.setAccessControlList": function (args) {
        return TableManager.setAccessControlList(args.connectionString, args.tableName, args.sharedAccessPolicies);
    },
    "Azure.Storage.Table.generateSharedAccessSignature": function (args) {
        return TableManager.generateSharedAccessSignature(args.connectionString, args.tableName, args.expiry, args.start, args.permissions, args.startPartitionKey, args.endPartitionKey, args.startRowKey, args.endRowKey);
    },
    "Azure.Storage.Table.generateSharedAccessSignatureWithPolicy": function (args) {
        return TableManager.generateSharedAccessSignatureWithPolicy(args.connectionString, args.tableName, args.accessPolicyId);
    }
};
module.exports = TableProvider;
