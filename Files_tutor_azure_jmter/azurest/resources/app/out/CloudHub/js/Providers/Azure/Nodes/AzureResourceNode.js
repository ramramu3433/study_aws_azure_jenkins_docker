/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    /**
     * This classs represents an Azure Resource Node to be shown in
     * a Cloud Explorer tree view.
     */
    var AzureResourceNode = (function () {
        function AzureResourceNode() {
            this.actions = [];
            this.attributes = [];
            this.properties = [];
            this.loaders = [];
        }
        return AzureResourceNode;
    }());
    return AzureResourceNode;
});
