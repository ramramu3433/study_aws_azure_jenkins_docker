/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URI", "Common/AzureEnvironment", "StorageExplorer/Settings/SettingsManager"], function (require, exports, URL, AzureEnvironment_1, SettingsManager_1) {
    "use strict";
    /**
     * Manages any user defined custom environments, and making sure that the host's view
     * of environments is up to date.
     */
    var CustomEnvironmentsManager = (function () {
        function CustomEnvironmentsManager(host, telemetryActions) {
            this._host = host;
            this._telemetryActions = telemetryActions;
            // TODO: pass in the settings manager, better for testing
            this._settingsManager = new SettingsManager_1.default(null, 1 /* localStorage */);
        }
        /**
         * Gets all currently configured and saved custom azure environments.
         */
        CustomEnvironmentsManager.prototype.getCustomEnvironments = function () {
            var customAadProviders = this._settingsManager.loadSettings(CustomEnvironmentsManager.customAadProvidersKey);
            var customEnvironments = [];
            for (var customProviderEnvironment in customAadProviders) {
                customEnvironments.push(AzureEnvironment_1.default.createFromExisting(customProviderEnvironment, customAadProviders[customProviderEnvironment]));
            }
            customEnvironments.sort(function (optionA, optionB) { return optionA === optionB ? 0 : (optionA.getEnvironmentName() < optionB.getEnvironmentName()) ? -1 : 1; });
            return customEnvironments;
        };
        CustomEnvironmentsManager.prototype.isCustomEnvironmentExist = function (name) {
            var envs = this.getCustomEnvironments();
            return envs.filter(function (env) { return env.environmentName === name; }).length > 0;
        };
        /**
         * Saves the given environment to settings, and then reloads the user accounts manager on the back end.
         */
        CustomEnvironmentsManager.prototype.saveCustomEnvironment = function (environmentToSave) {
            // make sure any endpoints are actually urls
            var config = environmentToSave.getConfiguration();
            config.host = this.makeSureIsAUrl(config.host);
            config.graphResource.endpoint = this.makeSureIsAUrl(config.graphResource.endpoint);
            config.armResource.endpoint = this.makeSureIsAUrl(config.armResource.endpoint);
            var customAadProviders = this._settingsManager.loadSettings(CustomEnvironmentsManager.customAadProvidersKey);
            if (!customAadProviders) {
                customAadProviders = {};
            }
            customAadProviders[environmentToSave.getEnvironmentName()] = environmentToSave.getConfiguration();
            this._settingsManager.saveSettings(customAadProviders, CustomEnvironmentsManager.customAadProvidersKey);
            return this._host.executeOperation("Azure.UserAccounts.reloadUserAccountManager");
        };
        CustomEnvironmentsManager.prototype.makeSureIsAUrl = function (str) {
            var url = URL(str);
            if (!url.protocol() && !url.hostname()) {
                return "https://" + str;
            }
            else {
                return str;
            }
        };
        /**
         * Removes the given environment from settings. Does not reload the user accounts manager on the back end as there is no need to.
         */
        CustomEnvironmentsManager.prototype.removeCustomEnvironment = function (environmentToDelete) {
            var customAadProviders = this._settingsManager.loadSettings(CustomEnvironmentsManager.customAadProvidersKey);
            var postDeleteResult = {};
            for (var customProviderEnvironment in customAadProviders) {
                if (customProviderEnvironment !== environmentToDelete.getEnvironmentName()) {
                    postDeleteResult[customProviderEnvironment] = customAadProviders[customProviderEnvironment];
                }
            }
            this._settingsManager.saveSettings(postDeleteResult, CustomEnvironmentsManager.customAadProvidersKey);
            return this._host.executeOperation("Azure.UserAccounts.removeCustomAadProvider", [{ environment: environmentToDelete.getEnvironmentName() }]);
        };
        return CustomEnvironmentsManager;
    }());
    CustomEnvironmentsManager.customAadProvidersKey = "Standalone_UserAccountsManager_CustomProviders_v1";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CustomEnvironmentsManager;
});
