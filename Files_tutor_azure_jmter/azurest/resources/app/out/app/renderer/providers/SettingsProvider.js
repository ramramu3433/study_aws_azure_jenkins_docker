"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ProxySettingsManager_1 = require("../common/ProxySettingsManager");
module.exports = {
    "Environment.Settings.Proxy.getProxySettings": function (args) {
        return ProxySettingsManager_1.default.loadProxySettings();
    },
    "Environment.Settings.Proxy.saveProxySettings": function (args) {
        return ProxySettingsManager_1.default.saveProxySettings(args.proxySettings);
    },
    "Environment.Settings.Proxy.setProxySettings": function (args) {
        return ProxySettingsManager_1.default.setProxySettings(args.proxySettings);
    }
};
