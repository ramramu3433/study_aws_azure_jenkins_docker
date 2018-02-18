/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var StorageExplorerProviderConfig = (function () {
        function StorageExplorerProviderConfig() {
            this.namespace = "StorageExplorer.Storage";
            this.requirePath = "Providers/StorageExplorer/StorageExplorerProvider";
            this.exports = [
                "Azure.Actions.Storage.Blob.copyBlobContainerToClipboard",
                "Azure.Actions.Storage.Blob.generateBlobContainerSharedAccessSignature",
                "Azure.Actions.Storage.Blob.manageBlobContainerAccessControlList",
                "Azure.Actions.Storage.Blob.pasteBlobContainerToStorageAccount",
                "Azure.Actions.Storage.Blob.renameBlobContainer",
                "Azure.Actions.Storage.Blob.safeSetContainerPublicAccessLevel",
                "Azure.Actions.Storage.Blob.acquireBlobContainerLease",
                "Azure.Actions.Storage.Blob.breakBlobContainerLease",
                "Azure.Actions.Storage.Blob.configureCORS",
                "Azure.Actions.Storage.File.configureCORS",
                "Azure.Actions.Storage.File.copyFileShareToClipboard",
                "Azure.Actions.Storage.File.pasteFileShareToStorageAccount",
                "Azure.Actions.Storage.File.generateSharedAccessSignature",
                "Azure.Actions.Storage.File.manageAccessControlList",
                "Azure.Actions.Storage.File.renameFileShare",
                "Azure.Actions.Storage.Queue.generateSharedAccessSignature",
                "Azure.Actions.Storage.Queue.configureCORS",
                "Azure.Actions.Storage.Queue.manageAccessControlList",
                "Azure.Actions.Storage.Table.copyTableToClipboard",
                "Azure.Actions.Storage.Table.generateSharedAccessSignature",
                "Azure.Actions.Storage.Table.manageAccessControlList",
                "Azure.Actions.Storage.Table.pasteTable",
                "Azure.Actions.Storage.Table.configureCORS",
                "Azure.Actions.Storage.Table.renameTable",
                "Azure.Actions.Storage.addStorageAccount",
                "Azure.Actions.Storage.addStorageAccountSAS",
                "Azure.Actions.Storage.copyLinkToResource",
                "Azure.Actions.Storage.addToQuickAccess",
                "Azure.Actions.Storage.removeFromQuickAccess",
                "Azure.Actions.Storage.refreshQuickAccess",
                "Azure.Actions.Storage.detachStorageAccount",
                "Azure.Actions.Storage.detachStorageServiceSAS",
                "Azure.Actions.Storage.generateSharedAccessSignature",
                "Azure.Producers.ResourceTypes.GetQuickAccess",
                "StorageExplorer.OpenConnectDialog",
                "StorageExplorer.OpenProxySettingsDialog"
            ];
        }
        return StorageExplorerProviderConfig;
    }());
    return StorageExplorerProviderConfig;
});
