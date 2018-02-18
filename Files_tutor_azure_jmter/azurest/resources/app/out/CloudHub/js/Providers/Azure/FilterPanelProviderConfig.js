/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var FilterPanelProviderConfig = (function () {
        function FilterPanelProviderConfig() {
            this.namespace = "Azure.FilterPanel";
            this.exports = [
                "Azure.UserAccounts.AccountsChanged"
            ];
        }
        return FilterPanelProviderConfig;
    }());
    return FilterPanelProviderConfig;
});
