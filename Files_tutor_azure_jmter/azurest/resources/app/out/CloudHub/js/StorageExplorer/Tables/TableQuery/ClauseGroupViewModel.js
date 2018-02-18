/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/Tables/TableQuery/TableQueryConstants"], function (require, exports, ko, TableQueryConstants) {
    "use strict";
    /**
     * View model for showing group indicators on UI, contains information such as group color and border styles.
     */
    var ClauseGroupViewModel = (function () {
        function ClauseGroupViewModel(clauseGroup, canUngroup, queryBuilderViewModel) {
            var _this = this;
            this.ungroupClausesLabel = "Ungroup clauses"; // localize
            this.ungroupClauses = function () {
                _this._clauseGroup.ungroup();
                _this._queryBuilderViewModel.updateClauseArray();
            };
            this._clauseGroup = clauseGroup;
            this._queryBuilderViewModel = queryBuilderViewModel;
            this.backgroundColor = ko.observable(this.getGroupBackgroundColor(clauseGroup));
            this.canUngroup = ko.observable(canUngroup);
            this.showTopBorder = ko.observable(false);
            this.showLeftBorder = ko.observable(false);
            this.showBottomBorder = ko.observable(false);
            this.depth = ko.observable(clauseGroup.getCurrentGroupDepth());
        }
        ClauseGroupViewModel.prototype.getGroupBackgroundColor = function (group) {
            var colorCount = TableQueryConstants.clauseGroupColors.length;
            if (group.isRootGroup) {
                return TableQueryConstants.transparentColor;
            }
            else {
                return TableQueryConstants.clauseGroupColors[group.getCurrentGroupDepth() % colorCount];
            }
        };
        return ClauseGroupViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ClauseGroupViewModel;
});
