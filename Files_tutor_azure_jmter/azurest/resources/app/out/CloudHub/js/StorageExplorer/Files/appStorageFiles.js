/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "knockout", "StorageExplorer/Files/FileExplorerViewModel", "CloudExplorer/UI/KnockoutBindings", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings", "StorageExplorer/Files/DataTableBindingManager"], function (require, exports, $, ko, FileExplorerViewModel_1) {
    "use strict";
    /**
     * This is the main entry point of storage Explorer.
     * RequireJS will execute this function first.
     */
    $(document).ready(function () {
        window.pluginReady(function () {
            var viewModel = new FileExplorerViewModel_1.default();
            ko.applyBindings(viewModel);
        });
    });
});
