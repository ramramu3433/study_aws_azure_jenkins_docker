define(["require", "exports", "underscore", "knockout", "./CustomTimestampHelper", "./QueryClauseViewModel", "./ClauseGroup", "./ClauseGroupViewModel", "../Constants", "./DateTimeUtilities", "../DataTable/DataTableUtilities", "../TableEntityProcessor", "../Utilities"], function (require, exports, _, ko, CustomTimestampHelper, QueryClauseViewModel_1, ClauseGroup_1, ClauseGroupViewModel_1, Constants, DateTimeUtilities, DataTableUtilities, TableEntityProcessor, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueryBuilderViewModel = (function () {
        function QueryBuilderViewModel(queryViewModel, tableEntityListViewModel) {
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
                Constants.DisplayedEdmType.String,
                Constants.DisplayedEdmType.Boolean,
                Constants.DisplayedEdmType.Binary,
                Constants.DisplayedEdmType.DateTime,
                Constants.DisplayedEdmType.Double,
                Constants.DisplayedEdmType.Guid,
                Constants.DisplayedEdmType.Int32,
                Constants.DisplayedEdmType.Int64,
                ""
            ]);
            this.operators = ko.observableArray([
                Constants.Operator.Equal,
                Constants.Operator.GreaterThan,
                Constants.Operator.GreaterThanOrEqualTo,
                Constants.Operator.LessThan,
                Constants.Operator.LessThanOrEqualTo,
                Constants.Operator.NotEqualTo,
                ""
            ]);
            this.clauseRules = ko.observableArray([
                Constants.ClauseRule.And,
                Constants.ClauseRule.Or
            ]);
            this.timeOptions = ko.observableArray([
                Constants.timeOptions.lastHour,
                Constants.timeOptions.last24Hours,
                Constants.timeOptions.last7Days,
                Constants.timeOptions.last31Days,
                Constants.timeOptions.last365Days,
                Constants.timeOptions.currentMonth,
                Constants.timeOptions.currentYear,
            ]);
            this.queryString = ko.observable();
            this.getODataFilterFromClauses = function () {
                var filterString = "";
                var treeTraversal = function (group) {
                    for (var i = 0; i < group.children.length; i++) {
                        var currentItem = group.children[i];
                        if (currentItem instanceof QueryClauseViewModel_1.default) {
                            var clause = currentItem;
                            _this.timestampToValue(clause);
                            filterString = filterString.concat(_this.constructODataClause(filterString === "" ? "" : clause.and_or(), _this.generateLeftParentheses(clause), clause.field(), clause.type(), clause.operator(), clause.value(), _this.generateRightParentheses(clause)));
                        }
                        if (currentItem instanceof ClauseGroup_1.default) {
                            treeTraversal(currentItem);
                        }
                    }
                };
                treeTraversal(_this.queryClauses);
                return filterString.trim();
            };
            this.getSqlFilterFromClauses = function () {
                var filterString = "SELECT * FROM c";
                if (_this._queryViewModel.selectText() && _this._queryViewModel.selectText().length > 0) {
                    filterString = "SELECT";
                    _this._queryViewModel.selectText().forEach(function (value) {
                        if (value === Constants.EntityKeyNames.PartitionKey) {
                            value = "[\"" + TableEntityProcessor.keyProperties.PartitionKey + "\"]";
                            filterString = filterString.concat(filterString === "SELECT" ? " c" : ", c");
                        }
                        else if (value === Constants.EntityKeyNames.RowKey) {
                            value = "[\"" + TableEntityProcessor.keyProperties.Id2 + "\"]";
                            filterString = filterString.concat(filterString === "SELECT" ? " c" : ", c");
                        }
                        else {
                            if (value === Constants.EntityKeyNames.Timestamp) {
                                value = TableEntityProcessor.keyProperties.Timestamp;
                            }
                            filterString = filterString.concat(filterString === "SELECT" ? " c." : ", c.");
                        }
                        filterString = filterString.concat(value);
                    });
                    filterString = filterString.concat(" FROM c");
                }
                if (_this.queryClauses.children.length === 0) {
                    return filterString;
                }
                filterString = filterString.concat(" WHERE");
                var first = true;
                var treeTraversal = function (group) {
                    for (var i = 0; i < group.children.length; i++) {
                        var currentItem = group.children[i];
                        if (currentItem instanceof QueryClauseViewModel_1.default) {
                            var clause = currentItem;
                            var timeStampValue = _this.timestampToSqlValue(clause);
                            var value = clause.value();
                            if (!clause.isValue()) {
                                value = timeStampValue;
                            }
                            filterString = filterString.concat(_this.constructSqlClause(first ? "" : clause.and_or(), _this.generateLeftParentheses(clause), clause.field(), clause.type(), clause.operator(), value, _this.generateRightParentheses(clause)));
                            first = false;
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
                var newHeaders = _this._tableEntityListViewModel.headers;
                _this.columnOptions(_.unique(originalHeaders.concat(newHeaders)).sort(DataTableUtilities.compareTableColumns));
            };
            this.constructODataClause = function (clauseRule, leftParentheses, propertyName, type, operator, value, rightParentheses) {
                switch (type) {
                    case Constants.DisplayedEdmType.DateTime:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " " + value + rightParentheses;
                    case Constants.DisplayedEdmType.String:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " '" + value + "'" + rightParentheses;
                    case Constants.DisplayedEdmType.Guid:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " guid'" + value + "'" + rightParentheses;
                    case Constants.DisplayedEdmType.Binary:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " binary'" + value + "'" + rightParentheses;
                    default:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + propertyName + " " + _this.operatorConverter(operator) + " " + value + rightParentheses;
                }
            };
            this.constructSqlClause = function (clauseRule, leftParentheses, propertyName, type, operator, value, rightParentheses) {
                if (propertyName === Constants.EntityKeyNames.PartitionKey) {
                    propertyName = TableEntityProcessor.keyProperties.PartitionKey;
                    return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c[\"" + propertyName + "\"] " + operator + " '" + value + "'" + rightParentheses;
                }
                else if (propertyName === Constants.EntityKeyNames.RowKey) {
                    propertyName = TableEntityProcessor.keyProperties.Id;
                    return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + " " + operator + " '" + value + "'" + rightParentheses;
                }
                else if (propertyName === Constants.EntityKeyNames.Timestamp) {
                    propertyName = TableEntityProcessor.keyProperties.Timestamp;
                    return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + " " + operator + " " + DateTimeUtilities.convertJSDateToUnix(value) + rightParentheses;
                }
                switch (type) {
                    case Constants.DisplayedEdmType.DateTime:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + "[\"$v\"] " + operator + " '" + DateTimeUtilities.convertJSDateToTicksWithPadding(value) + "'" + rightParentheses;
                    case Constants.DisplayedEdmType.Int64:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + "[\"$v\"] " + operator + " '" + Utilities.padLongWithZeros(value) + "'" + rightParentheses;
                    case Constants.DisplayedEdmType.String:
                    case Constants.DisplayedEdmType.Guid:
                    case Constants.DisplayedEdmType.Binary:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + "[\"$v\"] " + operator + " '" + value + "'" + rightParentheses;
                    default:
                        return " " + clauseRule.toLowerCase() + " " + leftParentheses + "c." + propertyName + "[\"$v\"] " + operator + " " + value + rightParentheses;
                }
            };
            this.operatorConverter = function (operator) {
                switch (operator) {
                    case Constants.Operator.Equal:
                        return Constants.ODataOperator.EqualTo;
                    case Constants.Operator.GreaterThan:
                        return Constants.ODataOperator.GreaterThan;
                    case Constants.Operator.GreaterThanOrEqualTo:
                        return Constants.ODataOperator.GreaterThanOrEqualTo;
                    case Constants.Operator.LessThan:
                        return Constants.ODataOperator.LessThan;
                    case Constants.Operator.LessThanOrEqualTo:
                        return Constants.ODataOperator.LessThanOrEqualTo;
                    case Constants.Operator.NotEqualTo:
                        return Constants.ODataOperator.NotEqualTo;
                }
                return null;
            };
            this.groupClauses = function () {
                _this.queryClauses.groupSelectedItems();
                _this.updateClauseArray();
                _this.updateCanGroupClauses();
            };
            this.addClauseIndex = function (index, data) {
                var newClause = new QueryClauseViewModel_1.default(_this, "And", "", "String", Constants.Operator.EqualTo, "", true, "", "", "", 
                //null, 
                true);
                _this.addClauseImpl(newClause, index);
                if (index === _this.clauseArray().length - 1) {
                    _this.scrollToBottom();
                }
                _this.updateCanGroupClauses();
                newClause.isAndOrFocused(true);
                $(window).resize();
            };
            // adds a new clause to the end of the array
            this.addNewClause = function () {
                _this.addClauseIndex(_this.clauseArray().length, null);
            };
            this.deleteClause = function (index, data) {
                _this.deleteClauseImpl(index);
                if (_this.clauseArray().length !== 0) {
                    _this.clauseArray()[0].and_or("");
                    _this.clauseArray()[0].canAnd(false);
                }
                _this.updateCanGroupClauses();
                $(window).resize();
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
                var example1 = new QueryClauseViewModel_1.default(this, "", "PartitionKey", "String", Constants.Operator.Equal, tableEntityListViewModel.items()[0].PartitionKey._, false, "", "", "", 
                //null,
                true);
                var example2 = new QueryClauseViewModel_1.default(this, "And", "RowKey", "String", Constants.Operator.Equal, tableEntityListViewModel.items()[0].RowKey._, true, "", "", "", 
                //null,
                true);
                this.addClauseImpl(example1, 0);
                this.addClauseImpl(example2, 1);
            }
            else {
                this.clauseArray();
            }
            this._queryViewModel = queryViewModel;
            this._tableEntityListViewModel = tableEntityListViewModel;
            this.columnOptions = ko.observableArray(queryViewModel.columnOptions());
            this.columnOptions.subscribe(function (newColumnOptions) {
                queryViewModel.columnOptions(newColumnOptions);
            });
        }
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
            var newClause = new QueryClauseViewModel_1.default(this, 
            //this._tableEntityListViewModel.tableExplorerContext.hostProxy,
            "And", clauseToAdd.field(), "DateTime", Constants.Operator.LessThan, "", true, Constants.timeOptions.custom, timestamp.endTime, "range", 
            //null,
            true);
            newClause.isLocal = ko.observable(timestamp.timeZone === "local");
            this.addClauseImpl(newClause, index + 1);
            if (index + 1 === this.clauseArray().length - 1) {
                this.scrollToBottom();
            }
        };
        ;
        QueryBuilderViewModel.prototype.scrollToBottom = function () {
            var scrollBox = document.getElementById("scroll");
            if (!this.scrollEventListener) {
                scrollBox.addEventListener("scroll", function () {
                    var translate = "translate(0," + this.scrollTop + "px)";
                    var allTh = this.querySelectorAll("thead td");
                    for (var i = 0; i < allTh.length; i++) {
                        allTh[i].style.transform = translate;
                    }
                });
                this.scrollEventListener = true;
            }
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
            if (this.clauseArray()[previousClause]) {
                this.clauseArray()[previousClause].isDeleteButtonFocused(true);
            }
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
            //DataTableUtilities.forceRecalculateTableSize();
        };
        QueryBuilderViewModel.prototype.timestampToValue = function (clause) {
            if (clause.isValue()) {
                return;
            }
            else if (clause.isTimestamp()) {
                this.getTimeStampToQuery(clause);
                // } else if (clause.isCustomLastTimestamp()) {
                //     clause.value(`datetime'${CustomTimestampHelper._queryLastTime(clause.customLastTimestamp().lastNumber, clause.customLastTimestamp().lastTimeUnit)}'`);
            }
            else if (clause.isCustomRangeTimestamp()) {
                if (clause.isLocal()) {
                    clause.value("datetime'" + DateTimeUtilities.getUTCDateTime(clause.customTimeValue()) + "'");
                }
                else {
                    clause.value("datetime'" + clause.customTimeValue() + "Z'");
                }
            }
        };
        QueryBuilderViewModel.prototype.timestampToSqlValue = function (clause) {
            if (clause.isValue()) {
                return null;
            }
            else if (clause.isTimestamp()) {
                return this.getTimeStampToSqlQuery(clause);
                // } else if (clause.isCustomLastTimestamp()) {
                //     clause.value(CustomTimestampHelper._queryLastTime(clause.customLastTimestamp().lastNumber, clause.customLastTimestamp().lastTimeUnit));
            }
            else if (clause.isCustomRangeTimestamp()) {
                if (clause.isLocal()) {
                    return DateTimeUtilities.getUTCDateTime(clause.customTimeValue());
                }
                else {
                    return clause.customTimeValue();
                }
            }
            return null;
        };
        QueryBuilderViewModel.prototype.getTimeStampToQuery = function (clause) {
            switch (clause.timeValue()) {
                case Constants.timeOptions.lastHour:
                    clause.value("datetime'" + CustomTimestampHelper._queryLastDaysHours(0, 1) + "'");
                    break;
                case Constants.timeOptions.last24Hours:
                    clause.value("datetime'" + CustomTimestampHelper._queryLastDaysHours(0, 24) + "'");
                    break;
                case Constants.timeOptions.last7Days:
                    clause.value("datetime'" + CustomTimestampHelper._queryLastDaysHours(7, 0) + "'");
                    break;
                case Constants.timeOptions.last31Days:
                    clause.value("datetime'" + CustomTimestampHelper._queryLastDaysHours(31, 0) + "'");
                    break;
                case Constants.timeOptions.last365Days:
                    clause.value("datetime'" + CustomTimestampHelper._queryLastDaysHours(365, 0) + "'");
                    break;
                case Constants.timeOptions.currentMonth:
                    clause.value("datetime'" + CustomTimestampHelper._queryCurrentMonthLocal() + "'");
                    break;
                case Constants.timeOptions.currentYear:
                    clause.value("datetime'" + CustomTimestampHelper._queryCurrentYearLocal() + "'");
                    break;
            }
        };
        QueryBuilderViewModel.prototype.getTimeStampToSqlQuery = function (clause) {
            switch (clause.timeValue()) {
                case Constants.timeOptions.lastHour:
                    return CustomTimestampHelper._queryLastDaysHours(0, 1);
                case Constants.timeOptions.last24Hours:
                    return CustomTimestampHelper._queryLastDaysHours(0, 24);
                case Constants.timeOptions.last7Days:
                    return CustomTimestampHelper._queryLastDaysHours(7, 0);
                case Constants.timeOptions.last31Days:
                    return CustomTimestampHelper._queryLastDaysHours(31, 0);
                case Constants.timeOptions.last365Days:
                    return CustomTimestampHelper._queryLastDaysHours(365, 0);
                case Constants.timeOptions.currentMonth:
                    return CustomTimestampHelper._queryCurrentMonthLocal();
                case Constants.timeOptions.currentYear:
                    return CustomTimestampHelper._queryCurrentYearLocal();
            }
            return null;
        };
        QueryBuilderViewModel.prototype.checkIfClauseChanged = function (clause) {
            this._queryViewModel.checkIfBuilderChanged(clause);
        };
        return QueryBuilderViewModel;
    }());
    exports.default = QueryBuilderViewModel;
});
