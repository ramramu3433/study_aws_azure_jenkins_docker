/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "knockout", "StorageExplorer/Blobs/BlobExplorerViewModel", "text", "CloudExplorer/UI/KnockoutBindings", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings", "StorageExplorer/Blobs/DataTableBindingManager"], function (require, exports, $, ko, BlobExplorerViewModel_1) {
    "use strict";
    /**
     * This is the main entry point of storage Explorer.
     * RequireJS will execute this function first.
     */
    $(document).ready(function () {
        window.pluginReady(function () {
            var blobExplorerViewModel = new BlobExplorerViewModel_1.default();
            ko.applyBindings(blobExplorerViewModel);
        });
    });
});
