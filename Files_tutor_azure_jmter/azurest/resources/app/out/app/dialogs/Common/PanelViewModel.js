"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DialogButtonViewModel_1 = require("./DialogButtonViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var $ = require("jquery");
var ko = require("knockout");
/**
 * Base view model for a dialog.
 */
var PanelViewModel = (function () {
    function PanelViewModel(dialogViewModel) {
        var _this = this;
        /**
         * The dialog panel's title
         */
        this.title = ko.observable();
        /**
         * The dialog panel's main buttons.
         */
        this.buttons = ko.observableArray();
        this.disableButtons = ko.observable(false);
        this.defaultCancel = function () { return _this.dialogViewModel.dialogResult(false); };
        this.defaultAccept = function () { return _this.dialogViewModel.dialogResult(_this.dialogViewModel.getDialogResult()); };
        this.dialogViewModel = dialogViewModel;
    }
    /**
     * Adds a dialog button that, when clicked, will close the dialog and return its results.
     */
    PanelViewModel.prototype.addAcceptButton = function (options) {
        this.addCustomButton(PanelViewModel.okKey, options.label || PanelViewModel.okCaption, options.action || this.defaultAccept, options);
    };
    /**
     * Adds a dialog button that, when clicked, will close the dialog with no results.
     */
    PanelViewModel.prototype.addCancelButton = function (options) {
        if (options === void 0) { options = {}; }
        this.addCustomButton(PanelViewModel.cancelKey, options.label || PanelViewModel.cancelCaption, options.action || this.defaultCancel, options);
    };
    /**
     * Adds a custom button dialog button.
     *
     * @param id An HTML ID to uniquely identify the button element.
     * @param label A label for the button.
     * @param action The action to perform when the button is clicked.
     * @param options Additional button configuration options.
     */
    PanelViewModel.prototype.addCustomButton = function (id, label, action, options) {
        if (options === void 0) { options = {}; }
        if (!ko.isObservable(label)) {
            label = ko.observable(label);
        }
        this.buttons.splice((options.index || this.buttons().length), 0, new DialogButtonViewModel_1.default(label, id, options.isEnabled || ko.observable(true), options.isFocused || ko.observable(false), options.isVisible || ko.observable(true), action));
    };
    PanelViewModel.prototype.hideAllButtons = function () {
        this.buttons().forEach(function (button) {
            button.isVisible(false);
        });
    };
    PanelViewModel.prototype.disableAllButtons = function () {
        this.disableButtons(true);
    };
    PanelViewModel.prototype.enableAllButtons = function () {
        this.disableButtons(false);
    };
    PanelViewModel.prototype.showError = function (message, error) {
        var message = message + (error.message || JSON.stringify(error, null, 2));
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
    PanelViewModel.prototype.onKey = function (event, keyCombo, action) {
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
    return PanelViewModel;
}());
PanelViewModel.cancelKey = "cancel";
PanelViewModel.okKey = "ok";
PanelViewModel.applyKey = "apply";
PanelViewModel.saveKey = "save";
PanelViewModel.closeKey = "close";
// Localize
PanelViewModel.okCaption = "OK";
PanelViewModel.cancelCaption = "Cancel";
PanelViewModel.applyCaption = "Apply";
PanelViewModel.saveCaption = "Save";
PanelViewModel.closeCaption = "Close";
exports.default = PanelViewModel;
