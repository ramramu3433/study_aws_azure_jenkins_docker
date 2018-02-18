var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "./TabsBase", "../Tables/DataTable/TableEntityListViewModel", "../Tables/DataTable/TableCommands"], function (require, exports, ko, TabsBase, TableEntityListViewModel_1, TableCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Will act as table explorer class
    var QueryTablesTab = (function (_super) {
        __extends(QueryTablesTab, _super);
        function QueryTablesTab(options) {
            var _this = _super.call(this, options) || this;
            _this.tableEntityListViewModel = ko.observable();
            _this.queryViewModel = ko.observable(null);
            _this.queryText = ko.observable("PartitionKey eq 'partitionKey1'"); // Start out with an example they can modify
            _this.selectedQueryText = ko.observable("").extend({ notify: "always" });
            _this.container = options.collection.container;
            _this.tableCommands = new TableCommands_1.default(_this.container);
            _this.tableEntityListViewModel(new TableEntityListViewModel_1.default(_this.tableCommands, _this));
            _this.tableEntityListViewModel().queryTablesTab = _this;
            _this.executeQueryButton = {
                enabled: ko.computed(function () {
                    return true;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.queryBuilderButton = {
                enabled: ko.computed(function () {
                    return _this.queryViewModel() ? _this.queryViewModel().isHelperActive() : false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.queryTextButton = {
                enabled: ko.computed(function () {
                    return _this.queryViewModel() ? _this.queryViewModel().isEditorActive() : false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.addEntityButton = {
                enabled: ko.computed(function () {
                    return true;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.editEntityButton = {
                enabled: ko.computed(function () {
                    return _this.tableCommands.isEnabled(TableCommands_1.default.editEntityCommand, _this.tableEntityListViewModel().selected());
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.deleteEntityButton = {
                enabled: ko.computed(function () {
                    return _this.tableCommands.isEnabled(TableCommands_1.default.deleteEntitiesCommand, _this.tableEntityListViewModel().selected());
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            return _this;
        }
        QueryTablesTab.prototype.onExecuteQueryClick = function () {
            this.queryViewModel().runQuery();
            return null;
        };
        QueryTablesTab.prototype.onQueryBuilderClick = function () {
            this.queryViewModel().selectHelper();
            return null;
        };
        QueryTablesTab.prototype.onQueryTextClick = function () {
            this.queryViewModel().selectEditor();
            return null;
        };
        QueryTablesTab.prototype.onAddEntityClick = function () {
            this.container.addTableEntity_open(this.tableEntityListViewModel());
            return null;
        };
        QueryTablesTab.prototype.onEditEntityClick = function () {
            this.tableCommands.editEntityCommand(this.tableEntityListViewModel());
            return null;
        };
        QueryTablesTab.prototype.onDeleteEntityClick = function () {
            this.tableCommands.deleteEntitiesCommand(this.tableEntityListViewModel());
            return null;
        };
        QueryTablesTab.prototype.onActivate = function () {
            var _this = this;
            return _super.prototype.onActivate.call(this).then(function () {
                _this.tableEntityListViewModel().table.columns.adjust();
                $(window).resize();
            });
        };
        return QueryTablesTab;
    }(TabsBase));
    exports.default = QueryTablesTab;
});
