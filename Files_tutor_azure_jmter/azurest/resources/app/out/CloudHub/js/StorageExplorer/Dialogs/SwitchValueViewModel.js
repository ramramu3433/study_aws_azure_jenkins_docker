/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    /**
     * Represents a value shown to the user that can be switched on or off.
     * Used for presenting the user options, such as SAS permissions, that need
     * to be reduced to string parameters for Azure operations.
     */
    var SwitchValueViewModel = (function () {
        function SwitchValueViewModel(permission, label, isSelected, isDisabled) {
            if (isSelected === void 0) { isSelected = false; }
            if (isDisabled === void 0) { isDisabled = false; }
            this.value = permission;
            this.label = label;
            this.isSelected = ko.observable(isSelected);
            this.isDisabled = ko.observable(isDisabled);
        }
        return SwitchValueViewModel;
    }());
    return SwitchValueViewModel;
});
