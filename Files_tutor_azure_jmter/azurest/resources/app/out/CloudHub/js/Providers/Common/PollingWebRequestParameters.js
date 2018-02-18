/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * Helper class to hold all parameters for a polling web request
     */
    var PollingWebRequestParameters = (function () {
        function PollingWebRequestParameters() {
            this.timeOutInSeconds = 300;
        }
        return PollingWebRequestParameters;
    }());
    return PollingWebRequestParameters;
});
