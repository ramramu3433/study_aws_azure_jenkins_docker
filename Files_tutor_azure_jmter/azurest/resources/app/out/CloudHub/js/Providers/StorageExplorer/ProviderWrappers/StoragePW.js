/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    function getBlobContainerPublicAccessLevel(host, connectionString, containerName) {
        return host.executeOperation("Azure.Actions.Storage.getBlobContainerPublicAccessLevel", [{
                connectionString: connectionString,
                containerName: containerName
            }]);
    }
    exports.getBlobContainerPublicAccessLevel = getBlobContainerPublicAccessLevel;
    function getSASBlobContainer(host, connectionString, containerName) {
        return host.executeOperation("Azure.Actions.Storage.getSASBlobContainer", [{
                connectionString: connectionString,
                searchQuery: null,
                containerName: containerName
            }]).then(function (result) {
            if (result && result.storageResources && result.storageResources.length) {
                return result.storageResources[0];
            }
        });
    }
    exports.getSASBlobContainer = getSASBlobContainer;
    function getBlobContainer(host, connectionString, containerName) {
        return host.executeOperation("Azure.Actions.Storage.getBlobContainer", [{
                connectionString: connectionString,
                containerName: containerName
            }]);
    }
    exports.getBlobContainer = getBlobContainer;
    function getFileShare(host, connectionString, shareName) {
        return host.executeOperation("Azure.Actions.Storage.getFileShare", [{
                connectionString: connectionString,
                shareName: shareName
            }]);
    }
    exports.getFileShare = getFileShare;
    function getSASFileShare(host, connectionString, shareName) {
        return host.executeOperation("Azure.Actions.Storage.getSASFileShare", [{
                connectionString: connectionString,
                searchQuery: null,
                shareName: shareName
            }])
            .then(function (result) {
            if (result && result.storageResources && result.storageResources.length) {
                return result.storageResources[0];
            }
        });
    }
    exports.getSASFileShare = getSASFileShare;
    ;
    function getQueue(host, connectionString, queueName) {
        return host.executeOperation("Azure.Actions.Storage.getQueue", [{
                connectionString: connectionString,
                queueName: queueName
            }]);
    }
    exports.getQueue = getQueue;
    function getSASQueue(host, connectionString, queueName) {
        return host.executeOperation("Azure.Actions.Storage.getSASQueue", [{
                connectionString: connectionString,
                searchQuery: null,
                queueName: queueName
            }])
            .then(function (result) {
            if (result && result.storageResources && result.storageResources.length) {
                return result.storageResources[0];
            }
        });
    }
    exports.getSASQueue = getSASQueue;
    function getTable(host, connectionString, tableName) {
        return host.executeOperation("Azure.Actions.Storage.getTable", [{
                connectionString: connectionString,
                tableName: tableName
            }]);
    }
    exports.getTable = getTable;
    function getSASTable(host, connectionString, tableName) {
        return host.executeOperation("Azure.Actions.Storage.getSASTable", [{
                connectionString: connectionString,
                searchQuery: null,
                tableName: tableName
            }])
            .then(function (result) {
            if (result && result.storageResources && result.storageResources.length) {
                return result.storageResources[0];
            }
        });
    }
    exports.getSASTable = getSASTable;
});
