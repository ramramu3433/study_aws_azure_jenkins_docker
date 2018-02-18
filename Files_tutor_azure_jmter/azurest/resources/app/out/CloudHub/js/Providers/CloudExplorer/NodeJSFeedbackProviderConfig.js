/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var NodeJSFeedbackProviderConfig = (function () {
        function NodeJSFeedbackProviderConfig() {
            this.namespace = "NodeJS.CloudExplorer.Feedback";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FeedbackProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "CloudExplorer.Actions.Feedback.sendASmile",
                "CloudExplorer.Actions.Feedback.sendAFrown"
            ];
        }
        return NodeJSFeedbackProviderConfig;
    }());
    return NodeJSFeedbackProviderConfig;
});
