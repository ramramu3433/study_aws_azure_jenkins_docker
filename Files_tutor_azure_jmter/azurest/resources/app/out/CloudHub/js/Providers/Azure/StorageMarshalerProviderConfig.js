/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    // TODO: rename to StorageProviderCSharpConfig?
    var StorageMarshalerProviderConfig = (function () {
        function StorageMarshalerProviderConfig() {
            this.namespace = "Azure.CSharp.Storage";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.StorageProvider"
            };
            this.exports = [
                "Azure.Actions.Storage.showEditor",
                "Azure.Actions.Storage.closeEditor",
                "Azure.Actions.Storage.getEditorInfo",
                "Azure.Actions.Storage.storageRequest",
                "Azure.Actions.Storage.createBlobContainer",
                "Azure.Actions.Storage.getBlobContainer",
                "Azure.Actions.Storage.getBlobContainerPublicAccessLevel",
                "Azure.Actions.Storage.deleteBlobContainer",
                "Azure.Actions.Storage.createFileShare",
                "Azure.Actions.Storage.getFileShare",
                "Azure.Actions.Storage.deleteFileShare",
                "Azure.Actions.Storage.createQueue",
                "Azure.Actions.Storage.getQueue",
                "Azure.Actions.Storage.deleteQueue",
                "Azure.Actions.Storage.createTable",
                "Azure.Actions.Storage.getTable",
                "Azure.Actions.Storage.deleteTable"
            ];
        }
        return StorageMarshalerProviderConfig;
    }());
    return StorageMarshalerProviderConfig;
});
