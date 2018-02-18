/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/Configurable/ContextMenu", "StorageExplorer/Configurable/Toolbar/Toolbar", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Tables/TableCommands", "StorageExplorer/Tables/TableEntityListViewModel", "StorageExplorer/Tables/TableExplorerContext", "StorageExplorer/Tables/TableQuery/QueryViewModel", "../../CloudExplorer/DaytonaTabMessengerProxy"], function (require, exports, ko, ContextMenu_1, Toolbar_1, StorageExplorerConstants, TableCommands_1, TableEntityListViewModel_1, TableExplorerContext_1, QueryViewModel_1, DaytonaTabMessengerProxy_1) {
    "use strict";
    /**
     * View model for the entire Storage Explorer document window for tables
     */
    var TableExplorerViewModel = (function () {
        function TableExplorerViewModel() {
            var _this = this;
            /* Observables */
            this.tableEntityListViewModel = ko.observable();
            this.toolbarViewModel = ko.observable();
            this.isQueryOpen = ko.observable(false);
            this.queryText = ko.observable("PartitionKey eq 'partitionKey1'"); // Start out with an example they can modify
            this.selectedQueryText = ko.observable("").extend({ notify: "always" });
            this.queryViewModel = ko.observable(null);
            this.selected = ko.pureComputed(function () { return _this.tableEntityListViewModel().selected(); });
            this.canCopy = ko.pureComputed(function () { return _this.tableCommands.isEnabled(TableCommands_1.default.copyEntitiesCommand, _this.selected()); });
            this.canDelete = ko.pureComputed(function () { return _this.tableCommands.isEnabled(TableCommands_1.default.deleteEntitiesCommand, _this.selected()); });
            this.canEdit = ko.pureComputed(function () { return _this.tableCommands.isEnabled(TableCommands_1.default.editEntityCommand, _this.selected()); });
            this.canAdd = ko.pureComputed(function () { return _this.tableCommands.isEnabled(TableCommands_1.default.addEntityCommand, _this.selected()); });
            this.canReorderBySelected = ko.pureComputed(function () { return _this.tableCommands.isEnabled(TableCommands_1.default.reorderColumnsCommand, _this.selected()); });
            this.canResetOrder = ko.observable(true);
            this._headerContextMenuActions = [
                {
                    type: "action",
                    title: "Column options ...",
                    displayName: "Column Options ...",
                    id: StorageExplorerConstants.buttonIds.customizeColumns,
                    action: function () { return _this.customizeColumns(); },
                    enabled: ko.observable(true)
                },
                {
                    type: "action",
                    title: "Reset Column Order",
                    displayName: "Reset Column Order",
                    id: TableCommands_1.default.resetColumnsCommand,
                    action: function () { return _this.resetColumnOrder(); },
                    enabled: this.canResetOrder
                }
            ];
            this._tableContextMenuActions = [
                {
                    type: "action",
                    title: "Edit entity",
                    displayName: "Edit",
                    id: StorageExplorerConstants.buttonIds.editEntity,
                    action: function () { return _this.editEntity(); },
                    enabled: this.canEdit
                },
                {
                    type: "action",
                    title: "Delete selected entities",
                    displayName: "Delete",
                    id: StorageExplorerConstants.buttonIds.deleteEntities,
                    action: function () { return _this.deleteEntities(); },
                    enabled: this.canDelete
                },
                {
                    type: "action",
                    title: "Reorder Columns Based on Schema",
                    displayName: "Reorder Columns Based on Schema",
                    id: TableCommands_1.default.reorderColumnsCommand,
                    action: function () { return _this.reorderColumnsBySelected(); },
                    enabled: this.canReorderBySelected
                },
                {
                    type: "action",
                    title: "Reset Column Order",
                    displayName: "Reset Column Order",
                    id: TableCommands_1.default.resetColumnsCommand,
                    action: function () { return _this.resetColumnOrder(); },
                    enabled: this.canResetOrder
                }
            ];
            this._toolbarActionsConfig = [
                {
                    type: "toggle",
                    title: "Open query builder",
                    displayName: "Query",
                    checkedTitle: "Close query builder",
                    checkedDisplayName: "Close Query",
                    id: StorageExplorerConstants.buttonIds.toggleQueryMode,
                    checked: this.isQueryOpen,
                    enabled: ko.observable(true),
                    icon: "../../../images/StorageExplorer/ASX_QueryBuilder.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Import entities from file",
                    displayName: "Import",
                    id: StorageExplorerConstants.buttonIds.importEntities,
                    action: function () { return _this.importEntities(); },
                    enabled: ko.observable(true),
                    icon: "../../../images/StorageExplorer/ASX_FileToTable.svg"
                },
                {
                    type: "action",
                    title: "Export all or queried entities to a file",
                    displayName: "Export",
                    id: StorageExplorerConstants.buttonIds.exportEntities,
                    action: function () { return _this.exportEntities(); },
                    enabled: ko.observable(true),
                    icon: "../../../images/StorageExplorer/ASX_TableToFile.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Add entity",
                    displayName: "Add",
                    id: StorageExplorerConstants.buttonIds.addEntity,
                    action: function () { return _this.addEntity(); },
                    enabled: this.canAdd,
                    icon: "../../../images/StorageExplorer/ASX_Add.svg"
                },
                {
                    type: "action",
                    title: "Edit entity",
                    displayName: "Edit",
                    id: StorageExplorerConstants.buttonIds.editEntity,
                    action: function () { return _this.editEntity(); },
                    enabled: this.canEdit,
                    icon: "../../../images/StorageExplorer/ASX_Edit.svg"
                },
                {
                    type: "dropdown",
                    title: "Select all entites",
                    displayName: "Select all",
                    id: StorageExplorerConstants.buttonIds.selectAll,
                    enabled: ko.observable(true),
                    icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAllDropdown.svg",
                    subgroup: [
                        {
                            type: "action",
                            title: "Select all entities in current page",
                            displayName: "Select All in Page",
                            id: StorageExplorerConstants.buttonIds.selectAllInCurrentPage,
                            action: function () { return _this.selectAllInCurrentPage(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        },
                        {
                            type: "action",
                            title: "Select all downloaded entities",
                            displayName: "Select All Cached",
                            id: StorageExplorerConstants.buttonIds.selectAllInCache,
                            action: function () { return _this.selectAllInCache(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        }
                    ]
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Column options",
                    displayName: "Column Options",
                    id: StorageExplorerConstants.buttonIds.customizeColumns,
                    action: function () { return _this.customizeColumns(); },
                    enabled: ko.observable(true),
                    icon: "../../../images/StorageExplorer/ASX_CustomizeColumn.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Delete selected entities",
                    displayName: "Delete",
                    id: StorageExplorerConstants.buttonIds.deleteEntities,
                    action: function () { return _this.deleteEntities(); },
                    enabled: this.canDelete,
                    icon: "../../../images/StorageExplorer/ASX_Delete.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Get statistics for all or queried entities",
                    displayName: "Table Statistics",
                    id: "getFolderStats",
                    action: function () { return _this.getTableStats(); },
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_AutoSum.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Refresh",
                    displayName: "Refresh",
                    id: StorageExplorerConstants.buttonIds.refresh,
                    action: function () { return _this.refresh(); },
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Refresh.svg"
                }
            ];
            this._setFocus = function () {
                _this.toolbarViewModel().focus();
            };
            this.tableExplorerContext = new TableExplorerContext_1.default();
            window.host = this.tableExplorerContext.hostProxy;
            this.tableCommands = new TableCommands_1.default(this.tableExplorerContext);
            this.isQueryOpen.subscribe(function (value) { return _this.toggleQueryMode(); });
            this.tableEntityListViewModel(new TableEntityListViewModel_1.default(this.tableExplorerContext, this.tableExplorerContext.telemetry));
            this.toolbarViewModel(new Toolbar_1.default(this._toolbarActionsConfig, function (id) {
                _this.tableExplorerContext.telemetry.sendEvent("StorageExplorer.TableEditor.Toolbar", {
                    "Action": id
                });
            }));
            new ContextMenu_1.default(this._tableContextMenuActions, [".dataTable tr td", ".dataTable tr td *"], function (id) {
                _this.tableExplorerContext.telemetry.sendEvent("StorageExplorer.TableEditor.contextMenu", {
                    "Action": id
                });
            }, ".selected:last");
            new ContextMenu_1.default(this._headerContextMenuActions, [".dataTable tr th", ".dataTable tr th *"], function (id) {
                _this.tableExplorerContext.telemetry.sendEvent("StorageExplorer.TableEditor.contextMenu", {
                    "Action": id
                });
            });
            this.queryText.subscribe(function (newValue) {
                _this._setTableQuery();
            });
            DaytonaTabMessengerProxy_1.default.on("tab-active", function () {
                _this._setFocus();
            });
        }
        TableExplorerViewModel.prototype.runQuery = function () {
            this.queryViewModel().runQuery();
        };
        TableExplorerViewModel.prototype.stopQuery = function () {
            this.queryViewModel().stopQuery();
        };
        TableExplorerViewModel.prototype.saveQuery = function () {
            this.queryViewModel().saveAsQuery();
        };
        TableExplorerViewModel.prototype.addEntity = function () {
            var _this = this;
            this.logTelemetry("addEntity");
            var promise = this.tableCommands.addEntityCommand(this.tableEntityListViewModel());
            promise.then(function () {
                // Showing the dialog loses the focus, giving it back to the data table when we return from the dialog.
                _this.tableEntityListViewModel().focusDataTable();
            });
            return promise;
        };
        ;
        TableExplorerViewModel.prototype.editEntity = function () {
            var _this = this;
            this.logTelemetry("editEntity");
            var promise = this.tableCommands.editEntityCommand(this.tableEntityListViewModel());
            promise.then(function () {
                // Showing the dialog loses the focus, giving it back to the data table when we return from the dialog.
                _this.tableEntityListViewModel().focusDataTable();
            });
            return promise;
        };
        ;
        TableExplorerViewModel.prototype.selectAllInCurrentPage = function () {
            this.tableCommands.selectAllInCurrentPage(this.tableEntityListViewModel());
            this.tableEntityListViewModel().focusDataTable();
        };
        ;
        TableExplorerViewModel.prototype.selectAllInCache = function () {
            this.tableCommands.selectAllInCache(this.tableEntityListViewModel());
            this.tableEntityListViewModel().focusDataTable();
        };
        TableExplorerViewModel.prototype.deleteEntities = function () {
            return this.tableCommands.deleteEntitiesCommand(this.tableEntityListViewModel());
        };
        ;
        // TODO: Change to async. Should return Promise!
        TableExplorerViewModel.prototype.refresh = function () {
            // Close the query panel first
            this.isQueryOpen(false);
            this._setTableQuery();
            return this.tableEntityListViewModel().reloadTable();
        };
        ;
        TableExplorerViewModel.prototype.customizeColumns = function () {
            var _this = this;
            return this.tableCommands.customizeColumnsCommand(this.tableEntityListViewModel())
                .then(function () {
                // Showing the dialog loses the focus, giving it back to the data table when we return from the dialog.
                _this.tableEntityListViewModel().focusDataTable();
            });
        };
        ;
        TableExplorerViewModel.prototype.getTableStats = function () {
            return this.tableCommands.getTableStats(this.tableEntityListViewModel());
        };
        ;
        TableExplorerViewModel.prototype.executeQuery = function () {
            return this.tableEntityListViewModel().reloadTable(/* useSetting */ false);
        };
        ;
        TableExplorerViewModel.prototype.toggleQueryMode = function () {
            var _this = this;
            this.logTelemetry(this.isQueryOpen() ? "openQueryPanel" : "closeQueryPanel");
            this._setTableQuery();
            if (!this.isQueryOpen()) {
                // If the query button was toggled off, refresh without the query
                this.tableEntityListViewModel().reloadTable();
            }
            else {
                // Note: This will force the input to select all the text
                if (!this.queryViewModel()) {
                    $(".query-panel").focus();
                    this.queryViewModel = ko.observable(new QueryViewModel_1.default(this));
                    this.queryText.subscribe(function (newValue) {
                        _this._setTableQuery();
                    });
                }
            }
            // Since the height is going to change when the panel opens. We need to propagate this event.
            // Ideally the plugin would handle this.
            $("body").trigger("resize");
        };
        ;
        TableExplorerViewModel.prototype.insertSnippetIntoQuery = function (key, snippet) {
            this.logTelemetry("insertQuerySnippet", { SnippetKey: key });
            this.selectedQueryText(snippet);
        };
        ;
        TableExplorerViewModel.prototype.logTelemetry = function (action, additionalProperties) {
            var properties = additionalProperties || {};
            properties.Action = action;
            properties.IsQueryPanelOpen = this.isQueryOpen() + "";
            this.tableExplorerContext.telemetry.sendEvent("StorageExplorer.TableEditor.Toolbar", properties);
        };
        ;
        TableExplorerViewModel.prototype._setTableQuery = function () {
            var filter = this.isQueryOpen() ? this.queryText() : null;
            // Replace double quotes with single quotes
            if (filter) {
                filter = filter.replace(/"/g, "'");
            }
            this.tableEntityListViewModel().tableQuery.filter = filter;
        };
        ;
        TableExplorerViewModel.prototype.importEntities = function () {
            var _this = this;
            this.logTelemetry("importEntities");
            return this.tableCommands.importEntitiesCommand(this.tableEntityListViewModel())
                .then(function (result) {
                // Refresh the table. Full refresh required, because entities in the cache may now be out of date due to merges/replacements).
                _this.tableEntityListViewModel().reloadTable();
            });
        };
        ;
        TableExplorerViewModel.prototype.exportEntities = function () {
            this.logTelemetry("exportEntities");
            return this.tableCommands.exportEntitiesCommand(this.tableEntityListViewModel());
        };
        ;
        TableExplorerViewModel.prototype.reorderColumnsBySelected = function () {
            this.tableCommands.reorderColumnsBasedOnSelectedEntities(this.tableEntityListViewModel());
        };
        TableExplorerViewModel.prototype.resetColumnOrder = function () {
            this.tableCommands.resetColumns(this.tableEntityListViewModel());
        };
        return TableExplorerViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableExplorerViewModel;
});
