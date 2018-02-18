/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    /**
     * Base implementation for parsing deep search.
     */
    var DeepSearchProvider = (function () {
        function DeepSearchProvider(query) {
            var _this = this;
            this.isValid = function () {
                return _this.valid;
            };
            this.rawQuery = query;
        }
        return DeepSearchProvider;
    }());
    /**
     * Separator to split the parts of the search query.
     */
    DeepSearchProvider.separator = "/";
    return DeepSearchProvider;
});
