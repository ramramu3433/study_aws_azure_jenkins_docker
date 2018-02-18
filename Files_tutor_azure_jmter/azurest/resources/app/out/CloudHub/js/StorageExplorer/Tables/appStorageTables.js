/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "knockout", "StorageExplorer/Tables/TableExplorerViewModel", "text", "CloudExplorer/UI/KnockoutBindings", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings", "StorageExplorer/Tables/DataTableBindingManager"], function (require, exports, $, ko, TableExplorerViewModel_1) {
    "use strict";
    /**
     * This is the main entry point of storage Explorer.
     * RequireJS will execute this function first.
     */
    $(document).ready(function () {
        window.pluginReady(function () {
            var viewModel = new TableExplorerViewModel_1.default();
            ko.applyBindings(viewModel);
        });
    });
});
