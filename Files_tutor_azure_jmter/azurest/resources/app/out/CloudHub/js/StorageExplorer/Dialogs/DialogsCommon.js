/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug", "Common/Errors", "Common/Utilities"], function (require, exports, Debug, Errors, Utilities) {
    "use strict";
    function onError(host, error) {
        var message = Utilities.getErrorMessage(error);
        Debug.error(message);
        host.executeOperation("Environment.showMessageBox", ["Storage Explorer", message, "error"]);
    }
    exports.onError = onError;
    function showError(host, message, error) {
        var errorString = (typeof error === "string") ? error : JSON.stringify(error);
        var displayError = new Errors.DisplayableError(message + " " + errorString, error);
        onError(host, displayError);
    }
    exports.showError = showError;
});
