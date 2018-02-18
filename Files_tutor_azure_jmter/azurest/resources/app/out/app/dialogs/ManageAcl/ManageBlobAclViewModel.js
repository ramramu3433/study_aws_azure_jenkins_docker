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
var ManageBlobAclViewModel = (function (_super) {
    tslib_1.__extends(ManageBlobAclViewModel, _super);
    function ManageBlobAclViewModel(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.containerName = parameters.containerName;
        _this.initialize();
        return _this;
    }
    Object.defineProperty(ManageBlobAclViewModel.prototype, "resourceType", {
        get: function () {
            return ResourceTypes_1.default.blob;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageBlobAclViewModel.prototype, "resourceName", {
        get: function () {
            return this.containerName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageBlobAclViewModel.prototype, "resourceLabel", {
        get: function () {
            return ManageBlobAclViewModel.containerLabel;
        },
        enumerable: true,
        configurable: true
    });
    ManageBlobAclViewModel.prototype.getAcl = function () {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Blob.getContainerAccessControlList", {
            connectionString: this.connectionString,
            containerName: this.resourceName
        });
    };
    ManageBlobAclViewModel.prototype.setAcl = function (saps) {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Blob.setContainerAccessControlList", {
            connectionString: this.connectionString,
            containerName: this.resourceName,
            sharedAccessPolicies: saps
        });
    };
    return ManageBlobAclViewModel;
}(ManageAclViewModel_1.default));
ManageBlobAclViewModel.containerLabel = "Container:"; // Localize
exports.default = ManageBlobAclViewModel;
