"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var ManageAclViewModel_1 = require("./ManageAclViewModel");
var ResourceTypes_1 = require("../GenerateSas/ResourceTypes");
/**
 * View model for the Manage Access Control List dialog
 */
var ManageQueueAccessControlListViewModel = (function (_super) {
    tslib_1.__extends(ManageQueueAccessControlListViewModel, _super);
    function ManageQueueAccessControlListViewModel(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.queueName = parameters.queueName;
        _this.initialize();
        return _this;
    }
    Object.defineProperty(ManageQueueAccessControlListViewModel.prototype, "resourceType", {
        get: function () {
            return ResourceTypes_1.default.queue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageQueueAccessControlListViewModel.prototype, "resourceName", {
        get: function () {
            return this.queueName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageQueueAccessControlListViewModel.prototype, "resourceLabel", {
        get: function () {
            return ManageQueueAccessControlListViewModel.queueLabel;
        },
        enumerable: true,
        configurable: true
    });
    ManageQueueAccessControlListViewModel.prototype.getAcl = function () {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Queue.getAccessControlList", {
            connectionString: this.connectionString,
            queueName: this.resourceName
        });
    };
    ManageQueueAccessControlListViewModel.prototype.setAcl = function (saps) {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Queue.setAccessControlList", {
            connectionString: this.connectionString,
            queueName: this.resourceName,
            sharedAccessPolicies: saps
        });
    };
    return ManageQueueAccessControlListViewModel;
}(ManageAclViewModel_1.default));
ManageQueueAccessControlListViewModel.queueLabel = "Queue:"; // Localize
exports.default = ManageQueueAccessControlListViewModel;
