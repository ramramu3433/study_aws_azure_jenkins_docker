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
var BlobAccessPolicyViewModel = (function (_super) {
    tslib_1.__extends(BlobAccessPolicyViewModel, _super);
    function BlobAccessPolicyViewModel(manageAccessControlListViewModel, accessPolicy, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        var _this = _super.call(this, manageAccessControlListViewModel, accessPolicy, convertToLocalTime) || this;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", BlobAccessPolicyViewModel.readLabel),
            new SwitchValueViewModel_1.default("w", BlobAccessPolicyViewModel.writeLabel),
            new SwitchValueViewModel_1.default("d", BlobAccessPolicyViewModel.deleteLabel),
            new SwitchValueViewModel_1.default("l", BlobAccessPolicyViewModel.listLabel)
        ]);
        _this.permissionViewModels().forEach(function (permission) {
            permission.isSelected(_string.contains(accessPolicy.AccessPolicy.Permissions, permission.value));
        });
        return _this;
    }
    BlobAccessPolicyViewModel.prototype.getPermissionsString = function () {
        var permissionsArray = this.permissionViewModels()
            .filter(function (permission) { return permission.isSelected(); })
            .map(function (permission) { return permission.value; });
        return SasUtilities.getPermissionString(permissionsArray, ResourceTypes_1.default.blob);
    };
    return BlobAccessPolicyViewModel;
}(AccessPolicyViewModel_1.default));
/* Labels */
BlobAccessPolicyViewModel.readLabel = "Read"; // localize
BlobAccessPolicyViewModel.writeLabel = "Write"; // localize
BlobAccessPolicyViewModel.deleteLabel = "Delete"; // localize
BlobAccessPolicyViewModel.listLabel = "List"; // localize
exports.default = BlobAccessPolicyViewModel;
