"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var ko = require("knockout");
/**
 * View model for Options-structured dialogs.
 *
 * An Options dialog displays a configurable set of radio buttons to the user.
 */
var OptionDialogViewModel = (function (_super) {
    tslib_1.__extends(OptionDialogViewModel, _super);
    function OptionDialogViewModel(options) {
        var _this = _super.call(this) || this;
        document.title = "Microsoft Azure Storage Explorer - " + options.title;
        _this.title = options.title;
        _this.message = options.message;
        var nextId = 0;
        _this.options = ko.observableArray(options.options.map(function (option) {
            return { title: option.title, value: option.value, id: "option_" + nextId++ };
        }));
        _this.selectedOption = ko.observable(options.defaultOptionValue);
        options.buttons.forEach(function (button) {
            _this.addCustomButton(button.value, button.title, function () { return _this.apply(button.value); });
        });
        return _this;
    }
    /**
     * @override
     */
    OptionDialogViewModel.prototype.getResults = function () {
        return { option: this.selectedOption(), button: null };
    };
    OptionDialogViewModel.prototype.apply = function (button) {
        this.dialogResult({ option: this.selectedOption(), button: button });
    };
    ;
    return OptionDialogViewModel;
}(DialogViewModel_1.default));
exports.default = OptionDialogViewModel;
