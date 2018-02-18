"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var httpRequest = require("../HttpRequest");
var UserAccountsManager_1 = require("../UserAccountsManager");
function webRequest(url, subscription, method, headers, body) {
    return UserAccountsManager_1.default.getInstance().getTenantToken(subscription.accountId, subscription.tenantId)
        .then(function (token) {
        headers = headers || {};
        headers["Content-Type"] = "application/json";
        headers["Authorization"] = "Bearer " + token;
        return httpRequest.request({
            method: method,
            url: url,
            headers: headers,
            body: body
        });
    });
}
exports.webRequest = webRequest;
