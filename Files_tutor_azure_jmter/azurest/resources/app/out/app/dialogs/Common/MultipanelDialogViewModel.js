"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
/**
 * Base view model for a dialog.
 */
var MultipanelDialogViewModel = (function () {
    function MultipanelDialogViewModel() {
        /**
         * The element ID of the current active panel.
         *
         * Setting this to a new value changes which panel is visible.
         */
        this.currentPanel = ko.observable("default-panel");
        /**
         * Contains the data gathered by the dialog.
         *
         * When set, the dialog automatically closes.
         *
         * If the dialog is ready to accept, `dialogResult` should be set with the return results.
         * If the dialog is ready to cancel. `dialogResult` should be set to null.
         */
        this.dialogResult = ko.observable(undefined);
    }
    /**
     * Collects the data gathered by the dialog before closing.
     *
     * @virtual
     */
    MultipanelDialogViewModel.prototype.getDialogResult = function () {
        return true;
    };
    /**
     * Called after the dialog's window is shown.
     */
    MultipanelDialogViewModel.prototype.onShow = function () {
        return;
    };
    return MultipanelDialogViewModel;
}());
exports.default = MultipanelDialogViewModel;
