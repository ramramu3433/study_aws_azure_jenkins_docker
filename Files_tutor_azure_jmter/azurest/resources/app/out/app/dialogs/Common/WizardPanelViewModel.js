"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var PanelViewModel_1 = require("./PanelViewModel");
/**
 * Base view model for a wizard panel.
 */
var WizardPanelViewModel = (function (_super) {
    tslib_1.__extends(WizardPanelViewModel, _super);
    function WizardPanelViewModel(dialogViewModel) {
        var _this = _super.call(this, dialogViewModel) || this;
        _this.finishText = ko.observable("Ok");
        _this.title("Step Title");
        _this._okButtonEnabled = ko.observable(true);
        _this._nextButtonEnabled = ko.observable(true);
        _this._backButtonEnabled = ko.observable(true);
        _this.addCustomButton(WizardPanelViewModel.backButtonId, WizardPanelViewModel.backButtonLabel, function () { return _this.onBack(); }, {
            isEnabled: _this._backButtonEnabled
        });
        _this.addCustomButton(WizardPanelViewModel.nextButtonId, WizardPanelViewModel.nextButtonLabel, function () { return _this.onNext(); }, {
            isEnabled: _this._nextButtonEnabled
        });
        _this.addAcceptButton({
            label: _this.finishText,
            action: function () { return _this.onFinish(); },
            isEnabled: _this._okButtonEnabled
        });
        _this.addCancelButton();
        _this.isLastStep = ko.observable();
        _this.isLastStep.subscribe(function (value) {
            _this._okButtonEnabled(value);
            _this._nextButtonEnabled(!value);
        });
        _this.isFirstStep = ko.observable();
        _this.isFirstStep.subscribe(function (value) {
            _this._backButtonEnabled(!value);
        });
        _this.canContinue = ko.observable();
        _this.canContinue.subscribe(function (value) {
            if (_this.isLastStep()) {
                _this._okButtonEnabled(value);
            }
            else {
                _this._nextButtonEnabled(value);
            }
        });
        return _this;
    }
    /**
     * @virtual
     */
    WizardPanelViewModel.prototype.getPanelResult = function () {
        return null;
    };
    WizardPanelViewModel.prototype.beforeContinue = function () {
        return true;
    };
    WizardPanelViewModel.prototype.onBack = function () { return; };
    ;
    WizardPanelViewModel.prototype.onNext = function () { return; };
    ;
    WizardPanelViewModel.prototype.onFinish = function () { return; };
    ;
    return WizardPanelViewModel;
}(PanelViewModel_1.default));
WizardPanelViewModel.nextButtonId = "next";
WizardPanelViewModel.nextButtonLabel = "Next";
WizardPanelViewModel.backButtonId = "back";
WizardPanelViewModel.backButtonLabel = "Back";
exports.default = WizardPanelViewModel;
