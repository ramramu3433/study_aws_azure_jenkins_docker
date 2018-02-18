"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var EulaViewModel = (function (_super) {
    tslib_1.__extends(EulaViewModel, _super);
    function EulaViewModel() {
        var _this = _super.call(this) || this;
        _this.greetingText = "End-User License Agreement"; // Localize
        _this.addCustomButton(DialogViewModel_1.default.okKey, "I Accept", function () { return _this.dialogResult({ accept: true }); });
        _this.addCustomButton(DialogViewModel_1.default.cancelKey, "I Decline", function () { return _this.dialogResult({ accept: false }); });
        return _this;
    }
    return EulaViewModel;
}(DialogViewModel_1.default));
exports.default = EulaViewModel;
