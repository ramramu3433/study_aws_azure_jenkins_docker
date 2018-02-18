/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "jquery", "Common/Debug", "Common/Utilities", "./KeyCodes"], function (require, exports, ko, $, Debug, Utilities, KeyCodes_1) {
    "use strict";
    /*
        A "popup" binding that enables popup behavior on an element. The purpose
        of this binding is to a) add the "popup" class on initialization, b)
        bind whether the "active" class is applied to the element to the value of
        the binding and c) when a click occurs on the document and the "active"
        class is currently applied to the element, remove it. Effectively, this
        means that if the popup is currently active (showing), clicking outside
        of the popup will deactivate (hide) it. This binding depends on click
        handlers not preventing propagation of the event up to the document.
    */
    ko.bindingHandlers.popup = {
        /*
            Initialization occurs once upon application of the binding.
        */
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // Add the popup class
            $(element).addClass("popup");
            // Listen to when a click event occurs on the document
            $(document).click(function () {
                // If the element has the "active" class, remove it, and
                // ensure that the bound value is changed back to false.
                var $element = $(element);
                if ($element.hasClass("click-activated")) {
                    $element.removeClass("click-activated");
                }
                else if ($element.hasClass("active")) {
                    $element.removeClass("active");
                    valueAccessor()(false);
                }
            });
        },
        /*
            Update occurs upon application of the binding and any time the
            observables visited by the valueAccessor() function call change.
        */
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // Get the current value of the binding
            var value = valueAccessor();
            // Delegate to the css binding implementation to
            // apply the value to the "active" CSS class.
            ko.bindingHandlers.css.update(element, function () { return { active: ko.unwrap(value) }; }, allBindingsAccessor, viewModel, bindingContext);
        }
    };
    var controlCodes;
    (function (controlCodes) {
        controlCodes[controlCodes["Ctrl"] = 1000] = "Ctrl";
        controlCodes[controlCodes["Shift"] = 2000] = "Shift";
        controlCodes[controlCodes["Alt"] = 3000] = "Alt";
    })(controlCodes || (controlCodes = {}));
    /**
     * Binding that executes an action when an arbitrary key is pressed.
     *
     * @example shortcut: { F5: runQuery, 'Shift+F5': stopQuery }
     *
     * NOTE: The key text (F5, etc.) can be anything in the KeyCodes enumeration (must match case),
     *   possibly prefixed with any of Ctrl+, Shift+ or Alt+ (note: Ctrl+ binds to Command key on Mac)
     */
    ko.bindingHandlers.shortcut = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // Interpret the key binding text
            var keyBindings = {};
            var bindingParameters = ko.unwrap(valueAccessor());
            for (var keyText in bindingParameters) {
                var fullKeyCode = 0;
                var func = bindingParameters[keyText]; // The function to call when the key is pressed
                keyText.split("+").forEach(function (key) {
                    var keyCode = KeyCodes_1.default[key] || 0;
                    var controlCode = controlCodes[key] || 0;
                    if (!keyCode && !controlCode) {
                        throw "shortcut binding: Could not find a KeyCode or ControlKeys enum matching " + key;
                    }
                    fullKeyCode += keyCode + controlCode;
                });
                keyBindings[fullKeyCode] = func;
            }
            // Listen to key presses
            $(element).keydown(function (event) {
                var keyCode = event.keyCode +
                    (event.altKey ? controlCodes.Alt : 0) +
                    ((Utilities.isMac() ? event.metaKey : event.ctrlKey) ? controlCodes.Ctrl : 0) +
                    (event.shiftKey ? controlCodes.Shift : 0);
                var toExecute = keyBindings[keyCode];
                if (toExecute) {
                    var result = toExecute.call(viewModel, [viewModel]);
                    if (result !== false) {
                        // Unless the function explicitly returned false, then prevent the default
                        event.preventDefault();
                    }
                }
            });
        }
    };
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
                require(["text!" + value], function (text) { return element.innerHTML = text; }, function (error) { return Debug.warn(error); });
            }
            else {
                Debug.warn("Knockout icon binding has no value.");
            }
        }
    };
    return ko;
});
