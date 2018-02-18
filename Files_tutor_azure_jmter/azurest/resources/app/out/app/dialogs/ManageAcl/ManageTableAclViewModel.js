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
var ManageTableAccessControlListViewModel = (function (_super) {
    tslib_1.__extends(ManageTableAccessControlListViewModel, _super);
    function ManageTableAccessControlListViewModel(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.tableName = parameters.tableName;
        _this.initialize();
        return _this;
    }
    Object.defineProperty(ManageTableAccessControlListViewModel.prototype, "resourceType", {
        get: function () {
            return ResourceTypes_1.default.table;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageTableAccessControlListViewModel.prototype, "resourceName", {
        get: function () {
            return this.tableName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManageTableAccessControlListViewModel.prototype, "resourceLabel", {
        get: function () {
            return ManageTableAccessControlListViewModel.tableLabel;
        },
        enumerable: true,
        configurable: true
    });
    ManageTableAccessControlListViewModel.prototype.getAcl = function () {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Table.getAccessControlList", {
            connectionString: this.connectionString,
            tableName: this.resourceName
        });
    };
    ManageTableAccessControlListViewModel.prototype.setAcl = function (saps) {
        return DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Table.setAccessControlList", {
            connectionString: this.connectionString,
            tableName: this.resourceName,
            sharedAccessPolicies: saps
        });
    };
    return ManageTableAccessControlListViewModel;
}(ManageAclViewModel_1.default));
ManageTableAccessControlListViewModel.tableLabel = "Table:"; // Localize
exports.default = ManageTableAccessControlListViewModel;
