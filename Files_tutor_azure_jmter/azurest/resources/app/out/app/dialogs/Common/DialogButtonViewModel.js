"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DialogButtonViewModel = (function () {
    function DialogButtonViewModel(caption, key, isEnabled, isFocused, isVisible, onClick) {
        this.caption = caption;
        this.key = key;
        this.isEnabled = isEnabled;
        this.isFocused = isFocused;
        this.isVisible = isVisible;
        this.onClick = onClick;
    }
    return DialogButtonViewModel;
}());
exports.default = DialogButtonViewModel;
