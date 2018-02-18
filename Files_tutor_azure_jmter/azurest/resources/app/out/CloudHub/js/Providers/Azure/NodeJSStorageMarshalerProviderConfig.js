/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    // TODO: rename to StorageProviderNodeJSConfig?
    var NodeJSStorageMarshalerProviderConfig = (function () {
        function NodeJSStorageMarshalerProviderConfig() {
            this.namespace = "NodeJS.Azure.Storage";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/StorageProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "Azure.Actions.Storage.showEditor",
                "Azure.Actions.Storage.closeEditor",
                "Azure.Actions.Storage.getEditorInfo",
                "Azure.Actions.Storage.storageRequest",
                "Azure.Actions.Storage.createBlobContainer",
                "Azure.Actions.Storage.createBlobContainerFromExisting",
                "Azure.Actions.Storage.getBlobContainer",
                "Azure.Actions.Storage.getBlobContainerPublicAccessLevel",
                "Azure.Actions.Storage.getSASBlobContainer",
                "Azure.Actions.Storage.deleteBlobContainer",
                "Azure.Actions.Storage.createFileShare",
                "Azure.Actions.Storage.createFileShareFromExisting",
                "Azure.Actions.Storage.getFileShare",
                "Azure.Actions.Storage.getSASFileShare",
                "Azure.Actions.Storage.deleteFileShare",
                "Azure.Actions.Storage.createQueue",
                "Azure.Actions.Storage.getQueue",
                "Azure.Actions.Storage.getSASQueue",
                "Azure.Actions.Storage.deleteQueue",
                "Azure.Actions.Storage.createTable",
                "Azure.Actions.Storage.getTable",
                "Azure.Actions.Storage.getSASTable",
                "Azure.Actions.Storage.deleteTable",
                "Azure.Attributes.Storage.getCanPasteBlobContainerAttribute",
                "Azure.Attributes.Storage.getCanPasteTableAttribute",
                "Azure.Attributes.Storage.getCanPasteFileShareAttribute"
            ];
        }
        return NodeJSStorageMarshalerProviderConfig;
    }());
    return NodeJSStorageMarshalerProviderConfig;
});
