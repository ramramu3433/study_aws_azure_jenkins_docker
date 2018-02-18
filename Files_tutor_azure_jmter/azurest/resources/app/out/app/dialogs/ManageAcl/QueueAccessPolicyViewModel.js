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
var QueueAccessPolicyViewModel = (function (_super) {
    tslib_1.__extends(QueueAccessPolicyViewModel, _super);
    function QueueAccessPolicyViewModel(manageAccessControlListViewModel, accessPolicy, convertToLocalTime) {
        if (convertToLocalTime === void 0) { convertToLocalTime = false; }
        var _this = _super.call(this, manageAccessControlListViewModel, accessPolicy, convertToLocalTime) || this;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", QueueAccessPolicyViewModel.readLabel),
            new SwitchValueViewModel_1.default("a", QueueAccessPolicyViewModel.addLabel),
            new SwitchValueViewModel_1.default("u", QueueAccessPolicyViewModel.updateLabel),
            new SwitchValueViewModel_1.default("p", QueueAccessPolicyViewModel.processLabel)
        ]);
        _this.permissionViewModels().forEach(function (permission) {
            permission.isSelected(_string.contains(accessPolicy.AccessPolicy.Permissions, permission.value));
        });
        return _this;
    }
    QueueAccessPolicyViewModel.prototype.getPermissionsString = function () {
        var permissionsArray = this.permissionViewModels()
            .filter(function (permission) { return permission.isSelected(); })
            .map(function (permission) { return permission.value; });
        return SasUtilities.getPermissionString(permissionsArray, ResourceTypes_1.default.queue);
    };
    return QueueAccessPolicyViewModel;
}(AccessPolicyViewModel_1.default));
/* Labels */
QueueAccessPolicyViewModel.readLabel = "Read"; // localize
QueueAccessPolicyViewModel.addLabel = "Add"; // localize
QueueAccessPolicyViewModel.updateLabel = "Update"; // localize
QueueAccessPolicyViewModel.processLabel = "Process"; // localize
exports.default = QueueAccessPolicyViewModel;
