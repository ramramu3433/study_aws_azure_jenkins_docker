define(["require", "exports", "./QueryClauseViewModel", "../Utilities"], function (require, exports, QueryClauseViewModel_1, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClauseGroup = (function () {
        function ClauseGroup(isRootGroup, parentGroup, id) {
            this.children = new Array();
            this.isRootGroup = isRootGroup;
            this.parentGroup = parentGroup;
            this._id = id ? id : Utilities.guid();
        }
        /**
         * Flattens the clause tree into an array, depth-first, left to right.
         */
        ClauseGroup.prototype.flattenClauses = function (targetArray) {
            var tempArray = new Array();
            this.flattenClausesImpl(this, tempArray);
            targetArray.removeAll();
            tempArray.forEach(function (element) {
                targetArray.push(element);
            });
        };
        ClauseGroup.prototype.insertClauseBefore = function (newClause, insertBefore) {
            if (!insertBefore) {
                newClause.clauseGroup = this;
                this.children.push(newClause);
            }
            else {
                var targetGroup = insertBefore.clauseGroup;
                if (targetGroup) {
                    var insertBeforeIndex = targetGroup.children.indexOf(insertBefore);
                    newClause.clauseGroup = targetGroup;
                    targetGroup.children.splice(insertBeforeIndex, 0, newClause);
                }
            }
        };
        ClauseGroup.prototype.deleteClause = function (clause) {
            var targetGroup = clause.clauseGroup;
            if (targetGroup) {
                var index = targetGroup.children.indexOf(clause);
                targetGroup.children.splice(index, 1);
                clause.dispose();
                if (targetGroup.children.length <= 1 && !targetGroup.isRootGroup) {
                    var parent = targetGroup.parentGroup;
                    var targetGroupIndex = parent.children.indexOf(targetGroup);
                    if (targetGroup.children.length === 1) {
                        var orphan = targetGroup.children.shift();
                        if (orphan instanceof QueryClauseViewModel_1.default) {
                            orphan.clauseGroup = parent;
                        }
                        else if (orphan instanceof ClauseGroup) {
                            orphan.parentGroup = parent;
                        }
                        parent.children.splice(targetGroupIndex, 1, orphan);
                    }
                    else {
                        parent.children.splice(targetGroupIndex, 1);
                    }
                }
            }
        };
        ClauseGroup.prototype.removeAll = function () {
            var allClauses = new Array();
            this.flattenClausesImpl(this, allClauses);
            while (allClauses.length > 0) {
                allClauses.shift().dispose();
            }
            this.children = new Array();
        };
        /**
         * Groups selected items. Returns True if a new group was created, otherwise False.
         */
        ClauseGroup.prototype.groupSelectedItems = function () {
            // Find the selection start & end, also check for gaps between selected items (if found, cannot proceed).
            var selection = this.getCheckedItemsInfo();
            if (selection.canGroup) {
                var newGroup = new ClauseGroup(false, this);
                // Replace the selected items with the new group, and then move the selected items into the new group.
                var groupedItems = this.children.splice(selection.begin, selection.end - selection.begin + 1, newGroup);
                groupedItems.forEach(function (element) {
                    newGroup.children.push(element);
                    if (element instanceof QueryClauseViewModel_1.default) {
                        element.clauseGroup = newGroup;
                    }
                    else if (element instanceof ClauseGroup) {
                        element.parentGroup = newGroup;
                    }
                });
                this.unselectAll();
                return true;
            }
            return false;
        };
        ClauseGroup.prototype.ungroup = function () {
            if (this.isRootGroup) {
                return;
            }
            var parentGroup = this.parentGroup;
            var index = parentGroup.children.indexOf(this);
            if (index >= 0) {
                parentGroup.children.splice(index, 1);
                var toPromote = this.children.splice(0, this.children.length);
                // Move all children one level up.
                toPromote.forEach(function (element) {
                    if (element instanceof ClauseGroup) {
                        element.parentGroup = parentGroup;
                    }
                    else if (element instanceof QueryClauseViewModel_1.default) {
                        element.clauseGroup = parentGroup;
                    }
                    parentGroup.children.splice(index, 0, element);
                    index++;
                });
            }
        };
        ClauseGroup.prototype.canGroupSelectedItems = function () {
            return this.getCheckedItemsInfo().canGroup;
        };
        ClauseGroup.prototype.findDeepestGroupInChildren = function (skipIndex) {
            var deepest = this;
            var level = 0;
            var func = function (currentGroup) {
                level++;
                if (currentGroup.getCurrentGroupDepth() > deepest.getCurrentGroupDepth()) {
                    deepest = currentGroup;
                }
                for (var i = 0; i < currentGroup.children.length; i++) {
                    var currentItem = currentGroup.children[i];
                    if ((i !== skipIndex || level > 1) && currentItem instanceof ClauseGroup) {
                        func(currentItem);
                    }
                }
                level--;
            };
            func(this);
            return deepest;
        };
        ClauseGroup.prototype.getCheckedItemsInfo = function () {
            var beginIndex = -1;
            var endIndex = -1;
            // In order to perform group, all selected items must be next to each other.
            // If one or more items are not selected between the first and the last selected item, the gapFlag will be set to True, meaning cannot perform group.
            var gapFlag = false;
            var count = 0;
            for (var i = 0; i < this.children.length; i++) {
                var currentItem = this.children[i];
                var subGroupSelectionState;
                if (currentItem instanceof ClauseGroup) {
                    subGroupSelectionState = currentItem.getSelectionState();
                    if (subGroupSelectionState.partiallySelected) {
                        gapFlag = true;
                        break;
                    }
                }
                if (beginIndex < 0 && endIndex < 0 &&
                    ((currentItem instanceof QueryClauseViewModel_1.default && currentItem.checkedForGrouping.peek()) ||
                        (currentItem instanceof ClauseGroup && subGroupSelectionState.allSelected))) {
                    beginIndex = i;
                }
                if (beginIndex >= 0 && endIndex < 0 &&
                    ((currentItem instanceof QueryClauseViewModel_1.default && !currentItem.checkedForGrouping.peek()) ||
                        (currentItem instanceof ClauseGroup && !subGroupSelectionState.allSelected))) {
                    endIndex = i - 1;
                }
                if (beginIndex >= 0 && endIndex < 0) {
                    count++;
                }
                if (beginIndex >= 0 && endIndex >= 0 &&
                    ((currentItem instanceof QueryClauseViewModel_1.default && currentItem.checkedForGrouping.peek()) ||
                        (currentItem instanceof ClauseGroup && !subGroupSelectionState.nonSelected))) {
                    gapFlag = true;
                    break;
                }
            }
            if (!gapFlag && endIndex < 0) {
                endIndex = this.children.length - 1;
            }
            return {
                canGroup: beginIndex >= 0 && !gapFlag && count > 1,
                begin: beginIndex,
                end: endIndex
            };
        };
        ClauseGroup.prototype.getSelectionState = function () {
            var selectedCount = 0;
            for (var i = 0; i < this.children.length; i++) {
                var currentItem = this.children[i];
                if (currentItem instanceof ClauseGroup && currentItem.getSelectionState().allSelected) {
                    selectedCount++;
                }
                if (currentItem instanceof QueryClauseViewModel_1.default && currentItem.checkedForGrouping.peek()) {
                    selectedCount++;
                }
            }
            return {
                allSelected: (selectedCount === this.children.length),
                partiallySelected: (selectedCount > 0 && selectedCount < this.children.length),
                nonSelected: (selectedCount === 0)
            };
        };
        ClauseGroup.prototype.unselectAll = function () {
            for (var i = 0; i < this.children.length; i++) {
                var currentItem = this.children[i];
                if (currentItem instanceof ClauseGroup) {
                    currentItem.unselectAll();
                }
                if (currentItem instanceof QueryClauseViewModel_1.default) {
                    currentItem.checkedForGrouping(false);
                }
            }
        };
        ClauseGroup.prototype.flattenClausesImpl = function (queryGroup, targetArray) {
            if (queryGroup.isRootGroup) {
                targetArray.splice(0, targetArray.length);
            }
            for (var i = 0; i < queryGroup.children.length; i++) {
                var currentItem = queryGroup.children[i];
                if (currentItem instanceof ClauseGroup) {
                    this.flattenClausesImpl(currentItem, targetArray);
                }
                if (currentItem instanceof QueryClauseViewModel_1.default) {
                    targetArray.push(currentItem);
                }
            }
        };
        ClauseGroup.prototype.getTreeDepth = function () {
            var currentDepth = this.getCurrentGroupDepth();
            for (var i = 0; i < this.children.length; i++) {
                var currentItem = this.children[i];
                if (currentItem instanceof ClauseGroup) {
                    var newDepth = currentItem.getTreeDepth();
                    if (newDepth > currentDepth) {
                        currentDepth = newDepth;
                    }
                }
            }
            return currentDepth;
        };
        ClauseGroup.prototype.getCurrentGroupDepth = function () {
            var group = this;
            var depth = 0;
            while (!group.isRootGroup) {
                depth++;
                group = group.parentGroup;
            }
            return depth;
        };
        ClauseGroup.prototype.getId = function () {
            return this._id;
        };
        return ClauseGroup;
    }());
    exports.default = ClauseGroup;
});
