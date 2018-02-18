"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var HttpRequest = require("../HttpRequest");
var UserAccountsManager_1 = require("../UserAccountsManager");
var userAccountsManager = UserAccountsManager_1.default.getInstance();
function getAccountSubscriptions(account) {
    return userAccountsManager.getUserAccountTenants(account.id)
        .then(function (tenants) {
        return userAccountsManager.getArmEndpoint(account)
            .then(function (armEndpoint) {
            var promises = [];
            tenants.forEach(function (tenant) {
                var promise = HttpRequest.request({
                    url: armEndpoint + "/subscriptions?api-version=2015-01-01",
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + tenant.token
                    }
                }).then(function (body) {
                    var parsedBody = JSON.parse(body);
                    var returnedSubscriptions = parsedBody.value || [];
                    var subscriptions = [];
                    returnedSubscriptions.forEach(function (s) {
                        subscriptions.push({
                            id: s.subscriptionId,
                            accountId: account.id,
                            tenantId: tenant.id,
                            name: s.displayName,
                            managementEndpoint: armEndpoint,
                            coreEndpoint: account.coreEndpoint,
                            // This information below added manually to the subscription
                            // assumes we don't support any other cloud than Azure.com.
                            // TODO: we support clouds other than public Azure now, so we should be
                            // setting isIsolatedCloud and isAzureStackSubscription values correctly.
                            // They aren't used for anything at the moment though, so leave alone for now
                            // until we have time to make changes and make sure we aren't breaking anything.
                            isIsolatedCloud: false,
                            isAzureStackSubscription: false,
                            portalEndpoint: account.portalEndpoint || "https://portal.azure.com",
                            cloudName: "management.azure.com"
                        });
                    });
                    return subscriptions;
                });
                promises.push(promise);
            });
            return Q.all(promises)
                .then(function (value) {
                return [].concat.apply([], value);
            });
        });
    });
}
exports.getAccountSubscriptions = getAccountSubscriptions;
function getAllSubscriptions(ignoreErrors) {
    if (ignoreErrors === void 0) { ignoreErrors = false; }
    return userAccountsManager.getUserAccounts()
        .then(function (userAccounts) {
        var promises = [];
        userAccounts.forEach(function (account) {
            // We want to list all the subscriptions, if there are errors for an account, return empty subscriptions for it.
            var getSubscriptionsPromise = getAccountSubscriptions(account);
            if (ignoreErrors) {
                getSubscriptionsPromise = getSubscriptionsPromise.catch(function (_) { return []; });
            }
            promises.push(getSubscriptionsPromise);
        });
        return Q.all(promises).then(function (value) {
            return [].concat.apply([], value);
        }, function (error) {
            return [];
        });
    });
}
exports.getAllSubscriptions = getAllSubscriptions;
