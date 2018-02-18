"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
/**
 * View model for connect file share dialog
 */
var ConnectFileShareDialogViewModel = (function (_super) {
    tslib_1.__extends(ConnectFileShareDialogViewModel, _super);
    function ConnectFileShareDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.titleLabel = "Connect File Share to VM"; // localize
        _this.commandText = parameters.commandToConnect;
        _this.addCancelButton(DialogViewModel_1.default.closeCaption);
        return _this;
    }
    return ConnectFileShareDialogViewModel;
}(DialogViewModel_1.default));
exports.default = ConnectFileShareDialogViewModel;
