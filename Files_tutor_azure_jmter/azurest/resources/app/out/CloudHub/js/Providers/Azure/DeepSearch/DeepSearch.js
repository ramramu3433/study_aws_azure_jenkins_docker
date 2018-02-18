/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/DeepSearch/StorageDeepSearchProvider"], function (require, exports, StorageDeepSearchProvider) {
    "use strict";
    var DeepSearch = (function () {
        function DeepSearch() {
        }
        /**
         * Given a raw search query, get the deep search provider that supports the query.
         * - The first provider (based on the order in the array above) that accepts the search query will be returned.
         *       Though each deep search provider should have a unique identifier to avoid such conflicts.
         * - If no such provider is found, we return null.
         */
        DeepSearch.getProvider = function (rawSearchQuery) {
            for (var i = 0; i < DeepSearch.providers.length; i++) {
                var prov = new DeepSearch.providers[i](rawSearchQuery);
                if (prov.isValid()) {
                    return prov;
                }
            }
            return null;
        };
        return DeepSearch;
    }());
    /**
     * The deep search providers currently in use.
     */
    DeepSearch.providers = [
        StorageDeepSearchProvider
    ];
    return DeepSearch;
});
