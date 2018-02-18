"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var EditRulePanelViewModel_1 = require("./EditRulePanelViewModel");
var ListRulesPanelViewModel_1 = require("./ListRulesPanelViewModel");
var MultipanelDialogViewModel_1 = require("../Common/MultipanelDialogViewModel");
var $ = require("jquery");
var CorsSettingViewModel = (function (_super) {
    tslib_1.__extends(CorsSettingViewModel, _super);
    function CorsSettingViewModel(parameters) {
        var _this = _super.call(this) || this;
        var corsRules = parameters.corsRules || [];
        _this.defaultPanel = new ListRulesPanelViewModel_1.default(_this, corsRules);
        _this.editPanel = new EditRulePanelViewModel_1.default(_this);
        return _this;
    }
    CorsSettingViewModel.prototype.openAddRulePanel = function () {
        this.editPanel.initialize();
        this.currentPanel("editor-panel");
        $("#allowedOriginsLabel").focus();
    };
    CorsSettingViewModel.prototype.openEditRulePanel = function (corsRule) {
        this.editPanel.initialize(corsRule);
        this.currentPanel("editor-panel");
        $("#allowedOriginsLabel").focus();
    };
    CorsSettingViewModel.prototype.endAddCorsRule = function (newRule) {
        if (!!newRule) {
            this.defaultPanel.corsRuleList.push(newRule);
            this.defaultPanel.selectedRule(newRule);
        }
    };
    CorsSettingViewModel.prototype.closeEditRulePanel = function (newRule) {
        if (!!newRule) {
            this.defaultPanel.addRule(newRule);
        }
        this.currentPanel("default-panel");
    };
    CorsSettingViewModel.prototype.getDialogResult = function () {
        return this.defaultPanel.corsRuleList().map(function (rule) { return rule.getCorsRule(); });
    };
    return CorsSettingViewModel;
}(MultipanelDialogViewModel_1.default));
exports.default = CorsSettingViewModel;
