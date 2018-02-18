"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ko = require("knockout");
/**
 * The icon binding associates an element with an SVG image defined in a separate file.
 * Ideally, we want our HTML, CSS, and SVG defined in separate files.
 * Dynamic styling, such as for theming, however, is not well supported for
 * CSS and SVG defined in separate files
 *
 * This binding overcomes the limitations of styling imported SVGs by setting the inner
 * HTML of the bound element with the contents of the file specified in the binding.
 */
ko.bindingHandlers.icon = {
    update: function (element, valueAccessor) {
        if (!!valueAccessor) {
            try {
                var value = require.resolve(valueAccessor());
                console.log("Resolved path: '" + value + "'");
                element.innerHTML = fs_1.readFileSync(value, "utf8");
            }
            catch (error) {
                console.error(error);
            }
        }
        else {
            console.warn("Knockout icon binding has no value.");
        }
    }
};
