"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var FeedbackDialogViewModel = (function (_super) {
    tslib_1.__extends(FeedbackDialogViewModel, _super);
    function FeedbackDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.title = ko.observable("Let Us Know How We're Doing");
        _this.instructionLabel = ko.observable("Thanks for your feedback. What do you like about this tool? What don't you like or feel is missing?");
        _this.emailAddressLabel = "Email Address:";
        _this.emailAddressPlaceholder = "(optional)";
        _this.email = ko.observable();
        _this.feedbackText = ko.observable("");
        _this.data = ko.observable("");
        _this.isSendEnabled = ko.pureComputed(function () {
            return !!_this.feedbackText();
        });
        _this.hasData = ko.pureComputed(function () {
            return !!_this.data();
        });
        _this.isDataVisible = ko.observable(false);
        _this.toggleData = function () {
            _this.isDataVisible(!_this.isDataVisible());
        };
        if (parameters.title) {
            _this.title(parameters.title);
        }
        if (parameters.instructions) {
            _this.instructionLabel(parameters.instructions);
        }
        if (parameters.text) {
            _this.feedbackText(parameters.text);
        }
        if (parameters.data) {
            _this.data(parameters.data);
        }
        _this.addAcceptButton("Send", _this.isSendEnabled);
        _this.addCancelButton();
        return _this;
    }
    /**
     * @override
     */
    FeedbackDialogViewModel.prototype.getResults = function () {
        return {
            email: this.email(),
            text: this.feedbackText(),
            data: this.data()
        };
    };
    return FeedbackDialogViewModel;
}(DialogViewModel_1.default));
exports.default = FeedbackDialogViewModel;
