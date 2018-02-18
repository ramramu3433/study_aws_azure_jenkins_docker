/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "Providers/Common/AzureConstants", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/Tables/TableQuery/QueryBuilderViewModel", "StorageExplorer/Tables/TableQuery/SavedQueriesViewModel", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings"], function (require, exports, ko, _, AzureConstants, DataTableUtilities_1, DataTableOperations, QueryBuilderViewModel_1, SavedQueriesViewModel_1, DataTableUtilities) {
    "use strict";
    var QueryViewModel = (function () {
        function QueryViewModel(explorerViewModel) {
            var _this = this;
            this.topValueLimitMessage = "Please input a number between 0 and 1000.";
            this.queryBuilderViewModel = ko.observable();
            this.savedQueriesViewModel = ko.observable();
            this.isHelperActive = ko.observable(true);
            this.isEditorActive = ko.observable(false);
            this.isExpanded = ko.observable(false);
            this.isWarningBox = ko.observable();
            this.queryText = ko.observable();
            this.topValue = ko.observable();
            this.selectText = ko.observableArray();
            this.unchangedText = ko.observable();
            this.unchangedSaveText = ko.observable();
            this.unchangedSaveTop = ko.observable();
            this.unchangedSaveSelect = ko.observableArray();
            this.savedQueryName = ko.observable();
            this.selectMessage = ko.observable();
            this._telemetryEventName = "StorageExplorer.TableEditor.QueryBuilder";
            this.openStatement = function () {
                var host = _this._tableEntityListViewModel.tableExplorerContext.hostProxy;
                host.executeProviderOperation("Environment.Browser.openUrl", { url: "https://go.microsoft.com/fwlink/?LinkId=823539" });
            };
            this.selectHelper = function () {
                _this.isHelperActive(true);
                _this.isEditorActive(false);
                _this.logTelemetry("selectBuilder");
                DataTableUtilities.forceRecalculateTableSize();
            };
            this.selectEditor = function () {
                _this.setFilter();
                if (!_this.isEditorActive()) {
                    _this.unchangedText(_this.queryText());
                }
                _this.isEditorActive(true);
                _this.isHelperActive(false);
                _this.logTelemetry("selectEditor");
                DataTableUtilities.forceRecalculateTableSize();
            };
            this.toggleAdvancedOptions = function () {
                _this.isExpanded(!_this.isExpanded());
                if (_this.isExpanded()) {
                    _this.focusTopResult(true);
                    _this.logTelemetry("toggleOnAdvancedOptions");
                }
                else {
                    _this.focusExpandIcon(true);
                }
                DataTableUtilities.forceRecalculateTableSize(); // Fix for 261924, forces the resize event so DataTableBindingManager will redo the calculation on table size.
            };
            this._getSelectedResults = function () {
                return _this.selectText();
            };
            this.setFilter = function () {
                var queryString = _this.isEditorActive() ? _this.queryText() : _this.queryBuilderViewModel().getFilterFromClauses();
                var filter = _this.explorerViewModel.isQueryOpen() ? queryString : null;
                _this.queryText(filter);
                return _this.queryText();
            };
            this.isHelperEnabled = ko.computed(function () {
                return _this.queryText() === _this.unchangedText() || _this.queryText() === null || _this.queryText() === "" || _this.isHelperActive();
            }).extend({
                notify: "always"
            });
            this.runQuery = function () {
                var filter = _this.setFilter();
                if (filter) {
                    filter = filter.replace(/"/g, "'");
                }
                ;
                var top = _this.explorerViewModel.isQueryOpen() ? _this.topValue() : null;
                var selectOptions = _this._getSelectedResults();
                var select = _this.explorerViewModel.isQueryOpen() ? selectOptions : null;
                _this._tableEntityListViewModel.tableQuery.filter = filter;
                _this._tableEntityListViewModel.tableQuery.top = top;
                _this._tableEntityListViewModel.tableQuery.select = select;
                var queryView = _this.isEditorActive() ? "queryEditor" : "queryBuilder";
                var numOfClauses = (_this.queryBuilderViewModel().clauseArray().length).toString();
                if (_this.isHelperActive()) {
                    _this._telemetry.sendEvent(_this._telemetryEventName, {
                        "Action": "executeQuery",
                        "numOfClauses": numOfClauses,
                        "executedFrom": queryView
                    });
                }
                else {
                    _this._telemetry.sendEvent(_this._telemetryEventName, {
                        "Action": "executeQuery",
                        "executedFrom": queryView
                    });
                }
                return _this._tableEntityListViewModel.reloadTable(/*useSetting*/ false, /*resetHeaders*/ false);
            };
            this.clearQuery = function () {
                _this.queryText(null);
                _this.topValue(null);
                _this.selectText(null);
                _this.selectMessage("");
                // clears the queryBuilder and adds a new blank clause
                _this.queryBuilderViewModel().queryClauses.removeAll();
                _this.queryBuilderViewModel().addNewClause();
                _this._tableEntityListViewModel.tableQuery.filter = null;
                _this._tableEntityListViewModel.tableQuery.top = null;
                _this._tableEntityListViewModel.tableQuery.select = null;
                _this.logTelemetry("clearQuery");
                return _this._tableEntityListViewModel.reloadTable(false);
            };
            this.stopQuery = function () {
                _this._tableEntityListViewModel.isCancelled = true;
                _this.logTelemetry("stopQuery");
            };
            this.openQuery = function () {
                _this.logTelemetry("openSavedQuery");
                return _this.savedQueriesViewModel().openQueryCommand(_this)
                    .then(function (enableSave) {
                    if (enableSave) {
                        return;
                    }
                    _this.setCheckToSave();
                    _this.getSelectMessage();
                });
            };
            this.saveAsQuery = function () {
                _this.logTelemetry("saveQueryAs");
                _this.setFilter();
                _this.savedQueryHelperText = _this.queryBuilderViewModel().formatToSave();
                _this.savedGroupStructure = _this.queryBuilderViewModel().formatGroupToSave();
                return _this.savedQueriesViewModel().saveAsQueryCommand(_this)
                    .then(function (enableSave) {
                    if (enableSave) {
                        return;
                    }
                    _this.setCheckToSave();
                });
            };
            this.saveQuery = function () {
                _this.logTelemetry("saveQuery");
                _this.setFilter();
                _this.savedQueryHelperText = _this.queryBuilderViewModel().formatToSave();
                _this.savedGroupStructure = _this.queryBuilderViewModel().formatGroupToSave();
                return _this.savedQueriesViewModel().saveQueryCommand(_this)
                    .then(function () {
                    _this.setCheckToSave();
                });
            };
            this.isSelected = ko.computed(function () {
                return !(_.isEmpty(_this.selectText()) || _this.selectText() === null);
            });
            this.logTelemetry = function (action) {
                _this._telemetry.sendEvent(_this._telemetryEventName, {
                    "Action": action
                });
            };
            this.explorerViewModel = explorerViewModel;
            this._tableEntityListViewModel = explorerViewModel.tableEntityListViewModel();
            this._telemetry = explorerViewModel.tableExplorerContext.telemetry;
            var initialOptions = DataTableOperations.getDataTableHeaders(this._tableEntityListViewModel.table)
                .sort(DataTableUtilities_1.compareTableColumns);
            this.columnOptions = ko.observableArray(initialOptions);
            this.focusTopResult = ko.observable(false);
            this.focusExpandIcon = ko.observable(false);
            this.queryBuilderViewModel(new QueryBuilderViewModel_1.default(this, this._tableEntityListViewModel, this._telemetry));
            this.savedQueriesViewModel(new SavedQueriesViewModel_1.default(this.queryBuilderViewModel(), this._tableEntityListViewModel.tableExplorerContext, this._tableEntityListViewModel.tableExplorerContext.hostProxy, this._telemetry));
            this.isSaveEnabled = ko.pureComputed(function () {
                return ((_this.queryText() !== _this.unchangedSaveText()) || (_this.selectText() !== _this.unchangedSaveSelect()) ||
                    (_this.topValue() !== _this.unchangedSaveTop()));
            });
            this.queryBuilderViewModel().clauseArray.subscribe(function (value) {
                _this.setFilter();
            });
            this.isExceedingLimit = ko.computed(function () {
                var currentTopValue = _this.topValue();
                return currentTopValue < 0 || currentTopValue > 1000;
            });
            this.canRunQuery = ko.computed(function () {
                return !_this.isExceedingLimit();
            });
            this.hasQueryError = ko.computed(function () {
                return !!_this._tableEntityListViewModel.queryErrorMessage();
            });
            this.queryErrorMessage = ko.computed(function () {
                return _this._tableEntityListViewModel.queryErrorMessage();
            });
        }
        QueryViewModel.prototype.selectQueryOptions = function () {
            var _this = this;
            var host = this._tableEntityListViewModel.tableExplorerContext.hostProxy;
            var columnNames = this.columnOptions();
            var querySelect = this.selectText();
            this.logTelemetry("customizeQueryColumns");
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.querySelect,
                parameters: { columnNames: columnNames, querySelect: querySelect }
            }).then(function (columns) {
                if (columns) {
                    _this.selectText(columns);
                    _this.getSelectMessage();
                }
            });
        };
        QueryViewModel.prototype.getSelectMessage = function () {
            if (_.isEmpty(this.selectText()) || this.selectText() === null) {
                this.selectMessage("");
            }
            else {
                this.selectMessage(this.selectText().length + " of " + this.columnOptions().length + " columns selected.");
            }
        };
        QueryViewModel.prototype.setCheckToSave = function () {
            this.unchangedSaveText(this.setFilter());
            this.unchangedSaveTop(this.topValue());
            this.unchangedSaveSelect(this.selectText());
            this.isSaveEnabled(false);
        };
        QueryViewModel.prototype.checkIfBuilderChanged = function (clause) {
            this.setFilter();
        };
        return QueryViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueryViewModel;
});
