define(["require", "exports", "knockout", "underscore", "./QueryBuilderViewModel", "../DataTable/DataTableUtilities"], function (require, exports, ko, _, QueryBuilderViewModel_1, DataTableUtilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueryViewModel = (function () {
        function QueryViewModel(queryTablesTab) {
            var _this = this;
            this.topValueLimitMessage = "Please input a number between 0 and 1000.";
            this.queryBuilderViewModel = ko.observable();
            this.isHelperActive = ko.observable(true);
            this.isEditorActive = ko.observable(false);
            this.isExpanded = ko.observable(false);
            this.isWarningBox = ko.observable();
            this.queryText = ko.observable();
            this.queryTextSql = ko.observable();
            this.topValue = ko.observable();
            this.selectText = ko.observableArray();
            this.unchangedText = ko.observable();
            this.unchangedSaveText = ko.observable();
            this.unchangedSaveTop = ko.observable();
            this.unchangedSaveSelect = ko.observableArray();
            this.savedQueryName = ko.observable();
            this.selectMessage = ko.observable();
            this.selectHelper = function () {
                _this.isHelperActive(true);
                _this.isEditorActive(false);
                DataTableUtilities.forceRecalculateTableSize();
            };
            this.selectEditor = function () {
                _this.setFilter();
                if (!_this.isEditorActive()) {
                    _this.unchangedText(_this.queryText());
                }
                _this.isEditorActive(true);
                _this.isHelperActive(false);
                DataTableUtilities.forceRecalculateTableSize();
            };
            this.toggleAdvancedOptions = function () {
                _this.isExpanded(!_this.isExpanded());
                if (_this.isExpanded()) {
                    _this.focusTopResult(true);
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
                var queryString = _this.isEditorActive() ? _this.queryText() : _this.queryBuilderViewModel().getODataFilterFromClauses();
                var filter = queryString;
                _this.queryText(filter);
                return _this.queryText();
            };
            this.setSqlFilter = function () {
                var filter = _this.queryBuilderViewModel().getSqlFilterFromClauses();
                _this.queryTextSql(filter);
                return _this.queryTextSql();
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
                var top = _this.topValue();
                var selectOptions = _this._getSelectedResults();
                var select = selectOptions;
                _this._tableEntityListViewModel.tableQuery.filter = filter;
                _this._tableEntityListViewModel.tableQuery.top = top;
                _this._tableEntityListViewModel.tableQuery.select = select;
                _this._tableEntityListViewModel.oDataQuery(filter);
                _this._tableEntityListViewModel.sqlQuery(_this.setSqlFilter());
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
                _this._tableEntityListViewModel.oDataQuery("");
                _this._tableEntityListViewModel.sqlQuery("SELECT * FROM c");
                return _this._tableEntityListViewModel.reloadTable(false);
            };
            this.isSelected = ko.computed(function () {
                return !(_.isEmpty(_this.selectText()) || _this.selectText() === null);
            });
            this.queryTablesTab = queryTablesTab;
            this.id = "queryViewModel" + this.queryTablesTab.tabId;
            this._tableEntityListViewModel = queryTablesTab.tableEntityListViewModel();
            var initialOptions = this._tableEntityListViewModel.headers;
            this.columnOptions = ko.observableArray(initialOptions);
            this.focusTopResult = ko.observable(false);
            this.focusExpandIcon = ko.observable(false);
            this.queryBuilderViewModel(new QueryBuilderViewModel_1.default(this, this._tableEntityListViewModel));
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
            this.queryTablesTab.container.querySelect_open(this);
            return null;
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
    exports.default = QueryViewModel;
});
