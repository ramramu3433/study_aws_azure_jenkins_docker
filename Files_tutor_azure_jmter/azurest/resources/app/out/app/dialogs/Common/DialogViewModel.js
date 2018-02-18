"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
require("./KnockoutBindings");
var DialogButtonViewModel_1 = require("./DialogButtonViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var $ = require("jquery");
var ko = require("knockout");
/**
 * Base view model for a dialog.
 */
var DialogViewModel = (function () {
    function DialogViewModel() {
        var _this = this;
        this.currentPanel = ko.observable("default-panel");
        this.buttons = ko.observableArray();
        this.disableButtons = ko.observable(false);
        /**
         * Contains the data gathered by the dialog.
         *
         * When set, the dialog automatically closes.
         *
         * If the dialog is ready to accept, `dialogResult` should be set with the return results.
         * If the dialog is ready to cancel. `dialogResult` should be set to null.
         */
        this.dialogResult = ko.observable(undefined);
        this.defaultClose = function () { return _this.dialogResult(null); };
        this.defaultCloseWithResults = function () { return _this.dialogResult(_this.getResults()); };
    }
    /**
     * Collects the data gathered by the dialog before closing.
     *
     * @virtual
     */
    DialogViewModel.prototype.getResults = function () {
        return true;
    };
    /**
     * Adds a dialog button that, when clicked, will close the dialog and return its results.
     *
     * @param label Optional. A custom label for the button. Defaults to "OK",
     * @param isEnabled Optional. An observable object that determines whether the button is enabled.
     * @param isFocused Optional. An observable object that determines whether the button has focus.
     * @param isVisible Optional. An observable object that determines whether the button is visible.
     * @param index Optional. The index at which to insert the button.
     */
    DialogViewModel.prototype.addAcceptButton = function (label, isEnabled, isFocused, isVisible, index) {
        if (label === void 0) { label = DialogViewModel.okCaption; }
        this.addCustomButton(DialogViewModel.okKey, label, this.defaultCloseWithResults, isEnabled, isFocused, isVisible, index);
    };
    /**
     * Adds a dialog button that, when clicked, will close the dialog with no results.
     *
     * @param label Optional. A label for the button. Defaults to "Cancel",
     * @param isEnabled Optional. An observable object that determines whether the button is enabled.
     * @param isFocused Optional. An observable object that determines whether the button has focus.
     * @param isVisible Optional. An observable object that determines whether the button is visible.
     * @param index Optional. The index at which to insert the button.
     */
    DialogViewModel.prototype.addCancelButton = function (label, isEnabled, isFocused, isVisible, index) {
        if (label === void 0) { label = DialogViewModel.cancelCaption; }
        this.addCustomButton(DialogViewModel.cancelKey, label, this.defaultClose, isEnabled, isFocused, isVisible, index);
    };
    /**
     * Adds a custom button dialog button.
     *
     * @param id An HTML ID to uniquely identify the button element.
     * @param label A label for the button.
     * @param action The action to perform when the button is clicked.
     * @param isEnabled Optional. An observable object that determines whether the button is enabled.
     * @param isFocused Optional. An observable object that determines whether the button has focus.
     * @param isVisible Optional. An observable object that determines whether the button is visible.
     * @param index Optional. The index at which to insert the button.
     */
    DialogViewModel.prototype.addCustomButton = function (id, label, action, isEnabled, isFocused, isVisible, index) {
        if (isEnabled === void 0) { isEnabled = ko.observable(true); }
        if (isFocused === void 0) { isFocused = ko.observable(false); }
        if (isVisible === void 0) { isVisible = ko.observable(true); }
        if (!ko.isObservable(label)) {
            label = ko.observable(label);
        }
        if (!index) {
            index = this.buttons().length;
        }
        this.buttons.splice(index, 0, new DialogButtonViewModel_1.default(label, id, isEnabled, isFocused, isVisible, action));
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
    DialogViewModel.prototype.showError = function (message, error) {
        var errorString;
        if (typeof error === "string") {
            errorString = error;
        }
        else if (!!error.message) {
            errorString = error.message;
        }
        else {
            errorString = JSON.stringify(error, null, 2);
        }
        var message = message + "\n\n" + errorString;
        // TODO: [cralvord] Implement common logging module for Storage Explorer.
        console.error(message);
        DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.showMessageBox", {
            title: "Storage Explorer",
            message: message,
            type: "error"
        });
    };
    /**
     * Executes an action on a keyboard event.
     * Modifiers: ctrlKey - control/command key, shiftKey - shift key, altKey - alt/option key;
     * pass on 'null' to ignore the modifier (default).
     */
    DialogViewModel.prototype.onKey = function (event, keyCombo, action) {
        var source = event.target || event.srcElement;
        var keyCode = event.keyCode;
        var $sourceElement = $(source);
        var handled = false;
        if ($sourceElement.length &&
            $.isFunction(action) &&
            (keyCode === keyCombo.keyCode) &&
            (keyCombo.metaKey === undefined || keyCombo.metaKey === event.metaKey) &&
            (keyCombo.shiftKey === undefined || keyCombo.shiftKey === event.shiftKey) &&
            (keyCombo.altKey === undefined || keyCombo.altKey === event.altKey)) {
            action($sourceElement);
            handled = true;
        }
        return handled;
    };
    /**
     * Called after the dialog's window is shown.
     */
    DialogViewModel.prototype.onShow = function () {
        return;
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
exports.default = DialogViewModel;
