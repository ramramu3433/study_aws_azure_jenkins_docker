"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CorsRuleViewModel_1 = require("./CorsRuleViewModel");
var PanelViewModel_1 = require("../Common/PanelViewModel");
var ko = require("knockout");
/**
 * View model for the edit(insert/update) table entity dialog
 */
var EditRulePanelViewModel = (function (_super) {
    tslib_1.__extends(EditRulePanelViewModel, _super);
    function EditRulePanelViewModel(dialogViewModel) {
        var _this = _super.call(this, dialogViewModel) || this;
        _this._originalCorsRule = null;
        /* Labels */
        // localize
        _this.titleLabel = ko.observable("");
        _this.allowedOriginsLabel = "Allowed Origins:";
        _this.allowedMethodsLabel = "Allowed Methods:";
        _this.allowedHeadersLabel = "Allowed Headers:";
        _this.exposedHeadersLabel = "Exposed Headers:";
        _this.maxAgeInSecondsLabel = "Max Age (in seconds):";
        _this.allowedOriginsValue = ko.observable("");
        _this.allowedMethodsValue = ko.observable("GET,PUT");
        _this.allowedHeadersValue = ko.observable("");
        _this.exposedHeadersValue = ko.observable("");
        _this.maxAgeInSecondsValue = ko.observable(null);
        _this.canSave = ko.pureComputed(function () {
            return _this.allowedHeadersValue().length &&
                _this.allowedMethodsValue().length &&
                _this.exposedHeadersValue().length &&
                _this.allowedOriginsValue().length &&
                _this.maxAgeInSecondsValue() !== null;
        });
        _this.isEditing = ko.observable(false);
        _this.addAcceptButton({
            label: PanelViewModel_1.default.saveCaption,
            isEnabled: _this.canSave,
            action: function () { return _this.acceptEdit(); }
        });
        _this.addCancelButton({
            action: function () { return _this.dialogViewModel.closeEditRulePanel(); }
        });
        return _this;
    }
    EditRulePanelViewModel.prototype.initialize = function (corsRule) {
        this._originalCorsRule = corsRule || null;
        if (!!corsRule) {
            this.titleLabel("Edit CORS Rule");
            this.allowedOriginsValue(this._originalCorsRule.allowedOriginsText());
            this.allowedMethodsValue(this._originalCorsRule.allowedMethodsText());
            this.allowedHeadersValue(this._originalCorsRule.allowedHeadersText());
            this.exposedHeadersValue(this._originalCorsRule.exposedHeadersText());
            this.maxAgeInSecondsValue(this._originalCorsRule.maxAgeInSeconds());
            this.isEditing(true);
        }
        else {
            this.titleLabel("Add CORS Rule");
            this.allowedOriginsValue("");
            this.allowedMethodsValue("GET,PUT");
            this.allowedHeadersValue("");
            this.exposedHeadersValue("");
            this.maxAgeInSecondsValue(null);
            this.isEditing(false);
        }
    };
    EditRulePanelViewModel.prototype.acceptEdit = function () {
        if (!!this._originalCorsRule) {
            this._originalCorsRule.allowedHeaders(this.allowedHeadersValue().split(CorsRuleViewModel_1.default.separator));
            this._originalCorsRule.allowedMethods(this.allowedMethodsValue().split(CorsRuleViewModel_1.default.separator));
            this._originalCorsRule.allowedOrigins(this.allowedOriginsValue().split(CorsRuleViewModel_1.default.separator));
            this._originalCorsRule.exposedHeaders(this.exposedHeadersValue().split(CorsRuleViewModel_1.default.separator));
            this._originalCorsRule.maxAgeInSeconds(this.maxAgeInSecondsValue());
            this.dialogViewModel.closeEditRulePanel();
        }
        else {
            this.dialogViewModel.closeEditRulePanel(new CorsRuleViewModel_1.default({
                AllowedHeaders: this.allowedHeadersValue().split(CorsRuleViewModel_1.default.separator),
                AllowedMethods: this.allowedMethodsValue().split(CorsRuleViewModel_1.default.separator),
                AllowedOrigins: this.allowedOriginsValue().split(CorsRuleViewModel_1.default.separator),
                ExposedHeaders: this.exposedHeadersValue().split(CorsRuleViewModel_1.default.separator),
                MaxAgeInSeconds: this.maxAgeInSecondsValue()
            }));
        }
    };
    return EditRulePanelViewModel;
}(PanelViewModel_1.default));
exports.default = EditRulePanelViewModel;
