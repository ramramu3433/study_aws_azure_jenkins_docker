/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var FeedbackProviderConfig = (function () {
        function FeedbackProviderConfig() {
            this.namespace = "CloudExplorer.Feedback";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.CloudExplorer.FeedbackProvider"
            };
            this.exports = [
                "CloudExplorer.Actions.Feedback.sendASmile",
                "CloudExplorer.Actions.Feedback.sendAFrown"
            ];
        }
        return FeedbackProviderConfig;
    }());
    return FeedbackProviderConfig;
});
