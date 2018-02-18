"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var utilities = require("../Utilities");
exports.externalAccountsFile = ".extaccounts";
exports.devAccountsFile = ".devaccounts";
var customAadProvidersKey = "Standalone_UserAccountsManager_CustomProviders_v1";
var AzureEnvironmentsManager = (function () {
    function AzureEnvironmentsManager(clientId) {
        this._clientId = "04b07795-8ddb-461a-bbee-02f9e1bf7b46";
        this._defaultAadProviderSettings = {
            "azure": {
                host: "https://login.microsoftonline.com",
                clientId: this._clientId,
                portalEndpoint: "https://portal.azure.com"
            },
            "mooncake": {
                clientId: this._clientId,
                host: "https://login.chinacloudapi.cn",
                signInResourceId: "https://management.core.chinacloudapi.cn/",
                graphResource: {
                    id: "https://graph.chinacloudapi.cn/",
                    endpoint: "https://graph.chinacloudapi.cn"
                },
                armResource: {
                    id: "https://management.core.chinacloudapi.cn/",
                    endpoint: "https://management.chinacloudapi.cn"
                },
                portalEndpoint: "https://portal.azure.cn/"
            },
            "blackforest": {
                clientId: this._clientId,
                host: "https://login.microsoftonline.de",
                signInResourceId: "https://management.core.cloudapi.de/",
                graphResource: {
                    id: "https://graph.cloudapi.de/",
                    endpoint: "https://graph.cloudapi.de"
                },
                armResource: {
                    id: "https://management.microsoftazure.de/",
                    endpoint: "https://management.microsoftazure.de"
                },
                portalEndpoint: "https://portal.microsoftazure.de"
            },
            "fairfax": {
                clientId: this._clientId,
                host: "https://login-us.microsoftonline.com",
                signInResourceId: "https://management.usgovcloudapi.net/",
                graphResource: {
                    id: "https://graph.windows.net/",
                    endpoint: "https://graph.windows.net"
                },
                armResource: {
                    id: "https://management.usgovcloudapi.net/",
                    endpoint: "https://management.usgovcloudapi.net"
                },
                portalEndpoint: "https://portal.azure.us"
            }
        };
        this._clientId = clientId;
        // call getAadProviderSettings() so we already have any non-compile time values cached
        this.getAadProviderSettings();
    }
    AzureEnvironmentsManager.prototype.getAadProviderSettings = function () {
        if (!this._aadProviderSettings) {
            /* tslint:disable */
            this._aadProviderSettings = _.extend(this._defaultAadProviderSettings, this._loadCustomAadProviderSettings());
            /* tslint:enable */
        }
        return this._aadProviderSettings;
    };
    ;
    AzureEnvironmentsManager.prototype.getNormalAadProviderSetings = function () {
        return this._defaultAadProviderSettings;
    };
    AzureEnvironmentsManager.prototype.getCustomAadProviderSettings = function () {
        return this._loadCustomAadProviderSettings();
    };
    AzureEnvironmentsManager.prototype.reloadProviderSettings = function () {
        this._aadProviderSettings = null;
        this._customProviderSettings = null;
        this.getAadProviderSettings();
    };
    AzureEnvironmentsManager.prototype.addCustomAadProvider = function (environmentName, provider) {
        this._customProviderSettings[environmentName] = provider;
        utilities.saveSettings(customAadProvidersKey, this._customProviderSettings);
    };
    AzureEnvironmentsManager.prototype.removeCustomAadProvider = function (environmentName) {
        delete this._customProviderSettings[environmentName];
        utilities.saveSettings(customAadProvidersKey, this._customProviderSettings);
    };
    AzureEnvironmentsManager.prototype.environmentIsNormalCloud = function (endpoint) {
        return _.some(_.keys(this._defaultAadProviderSettings), function (key) {
            return key === endpoint;
        });
    };
    AzureEnvironmentsManager.prototype._loadCustomAadProviderSettings = function () {
        if (!this._customProviderSettings) {
            var customAadProvidersSettings = utilities.loadSettings(customAadProvidersKey) || {};
            var customAAdProviders = {};
            for (var customEnvironment in customAadProvidersSettings) {
                customAAdProviders[customEnvironment] = customAadProvidersSettings[customEnvironment];
                customAAdProviders[customEnvironment].clientId = this._clientId;
                if (customAAdProviders[customEnvironment].portalEndpoint == null) {
                    customAAdProviders[customEnvironment].portalEndpoint = this._determineCustomEnvironmentPortalEndpoint(customAadProvidersSettings[customEnvironment]);
                }
            }
            this._customProviderSettings = customAAdProviders;
        }
        return this._customProviderSettings;
    };
    AzureEnvironmentsManager.prototype._determineCustomEnvironmentPortalEndpoint = function (settings) {
        var armEndpoint = settings.armResource.endpoint.toLowerCase();
        if (armEndpoint.indexOf("azurestack") >= 0) {
            // is an Azure Stack environment
            if (armEndpoint.indexOf("adminmanagement") >= 0) {
                // is an admin environment
                var adminSplit = armEndpoint.split("adminmanagement");
                return adminSplit[0] + "adminportal" + adminSplit[1];
            }
            else {
                // is a tenant environment
                var tenantSplit = armEndpoint.split("management");
                return tenantSplit[0] + "portal" + tenantSplit[1];
            }
        }
        else {
            // next best guess would be if the portal of a normal environments that shares the same management endpoint
            for (var environment in this._defaultAadProviderSettings) {
                var environmentSettings = this._defaultAadProviderSettings[environment];
                if (!!environmentSettings.armResource && environmentSettings.armResource.endpoint === armEndpoint && !!environmentSettings.portalEndpoint) {
                    return environmentSettings.portalEndpoint;
                }
            }
        }
        // we don't know
        return null;
    };
    return AzureEnvironmentsManager;
}());
exports.default = AzureEnvironmentsManager;
