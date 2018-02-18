"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var url = require("url");
var ko = require("knockout");
/**
 * View model for the Proxy Settings dialog.
 */
var ProxySettingsViewModel = (function (_super) {
    tslib_1.__extends(ProxySettingsViewModel, _super);
    function ProxySettingsViewModel(proxySettings) {
        var _this = _super.call(this) || this;
        _this.titleLabel = "Proxy Settings"; // Localize
        _this.noProxyRadioLabel = "Do not use proxy"; // Localize
        _this.customProxyRadioLabel = "Use custom proxy settings"; // Localize
        _this.urlLabel = "URL:"; // Localize
        _this.portLabel = "Port:"; // Localize
        _this.useCredentialsLabel = "Use a username and password"; // Localize
        _this.usernameLabel = "Username:"; // Localize
        _this.passwordLabel = "Password:"; // Localize
        _this.isUrlValid = ko.pureComputed(function () { return !_this.isCustomProxyEnabled() || !!_this.url(); });
        _this.isPortValid = ko.pureComputed(function () {
            return !_this.isCustomProxyEnabled() || (!!_this.port() &&
                /^\d+$/g.test(_this.port().toString()) &&
                _this.port() >= 0 &&
                _this.port() <= 65535);
        });
        _this.isEnabled = ko.pureComputed(function () { return !_this.isCustomProxyEnabled() || (_this.isUrlValid() && _this.isPortValid()); });
        _this.proxySettingsOption = ko.observable(proxySettings.useProxy ? "customProxy" : "noProxy");
        _this.url = ko.observable(url.format({ protocol: proxySettings.protocol, hostname: proxySettings.hostname }));
        _this.port = ko.observable(proxySettings.port);
        _this.username = ko.observable(proxySettings.username || "");
        _this.password = ko.observable(proxySettings.password || "");
        _this.isCredentialsChecked = ko.observable(proxySettings.useCredentials);
        _this.isCustomProxyEnabled = ko.pureComputed(function () { return _this.proxySettingsOption() === "customProxy"; });
        _this.isCredentialsEnabled = ko.pureComputed(function () { return _this.isCustomProxyEnabled() && _this.isCredentialsChecked(); });
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isEnabled);
        _this.addCancelButton();
        return _this;
    }
    ProxySettingsViewModel.prototype.getResults = function () {
        var protocol = "";
        var hostname = "";
        if (this.url()) {
            var proxyUrl = url.parse(this.url());
            if (!proxyUrl.protocol && !proxyUrl.hostname) {
                proxyUrl = url.parse("http://" + this.url());
            }
            protocol = proxyUrl.protocol || "http:";
            hostname = proxyUrl.hostname;
        }
        return {
            protocol: protocol,
            hostname: hostname,
            port: this.port(),
            useProxy: this.proxySettingsOption() !== "noProxy",
            username: this.username(),
            password: this.password(),
            useCredentials: this.isCredentialsEnabled() && this.isCustomProxyEnabled()
        };
    };
    return ProxySettingsViewModel;
}(DialogViewModel_1.default));
exports.default = ProxySettingsViewModel;
