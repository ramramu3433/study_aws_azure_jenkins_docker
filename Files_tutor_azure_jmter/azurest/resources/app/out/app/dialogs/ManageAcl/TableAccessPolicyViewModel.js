"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var AccessPolicyViewModel_1 = require("./AccessPolicyViewModel");
var ResourceTypes_1 = require("../GenerateSas/ResourceTypes");
var SwitchValueViewModel_1 = require("../Common/SwitchValueViewModel");
var _string = require("underscore.string");
var SasUtilities = require("../GenerateSas/SasUtilities");
var TableAccessPolicyViewModel = (function (_super) {
    tslib_1.__extends(TableAccessPolicyViewModel, _super);
    function TableAccessPolicyViewModel(manageAccessControlListViewModel, accessPolicy, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        var _this = _super.call(this, manageAccessControlListViewModel, accessPolicy, convertToLocalTime) || this;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", TableAccessPolicyViewModel.queryLabel),
            new SwitchValueViewModel_1.default("a", TableAccessPolicyViewModel.addLabel),
            new SwitchValueViewModel_1.default("u", TableAccessPolicyViewModel.updateLabel),
            new SwitchValueViewModel_1.default("d", TableAccessPolicyViewModel.deleteLabel)
        ]);
        _this.permissionViewModels().forEach(function (permission) {
            permission.isSelected(_string.contains(accessPolicy.AccessPolicy.Permissions, permission.value));
        });
        return _this;
    }
    TableAccessPolicyViewModel.prototype.getPermissionsString = function () {
        var permissionsArray = this.permissionViewModels()
            .filter(function (permission) { return permission.isSelected(); })
            .map(function (permission) { return permission.value; });
        return SasUtilities.getPermissionString(permissionsArray, ResourceTypes_1.default.table);
    };
    return TableAccessPolicyViewModel;
}(AccessPolicyViewModel_1.default));
/* Labels */
TableAccessPolicyViewModel.queryLabel = "Query"; // localize
TableAccessPolicyViewModel.addLabel = "Add"; // localize
TableAccessPolicyViewModel.updateLabel = "Update"; // localize
TableAccessPolicyViewModel.deleteLabel = "Delete"; // localize
exports.default = TableAccessPolicyViewModel;
