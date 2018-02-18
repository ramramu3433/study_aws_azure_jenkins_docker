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
var FileAccessPolicyViewModel = (function (_super) {
    tslib_1.__extends(FileAccessPolicyViewModel, _super);
    function FileAccessPolicyViewModel(manageAccessControlListViewModel, accessPolicy, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        var _this = _super.call(this, manageAccessControlListViewModel, accessPolicy, convertToLocalTime) || this;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", FileAccessPolicyViewModel.readLabel),
            new SwitchValueViewModel_1.default("w", FileAccessPolicyViewModel.writeLabel),
            new SwitchValueViewModel_1.default("d", FileAccessPolicyViewModel.deleteLabel),
            new SwitchValueViewModel_1.default("l", FileAccessPolicyViewModel.listLabel)
        ]);
        _this.permissionViewModels().forEach(function (permission) {
            permission.isSelected(_string.contains(accessPolicy.AccessPolicy.Permissions, permission.value));
        });
        return _this;
    }
    FileAccessPolicyViewModel.prototype.getPermissionsString = function () {
        var permissionsArray = this.permissionViewModels()
            .filter(function (permission) { return permission.isSelected(); })
            .map(function (permission) { return permission.value; });
        return SasUtilities.getPermissionString(permissionsArray, ResourceTypes_1.default.file);
    };
    return FileAccessPolicyViewModel;
}(AccessPolicyViewModel_1.default));
/* Labels */
FileAccessPolicyViewModel.readLabel = "Read"; // localize
FileAccessPolicyViewModel.writeLabel = "Write"; // localize
FileAccessPolicyViewModel.deleteLabel = "Delete"; // localize
FileAccessPolicyViewModel.listLabel = "List"; // localize
exports.default = FileAccessPolicyViewModel;
