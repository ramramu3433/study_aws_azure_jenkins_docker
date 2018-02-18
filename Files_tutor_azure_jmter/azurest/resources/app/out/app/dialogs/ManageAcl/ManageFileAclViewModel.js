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
var ManageFileAclViewModel = (function (_super) {
    tslib_1.__extends(ManageFileAclViewModel, _super);
    function ManageFileAclViewModel(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.shareName = parameters.shareName;
        _this.initialize();
        return _this;
    }
    Object.defineProperty(ManageFileAclViewModel.prototype, "resourceType", {
        get: function () {
            return ResourceTypes_1.default.blob;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageFileAclViewModel.prototype, "resourceName", {
        get: function () {
            return this.shareName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageFileAclViewModel.prototype, "resourceLabel", {
        get: function () {
            return ManageFileAclViewModel.shareLabel;
        },
        enumerable: true,
        configurable: true
    });
    ManageFileAclViewModel.prototype.getAcl = function () {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.File.getContainerAccessControlList", {
            connectionString: this.connectionString,
            shareName: this.resourceName
        });
    };
    ManageFileAclViewModel.prototype.setAcl = function (saps) {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.File.setContainerAccessControlList", {
            connectionString: this.connectionString,
            shareName: this.resourceName,
            sharedAccessPolicies: saps
        });
    };
    return ManageFileAclViewModel;
}(ManageAclViewModel_1.default));
ManageFileAclViewModel.shareLabel = "Share:"; // Localize
exports.default = ManageFileAclViewModel;
