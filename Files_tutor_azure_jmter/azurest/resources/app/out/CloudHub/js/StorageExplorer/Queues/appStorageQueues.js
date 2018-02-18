/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "knockout", "StorageExplorer/Queues/QueueExplorerViewModel", "CloudExplorer/UI/KnockoutBindings", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings", "StorageExplorer/Queues/DataTableBindingManager"], function (require, exports, $, ko, QueueExplorerViewModel_1) {
    "use strict";
    /**
     * This is the main entry point of storage Explorer.
     * RequireJS will execute this function first.
     */
    $(document).ready(function () {
        window.pluginReady(function () {
            var viewModel = new QueueExplorerViewModel_1.default();
            ko.applyBindings(viewModel);
        });
    });
});
