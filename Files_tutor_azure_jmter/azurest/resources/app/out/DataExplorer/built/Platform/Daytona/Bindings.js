/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
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
        init: function (element, valueAccessor) {
            if (!!valueAccessor) {
                var value = valueAccessor();
                // Load the SVG via require text plugin.
                // Since the file hasn't been loaded yet, we have to do it asynchronously.
                require(["text!" + value], function (text) { return element.innerHTML = text; });
            }
            else {
            }
        }
    };
    return ko;
});
