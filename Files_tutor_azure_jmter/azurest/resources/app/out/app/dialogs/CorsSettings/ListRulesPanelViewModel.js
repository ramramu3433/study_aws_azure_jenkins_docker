"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CorsRuleViewModel_1 = require("./CorsRuleViewModel");
var PanelViewModel_1 = require("../Common/PanelViewModel");
var KeyCodes_1 = require("../Common/KeyCodes");
var ko = require("knockout");
/**
 * View model for the edit(insert/update) table entity dialog
 */
var ListRulesPanelViewModel = (function (_super) {
    tslib_1.__extends(ListRulesPanelViewModel, _super);
    function ListRulesPanelViewModel(dialogViewModel, corsRules) {
        var _this = _super.call(this, dialogViewModel) || this;
        /* Labels */
        // localize
        _this.titleLabel = "CORS Settings";
        _this.corsSettingsDescription = "Cross-Origin Resource Sharing rules allow clients to access resources from any web domain you authorize.";
        _this.addLabel = "Add";
        _this.editLabel = "Edit";
        _this.deleteLabel = "Delete";
        _this.canEdit = ko.pureComputed(function () { return !!_this.selectedRule(); });
        _this.canDelete = ko.pureComputed(function () { return !!_this.selectedRule(); });
        _this.handleClick = function (rule, event, index) {
            _this._selectRule(rule);
            return true;
        };
        _this.onKeyPress = function (rule, event) {
            var keyPressed = event.key || event.keyCode;
            switch (keyPressed) {
                case "Enter":
                case KeyCodes_1.default.Enter:
                    _this._selectRule(rule);
                    return false;
            }
            return true;
        };
        _this.corsRuleList = ko.observableArray(corsRules.map(function (rule) { return new CorsRuleViewModel_1.default(rule); }));
        _this.selectedRule = ko.observable(null);
        _this.addAcceptButton({
            label: PanelViewModel_1.default.saveCaption
        });
        _this.addCancelButton();
        return _this;
    }
    ListRulesPanelViewModel.prototype.getResults = function () {
        return this.corsRuleList().map(function (ruleVM) { return ruleVM.getCorsRule(); });
    };
    ListRulesPanelViewModel.prototype._selectRule = function (rule) {
        if (!!this.selectedRule()) {
            this.selectedRule().isSelected(false);
        }
        rule.isSelected(true);
        this.selectedRule(rule);
    };
    ListRulesPanelViewModel.prototype.openAddRulePanel = function () {
        this.dialogViewModel.openAddRulePanel();
    };
    ListRulesPanelViewModel.prototype.openEditRulePanel = function () {
        this.dialogViewModel.openEditRulePanel(this.selectedRule());
    };
    ListRulesPanelViewModel.prototype.addRule = function (corsRule) {
        this.dialogViewModel.openAddRulePanel();
        this.corsRuleList.push(corsRule);
    };
    ListRulesPanelViewModel.prototype.editRule = function (corsRule) {
        this.dialogViewModel.openEditRulePanel(corsRule);
    };
    ListRulesPanelViewModel.prototype.deleteRule = function () {
        this.corsRuleList.remove(this.selectedRule());
        this.selectedRule(null);
    };
    return ListRulesPanelViewModel;
}(PanelViewModel_1.default));
exports.default = ListRulesPanelViewModel;
