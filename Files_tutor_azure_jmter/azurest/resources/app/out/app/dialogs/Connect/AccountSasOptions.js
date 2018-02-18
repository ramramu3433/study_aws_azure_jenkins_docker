"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var _string = require("underscore.string");
var AccountSasOptions = (function () {
    function AccountSasOptions(query) {
        this.services = {
            blobs: query.ss && _string.contains(query.ss, "b"),
            files: query.ss && _string.contains(query.ss, "f"),
            queues: query.ss && _string.contains(query.ss, "q"),
            tables: query.ss && _string.contains(query.ss, "t")
        };
        this.resourceTypes = {
            service: query.srt && _string.contains(query.srt, "s"),
            container: query.srt && _string.contains(query.srt, "c"),
            object: query.srt && _string.contains(query.srt, "o")
        };
        this.permissions = {
            read: query.sp && _string.contains(query.sp, "r"),
            write: query.sp && _string.contains(query.sp, "w"),
            delete: query.sp && _string.contains(query.sp, "d"),
            list: query.sp && _string.contains(query.sp, "l"),
            add: query.sp && _string.contains(query.sp, "a"),
            create: query.sp && _string.contains(query.sp, "c"),
            update: query.sp && _string.contains(query.sp, "u"),
            process: query.sp && _string.contains(query.sp, "p")
        };
    }
    AccountSasOptions.prototype.hasBlobAccess = function () {
        return this.services.blobs;
    };
    AccountSasOptions.prototype.hasFileAccess = function () {
        return this.services.files;
    };
    AccountSasOptions.prototype.hasQueueAccess = function () {
        return this.services.queues;
    };
    AccountSasOptions.prototype.hasTableAccess = function () {
        return this.services.tables;
    };
    AccountSasOptions.prototype.canListBlobContainers = function () {
        return this.services.blobs &&
            this.resourceTypes.service &&
            this.permissions.list;
    };
    AccountSasOptions.prototype.canListFileShares = function () {
        return this.services.files &&
            this.resourceTypes.service &&
            this.permissions.list;
    };
    AccountSasOptions.prototype.canListBlobs = function () {
        return this.services.blobs &&
            this.resourceTypes.container &&
            this.permissions.list;
    };
    AccountSasOptions.prototype.canListQueues = function () {
        return this.services.queues &&
            this.resourceTypes.service &&
            this.permissions.read;
    };
    AccountSasOptions.prototype.canPeekMessages = function () {
        return this.services.queues &&
            this.resourceTypes.object &&
            this.permissions.read;
    };
    AccountSasOptions.prototype.canQueryTables = function () {
        return this.services.tables &&
            this.resourceTypes.container &&
            this.permissions.list;
    };
    AccountSasOptions.prototype.canQueryEntities = function () {
        return this.services.tables &&
            this.resourceTypes.object &&
            this.permissions.read;
    };
    return AccountSasOptions;
}());
exports.default = AccountSasOptions;
