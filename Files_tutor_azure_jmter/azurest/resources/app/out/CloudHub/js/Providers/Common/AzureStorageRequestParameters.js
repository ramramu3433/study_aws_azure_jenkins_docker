/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Helper class to hold all parameters for a storage web request
     */
    var AzureStorageRequestParameters = (function () {
        function AzureStorageRequestParameters() {
            this.numberOfResults = null;
        }
        return AzureStorageRequestParameters;
    }());
    return AzureStorageRequestParameters;
});
