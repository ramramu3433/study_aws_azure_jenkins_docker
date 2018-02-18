/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*----------------------------------------------------------*/
define(["require", "exports", "underscore", "knockout", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/Tables/TableQuery/QueryClauseViewModel", "StorageExplorer/Tables/TableQuery/ClauseGroup", "StorageExplorer/Tables/TableQuery/ClauseGroupViewModel", "StorageExplorer/StorageExplorerConstants", "../../Common/Timestamps", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings"], function (require, exports, _, ko, DataTableUtilities_1, DataTableOperations, QueryClauseViewModel_1, ClauseGroup_1, ClauseGroupViewModel_1, StorageExplorerConstants, Timestamps_1, DataTableUtilities) {
    "use strict";
    var QueryBuilderViewModel = (function () {
        function QueryBuilderViewModel(queryViewModel, tableEntityListViewModel, telemetry) {
            var _this = this;
            /* Labels */
            this.andLabel = "And/Or"; // localize
            this.fieldLabel = "Field"; // localize
            this.dataTypeLabel = "Type"; // localize
            this.operatorLabel = "Operator"; // localize
            this.valueLabel = "Value"; // localize
            /* controls */
            this.addNewClauseLine = "Add new clause"; // localize
            this.insertNewFilterLine = "Insert new filter line"; // localize
            this.removeThisFilterLine = "Remove this filter line"; // localize
            this.groupSelectedClauses = "Group selected clauses"; // localize
            this.clauseArray = ko.observableArray(); // This is for storing the clauses in flattened form queryClauses for easier UI data binding.
            this.queryClauses = new ClauseGroup_1.default(true, null); // The actual data structure containing the clause information.
            this.canGroupClauses = ko.observable(false);
            /* Observables */
            this.edmTypes = ko.observableArray([
                StorageExplorerConstants.DisplayedEdmType.String,
                StorageExplorerConstants.DisplayedEdmType.Boolean,
                StorageExplorerConstants.DisplayedEdmType.Binary,
                StorageExplorerConstants.DisplayedEdmType.DateTime,
                StorageExplorerConstants.DisplayedEdmType.Double,
                StorageExplorerConstants.DisplayedEdmType.Guid,
                StorageExplorerConstants.DisplayedEdmType.Int32,
                StorageExplorerConstants.DisplayedEdmType.Int64,
                ""
            ]);
            this.operators = ko.observableArray([
                StorageExplorerConstants.Operator.Equal,
                StorageExplorerConstants.Operator.GreaterThan,
                StorageExplorerConstants.Operator.GreaterThanOrEqualTo,
                StorageExplorerConstants.Operator.LessThan,
                StorageExplorerConstants.Operator.LessThanOrEqualTo,
                StorageExplorerConstants.Operator.NotEqualTo,
                ""
            ]);
            this.clauseRules = ko.observableArray([
                StorageExplorerConstants.ClauseRule.And,
                StorageExplorerConstants.ClauseRule.Or
            ]);
            this.timeOptions = ko.observableArray([
                StorageExplorerConstants.timeOptions.lastHour,
                StorageExplorerConstants.timeOptions.last24Hours,
                StorageExplorerConstants.timeOptions.last7Days,
                StorageExplorerConstants.timeOptions.last31Days,
                StorageExplorerConstants.timeOptions.last365Days,
                StorageExplorerConstants.timeOptions.currentMonth,
                StorageExplorerConstants.timeOptions.currentYear,
                StorageExplorerConstants.timeOptions.custom
            ]);
            this.queryString = ko.observable();
            this.getFilterFromClauses = function () {
                var filterString = "";
                var treeTraversal = function (group) {
                    for (var i = 0; i < group.children.length; i++) {
                        var currentItem = group.children[i];
                        if (currentItem instanceof QueryClauseViewModel_1.default) {
                            var clause = currentItem;
                            _this.timestampToValue(clause);
                            filterString = filterString.concat(_this.contructClause(filterString === "" ? "" : clause.and_or(), _this.generateLeftParentheses(clause), clause.field(), clause.type(), clause.operator(), clause.value(), _this.generateRightParentheses(clause)));
                        }
                        if (currentItem instanceof ClauseGroup_1.default) {
                            treeTraversal(currentItem);
                        }
                    }
                };
                treeTraversal(_this.queryClauses);
                return filterString.trim();
            };
            this.updateColumnOptions = function () {
                var originalHeaders = _this.columnOptions();
                var newHeaders = DataTableOperations.getDataTableHeaders(_this._tableEntityListViewModel.table);
                _this.columnOptions(_.unique(originalHeaders.concat(newHeaders)).sort(DataTableUtilities_1.compareTableColumns));
            };
            this.contructClause = function (clauseRule, leftParentheses, propertyName, type, operator, value, rightParentheses) {
                switch (type) {
                    case StorageExplorerConstants.DisplayedEdmType.DateTime:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " " + value + rightParentheses;
                    case StorageExplorerConstants.DisplayedEdmType.String:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " '" + value + "'" + rightParentheses;
                    case StorageExplorerConstants.DisplayedEdmType.Guid:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " guid'" + value + "'" + rightParentheses;
                    case StorageExplorerConstants.DisplayedEdmType.Binary:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " binary'" + value + "'" + rightParentheses;
                    default:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " " + value + rightParentheses;
                }
            };
            this.operatorConverter = function (operator) {
                switch (operator) {
                    case StorageExplorerConstants.Operator.Equal:
                        return StorageExplorerConstants.ODataOperator.EqualTo;
                    case StorageExplorerConstants.Operator.GreaterThan:
                        return StorageExplorerConstants.ODataOperator.GreaterThan;
                    case StorageExplorerConstants.Operator.GreaterThanOrEqualTo:
                        return StorageExplorerConstants.ODataOperator.GreaterThanOrEqualTo;
                    case StorageExplorerConstants.Operator.LessThan:
                        return StorageExplorerConstants.ODataOperator.LessThan;
                    case StorageExplorerConstants.Operator.LessThanOrEqualTo:
                        return StorageExplorerConstants.ODataOperator.LessThanOrEqualTo;
                    case StorageExplorerConstants.Operator.NotEqualTo:
                        return StorageExplorerConstants.ODataOperator.NotEqualTo;
                }
            };
            this.groupClauses = function () {
                _this.queryClauses.groupSelectedItems();
                _this.updateClauseArray();
                _this.updateCanGroupClauses();
            };
            this.addClauseIndex = function (index, data) {
                var newClause = new QueryClauseViewModel_1.default(_this, _this._tableEntityListViewModel.tableExplorerContext.hostProxy, "And", "", "String", StorageExplorerConstants.Operator.EqualTo, "", true, "", "", "", null, true);
                _this.addClauseImpl(newClause, index);
                if (index === _this.clauseArray().length - 1) {
                    _this.scrollToBottom();
                }
                _this.updateCanGroupClauses();
                newClause.isAndOrFocused(true);
            };
            // adds a new clause to the end of the array
            this.addNewClause = function () {
                _this.addClauseIndex(_this.clauseArray().length, null);
            };
            this.deleteClause = function (index, data) {
                _this.deleteClauseImpl(index);
                if (_this.clauseArray().length === 0) {
                    _this.addClauseIndex(index, data);
                }
                _this.clauseArray()[0].and_or("");
                _this.clauseArray()[0].canAnd(false);
                _this.updateCanGroupClauses();
            };
            /**
             * Generates an array of ClauseGroupViewModel objects for UI to display group information for this clause.
             * All clauses have the same number of ClauseGroupViewModel objects, which is the depth of the clause tree.
             * If the current clause is not the deepest in the tree, then the array will be filled by either a placeholder
             * (transparent) or its parent group view models.
             */
            this.getClauseGroupViewModels = function (clause) {
                var placeHolderGroupViewModel = new ClauseGroupViewModel_1.default(_this.queryClauses, false, _this);
                var treeDepth = _this.queryClauses.getTreeDepth();
                var groupViewModels = new Array(treeDepth);
                // Prefill the arry with placeholders.
                for (var i = 0; i < groupViewModels.length; i++) {
                    groupViewModels[i] = placeHolderGroupViewModel;
                }
                var currentGroup = clause.clauseGroup;
                // This function determines whether the path from clause to the current group is on the left most.
                var isLeftMostPath = function () {
                    var group = clause.clauseGroup;
                    if (group.children.indexOf(clause) !== 0) {
                        return false;
                    }
                    while (true) {
                        if (group.getId() === currentGroup.getId()) {
                            break;
                        }
                        if (group.parentGroup.children.indexOf(group) !== 0) {
                            return false;
                        }
                        group = group.parentGroup;
                    }
                    return true;
                };
                // This function determines whether the path from clause to the current group is on the right most.
                var isRightMostPath = function () {
                    var group = clause.clauseGroup;
                    if (group.children.indexOf(clause) !== group.children.length - 1) {
                        return false;
                    }
                    while (true) {
                        if (group.getId() === currentGroup.getId()) {
                            break;
                        }
                        if (group.parentGroup.children.indexOf(group) !== group.parentGroup.children.length - 1) {
                            return false;
                        }
                        group = group.parentGroup;
                    }
                    return true;
                };
                var vmIndex = groupViewModels.length - 1;
                var skipIndex = -1;
                var lastDepth = clause.groupDepth;
                while (!currentGroup.isRootGroup) {
                    // The current group will be rendered at least once, and if there are any sibling groups deeper
                    // than the current group, we will repeat rendering the current group to fill up the gap between
                    // current & deepest sibling.
                    var deepestInSiblings = currentGroup.findDeepestGroupInChildren(skipIndex).getCurrentGroupDepth();
                    // Find out the depth difference between the deepest group under the siblings of currentGroup and
                    // the deepest group under currentGroup. If the result n is a positive number, it means there are
                    // deeper groups in siblings and we need to draw n + 1 group blocks on UI to fill up the depth
                    // differences. If the result n is a negative number, it means current group contains the deepest
                    // sub-group, we only need to draw the group block once.
                    var repeatCount = Math.max(deepestInSiblings - lastDepth, 0);
                    for (var i = 0; i <= repeatCount; i++) {
                        var isLeftMost = isLeftMostPath();
                        var isRightMost = isRightMostPath();
                        var groupViewModel = new ClauseGroupViewModel_1.default(currentGroup, i === 0 && isLeftMost, _this);
                        groupViewModel.showTopBorder(isLeftMost);
                        groupViewModel.showBottomBorder(isRightMost);
                        groupViewModel.showLeftBorder(i === repeatCount);
                        groupViewModels[vmIndex] = groupViewModel;
                        vmIndex--;
                    }
                    skipIndex = currentGroup.parentGroup.children.indexOf(currentGroup);
                    currentGroup = currentGroup.parentGroup;
                    lastDepth = Math.max(deepestInSiblings, lastDepth);
                }
                return groupViewModels;
            };
            this.runQuery = function () {
                return _this._queryViewModel.runQuery();
            };
            if (tableEntityListViewModel.items().length > 0) {
                var example1 = new QueryClauseViewModel_1.default(this, tableEntityListViewModel.tableExplorerContext.hostProxy, "", "PartitionKey", "String", StorageExplorerConstants.Operator.Equal, tableEntityListViewModel.items()[0].PartitionKey._, false, "", "", "", null, true);
                var example2 = new QueryClauseViewModel_1.default(this, tableEntityListViewModel.tableExplorerContext.hostProxy, "And", "RowKey", "String", StorageExplorerConstants.Operator.Equal, tableEntityListViewModel.items()[0].RowKey._, true, "", "", "", null, true);
                this.addClauseImpl(example1, 0);
                this.addClauseImpl(example2, 1);
            }
            else {
                this.clauseArray();
            }
            this._queryViewModel = queryViewModel;
            this._tableEntityListViewModel = tableEntityListViewModel;
            this.columnOptions = ko.observableArray(queryViewModel.columnOptions());
            this._telemetry = telemetry;
        }
        QueryBuilderViewModel.prototype.formatToSave = function () {
            var clausesToSave = this.clauseArray().map(function (clause) {
                var clauseToMap = {
                    id: clause.getId(),
                    andOr: clause.and_or(),
                    field: clause.field(),
                    type: clause.type(),
                    operator: clause.operator(),
                    value: clause.value(),
                    timeValue: clause.timeValue(),
                    timestampType: clause.timestampType(),
                    customTimestamp: clause.customLastTimestamp(),
                    isLocal: clause.isLocal()
                };
                return clauseToMap;
            });
            this.savedQuery = ko.observable(clausesToSave);
            return clausesToSave;
        };
        QueryBuilderViewModel.prototype.formatGroupToSave = function () {
            var groupsToSave = { id: null, children: null };
            var func = function (currentGroup, saveTarget) {
                saveTarget.id = currentGroup.getId();
                saveTarget.children = new Array(currentGroup.children.length);
                for (var i = 0; i < currentGroup.children.length; i++) {
                    var item = currentGroup.children[i];
                    if (item instanceof QueryClauseViewModel_1.default) {
                        saveTarget.children[i] = item.getId();
                    }
                    if (item instanceof ClauseGroup_1.default) {
                        var savedQueryClauseGroup = { id: null, children: null };
                        saveTarget.children[i] = savedQueryClauseGroup;
                        func(item, savedQueryClauseGroup);
                    }
                }
            };
            func(this.queryClauses, groupsToSave);
            return groupsToSave;
        };
        QueryBuilderViewModel.prototype.generateLeftParentheses = function (clause) {
            var result = "";
            if (clause.clauseGroup.isRootGroup || clause.clauseGroup.children.indexOf(clause) !== 0) {
                return result;
            }
            else {
                result = result.concat("(");
            }
            var currentGroup = clause.clauseGroup;
            while (!currentGroup.isRootGroup && !currentGroup.parentGroup.isRootGroup && currentGroup.parentGroup.children.indexOf(currentGroup) === 0) {
                result = result.concat("(");
                currentGroup = currentGroup.parentGroup;
            }
            return result;
        };
        QueryBuilderViewModel.prototype.generateRightParentheses = function (clause) {
            var result = "";
            if (clause.clauseGroup.isRootGroup || clause.clauseGroup.children.indexOf(clause) !== clause.clauseGroup.children.length - 1) {
                return result;
            }
            else {
                result = result.concat(")");
            }
            var currentGroup = clause.clauseGroup;
            while (!currentGroup.isRootGroup &&
                !currentGroup.parentGroup.isRootGroup &&
                currentGroup.parentGroup.children.indexOf(currentGroup) === currentGroup.parentGroup.children.length - 1) {
                result = result.concat(")");
                currentGroup = currentGroup.parentGroup;
            }
            return result;
        };
        QueryBuilderViewModel.prototype.addCustomRange = function (timestamp, clauseToAdd) {
            var index = this.clauseArray.peek().indexOf(clauseToAdd);
            var newClause = new QueryClauseViewModel_1.default(this, this._tableEntityListViewModel.tableExplorerContext.hostProxy, "And", clauseToAdd.field(), "DateTime", StorageExplorerConstants.Operator.LessThan, "", true, StorageExplorerConstants.timeOptions.custom, timestamp.endTime, "range", null, true);
            newClause.isLocal = ko.observable(timestamp.timeZone === "local");
            this.addClauseImpl(newClause, index + 1);
            if (index + 1 === this.clauseArray().length - 1) {
                this.scrollToBottom();
            }
        };
        ;
        QueryBuilderViewModel.prototype.scrollToBottom = function () {
            var scrollBox = document.getElementById("scroll");
            var isScrolledToBottom = scrollBox.scrollHeight - scrollBox.clientHeight <= scrollBox.scrollHeight + 1;
            if (isScrolledToBottom) {
                scrollBox.scrollTop = scrollBox.scrollHeight - scrollBox.clientHeight;
            }
        };
        QueryBuilderViewModel.prototype.addClauseImpl = function (clause, position) {
            this.queryClauses.insertClauseBefore(clause, this.clauseArray()[position]);
            this.updateClauseArray();
        };
        QueryBuilderViewModel.prototype.deleteClauseImpl = function (index) {
            var clause = this.clauseArray()[index];
            var previousClause = (index === 0) ? 0 : (index - 1);
            this.queryClauses.deleteClause(clause);
            this.updateClauseArray();
            this.clauseArray()[previousClause].isDeleteButtonFocused(true);
        };
        QueryBuilderViewModel.prototype.updateCanGroupClauses = function () {
            this.canGroupClauses(this.queryClauses.canGroupSelectedItems());
        };
        QueryBuilderViewModel.prototype.updateClauseArray = function () {
            if (this.clauseArray().length > 0) {
                this.clauseArray()[0].canAnd(true);
            }
            this.queryClauses.flattenClauses(this.clauseArray);
            if (this.clauseArray().length > 0) {
                this.clauseArray()[0].canAnd(false);
            }
            // Fix for 261924, forces the resize event so DataTableBindingManager will redo the calculation on table size.
            DataTableUtilities.forceRecalculateTableSize();
        };
        QueryBuilderViewModel.prototype.timestampToValue = function (clause) {
            if (clause.isValue()) {
                return;
            }
            else if (clause.isTimestamp()) {
                this.getTimeStampToQuery(clause);
            }
            else if (clause.isCustomLastTimestamp()) {
                clause.value(Timestamps_1.default.queryLastTime(clause.customLastTimestamp().lastNumber, clause.customLastTimestamp().lastTimeUnit));
            }
            else if (clause.isCustomRangeTimestamp()) {
                if (clause.isLocal()) {
                    clause.value("datetime'" + Timestamps_1.default.getUTCDateTime(clause.customTimeValue()) + "'");
                }
                else {
                    clause.value("datetime'" + clause.customTimeValue() + "Z'");
                }
            }
        };
        QueryBuilderViewModel.prototype.getTimeStampToQuery = function (clause) {
            switch (clause.timeValue()) {
                case StorageExplorerConstants.timeOptions.lastHour:
                    clause.value(Timestamps_1.default.queryLastDaysHours(0, 1));
                    break;
                case StorageExplorerConstants.timeOptions.last24Hours:
                    clause.value(Timestamps_1.default.queryLastDaysHours(0, 24));
                    break;
                case StorageExplorerConstants.timeOptions.last7Days:
                    clause.value(Timestamps_1.default.queryLastDaysHours(7, 0));
                    break;
                case StorageExplorerConstants.timeOptions.last31Days:
                    clause.value(Timestamps_1.default.queryLastDaysHours(31, 0));
                    break;
                case StorageExplorerConstants.timeOptions.last365Days:
                    clause.value(Timestamps_1.default.queryLastDaysHours(365, 0));
                    break;
                case StorageExplorerConstants.timeOptions.currentMonth:
                    clause.value(Timestamps_1.default.queryCurrentMonthLocal());
                    break;
                case StorageExplorerConstants.timeOptions.currentYear:
                    clause.value(Timestamps_1.default.queryCurrentYearLocal());
                    break;
            }
        };
        QueryBuilderViewModel.prototype.checkIfClauseChanged = function (clause) {
            this._queryViewModel.checkIfBuilderChanged(clause);
        };
        return QueryBuilderViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueryBuilderViewModel;
});
