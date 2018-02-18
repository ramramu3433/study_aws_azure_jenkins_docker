/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    /**
     * Base view model for a dialog with ok/cancel or similar buttons
     */
    var DialogViewModel = (function () {
        function DialogViewModel(id, host) {
            this.buttons = ko.observableArray();
            this.disableButtons = ko.observable(false);
            this.host = host;
            this.id = id;
        }
        DialogViewModel.prototype.addCancelButton = function (isEnabled) {
            var _this = this;
            if (isEnabled === void 0) { isEnabled = null; }
            this.addCustomButton(DialogViewModel.cancelKey, DialogViewModel.cancelCaption, function () { return _this.host.executeOperation("Environment.dismissDialog", [null]); }, isEnabled);
        };
        DialogViewModel.prototype.addCloseButton = function (isEnabled) {
            var _this = this;
            if (isEnabled === void 0) { isEnabled = null; }
            this.addCustomButton(DialogViewModel.closeKey, DialogViewModel.closeCaption, function () { return _this.host.executeOperation("Environment.dismissDialog", [null]); }, isEnabled);
        };
        DialogViewModel.prototype.addOkButton = function (getParameters, isEnabled) {
            var _this = this;
            this.addCustomButton(DialogViewModel.okKey, DialogViewModel.okCaption, function () { return _this.host.executeOperation("Environment.dismissDialog", [getParameters()]); }, isEnabled);
        };
        DialogViewModel.prototype.addCustomButton = function (key, caption, callback, isEnabled, isFocused, isVisible) {
            this.buttons.push({
                key: key,
                caption: ko.observable(caption),
                isEnabled: isEnabled ? isEnabled : ko.observable(true),
                isFocused: isFocused ? isFocused : ko.observable(false),
                isVisible: isVisible ? isVisible : ko.observable(true),
                onClick: callback
            });
        };
        DialogViewModel.prototype.changeButtonCaption = function (key, newCaption) {
            this.buttons().forEach(function (button) {
                if (button.key === key) {
                    button.caption(newCaption);
                }
            });
        };
        DialogViewModel.prototype.setButtonVisiblity = function (key, visibility) {
            this.buttons().forEach(function (button) {
                if (button.key === key) {
                    button.isVisible(visibility);
                }
            });
        };
        DialogViewModel.prototype.hideAllButtons = function () {
            this.buttons().forEach(function (button) {
                button.isVisible(false);
            });
        };
        DialogViewModel.prototype.disableAllButtons = function () {
            this.disableButtons(true);
        };
        DialogViewModel.prototype.enableAllButtons = function () {
            this.disableButtons(false);
        };
        return DialogViewModel;
    }());
    DialogViewModel.cancelKey = "cancel";
    DialogViewModel.okKey = "ok";
    DialogViewModel.applyKey = "apply";
    DialogViewModel.saveKey = "save";
    DialogViewModel.closeKey = "close";
    // localize
    DialogViewModel.okCaption = "OK";
    DialogViewModel.cancelCaption = "Cancel";
    DialogViewModel.applyCaption = "Apply";
    DialogViewModel.saveCaption = "Save";
    DialogViewModel.closeCaption = "Close";
    return DialogViewModel;
});
