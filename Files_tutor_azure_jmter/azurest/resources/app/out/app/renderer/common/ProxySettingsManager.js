"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var request = require("request");
var q = require("q");
var url = require("url");
var proxySettingsKey = {
    service: "StorageExplorer_ProxySettingsKey_v1",
    account: "local"
};
var ProxySettingsManager = (function () {
    function ProxySettingsManager() {
    }
    /**
     * Sets environment proxy settings.
     */
    ProxySettingsManager.prototype.setProxySettings = function (proxySettings) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var proxyUrl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!proxySettings.useProxy) return [3 /*break*/, 2];
                        proxyUrl = proxySettings.useCredentials ?
                            url.format({
                                protocol: proxySettings.protocol,
                                auth: proxySettings.username + ":" + proxySettings.password,
                                hostname: proxySettings.hostname,
                                port: proxySettings.port.toString()
                            }) :
                            url.format({
                                protocol: proxySettings.protocol,
                                hostname: proxySettings.hostname,
                                port: proxySettings.port.toString()
                            });
                        process.env.HTTP_PROXY = proxyUrl;
                        process.env.HTTPS_PROXY = proxyUrl;
                        return [4 /*yield*/, this.testProxyConnection()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        delete process.env.HTTP_PROXY;
                        delete process.env.HTTPS_PROXY;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Saves the specified proxy settings to local storage.
     */
    ProxySettingsManager.prototype.saveProxySettings = function (proxySettings) {
        var safeSettings = {
            protocol: proxySettings.protocol,
            hostname: proxySettings.hostname,
            port: proxySettings.port,
            useProxy: proxySettings.useProxy,
            useCredentials: proxySettings.useCredentials
        };
        localStorage.setItem(proxySettingsKey.service, JSON.stringify(safeSettings));
        var confidentialSettings = {
            username: proxySettings.username,
            password: proxySettings.password
        };
        // Inline require LocalStorageHelper to avoid circular dependency problems.
        require("./LocalStorageHelper").saveConfidentialData(proxySettingsKey, JSON.stringify(confidentialSettings));
        return q.resolve(null);
    };
    /**
     * Loads proxy settings previously saved to local storage, if available.
     */
    ProxySettingsManager.prototype.loadProxySettings = function () {
        // Inline require LocalStorageHelper to avoid circular dependency problems.
        return require("./LocalStorageHelper").getConfidentialData(proxySettingsKey)
            .then(function (confidentialData) {
            var requiredData = localStorage.getItem(proxySettingsKey.service);
            var requiredSettings = requiredData ? JSON.parse(requiredData) : null;
            var confidentialSettings = confidentialData ? JSON.parse(confidentialData) : null;
            var result = {
                protocol: null,
                hostname: null,
                port: null,
                useProxy: false,
                username: null,
                password: null,
                useCredentials: false
            };
            if (requiredSettings) {
                result.protocol = requiredSettings.protocol;
                result.hostname = requiredSettings.hostname;
                result.port = requiredSettings.port;
                result.useProxy = requiredSettings.useProxy;
                result.useCredentials = requiredSettings.useCredentials;
            }
            if (confidentialSettings) {
                result.username = confidentialSettings.username;
                result.password = confidentialSettings.password;
            }
            return result;
        });
    };
    ProxySettingsManager.prototype.testProxyConnection = function () {
        return q.Promise(function (resolve, reject) {
            var options = { url: "https://management.azure.com/subscriptions" };
            return request(options, function (error) {
                if (error) {
                    // If the proxy settings are bad, we won't get a reponse from the server.
                    // Localize
                    reject(new Error("Unable to establish connection using current proxy settings. Please verify current settings by accessing the proxy dialog in the toolbar."));
                }
                else {
                    // If we got a response, regardless of the status code, that means the proxy settings work.
                    resolve(null);
                }
            });
        });
    };
    return ProxySettingsManager;
}());
var instance = new ProxySettingsManager();
exports.default = instance;
