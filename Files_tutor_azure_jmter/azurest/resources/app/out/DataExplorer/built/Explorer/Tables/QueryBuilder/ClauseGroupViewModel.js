define(["require", "exports", "knockout", "../Constants"], function (require, exports, ko, Constants) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            this.borderBackgroundColor = ko.observable("solid thin " + this.getGroupBackgroundColor(clauseGroup));
        }
        ClauseGroupViewModel.prototype.getGroupBackgroundColor = function (group) {
            var colorCount = Constants.clauseGroupColors.length;
            if (group.isRootGroup) {
                return Constants.transparentColor;
            }
            else {
                return Constants.clauseGroupColors[group.getCurrentGroupDepth() % colorCount];
            }
        };
        return ClauseGroupViewModel;
    }());
    exports.default = ClauseGroupViewModel;
});
