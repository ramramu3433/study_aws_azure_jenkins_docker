/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Providers/CloudExplorer/ProviderWrappers/EnvironmentPW", "Common/ConnectionString"], function (require, exports, es6_promise_1, EnvironmentPW, ConnectionString_1) {
    "use strict";
    var BaseContainerActions = (function () {
        function BaseContainerActions(host) {
            this._host = host;
        }
        BaseContainerActions.prototype._canCopyContainerProperties = function (sourceConnectionString) {
            var connectionString = new ConnectionString_1.default(sourceConnectionString);
            // We can't get container properties if it's a service-level SAS
            return !connectionString.containsServiceSAS();
        };
        BaseContainerActions.prototype._confirmCopyContainerProperties = function (copyContainerProperties) {
            // Let the user know if we aren't able to copy container properties and metadata
            if (copyContainerProperties) {
                return es6_promise_1.Promise.resolve(true);
            }
            // Localize
            var prompt = "The properties and metadata for this container cannot be determined and will not be copied to the new container. Proceed with the copy?";
            return EnvironmentPW.promptYesNo(this._host, prompt, EnvironmentPW.IconType.warning);
        };
        return BaseContainerActions;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseContainerActions;
});
