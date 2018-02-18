"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var $ = require("jquery");
var Utilities = require("../../../Utilities");
var controlCodes;
(function (controlCodes) {
    controlCodes[controlCodes["Ctrl"] = 1000] = "Ctrl";
    controlCodes[controlCodes["Shift"] = 2000] = "Shift";
    controlCodes[controlCodes["Alt"] = 3000] = "Alt";
    controlCodes[controlCodes["Windows"] = 4000] = "Windows";
})(controlCodes || (controlCodes = {}));
ko.bindingHandlers.accessibility = {
    init: function (element, configAccessor) {
        var config;
        if (configAccessor) {
            config = configAccessor();
        }
        if (!!config) {
            if (!!config.enter || !!config.escape) {
                var $element = $(element);
                $element.keydown(function (event) {
                    var keyHandler = null;
                    // We don't want ALT+Enter to be the same as Enter, etc., so include modifier codes
                    var modifier = (event.altKey ? controlCodes.Alt : 0) +
                        ((Utilities.isOSX() ? event.metaKey : event.ctrlKey) ? controlCodes.Ctrl : 0) +
                        (event.shiftKey ? controlCodes.Shift : 0) +
                        ((Utilities.isWin() && event.metaKey) ? controlCodes.Windows : 0);
                    if (event.key === "Enter" && !modifier) {
                        keyHandler = config.enter;
                    }
                    else if (event.key === "Escape" && !modifier) {
                        keyHandler = config.escape;
                    }
                    if (!!keyHandler) {
                        keyHandler();
                        event.preventDefault();
                        return false;
                    }
                    else {
                        // Allow default browser handling
                        return true;
                    }
                });
            }
        }
        else {
            console.warn("Knockout accessibility binding has no value.");
        }
    }
};
