/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToolbarViewModel = (function () {
        function ToolbarViewModel() {
            this.ToolbarItems = [
                {
                    type: "action",
                    title: "title",
                    displayName: "save",
                    id: "id",
                    enabled: ko.observable(true),
                    visible: ko.observable(true),
                    icon: "images/save.svg",
                    mouseDown: function (data, event) { return; },
                    keyUp: function (data, event) { return; },
                    keyDown: function (data, event) { return; }
                }
            ];
        }
        return ToolbarViewModel;
    }());
    exports.default = ToolbarViewModel;
});
