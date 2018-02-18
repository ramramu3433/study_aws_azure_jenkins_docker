"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var daytona_1 = require("daytona");
var $ = require("jquery");
var ko = require("knockout");
var Path = require("path");
var underscore = require("underscore");
var constants = require("../../../Constants");
var utilities = require("../../../Utilities");
/**
 * A custom knockout binding that allows binding to a DaytonaPluginViewModel
 * @example
 * ```
 * <div class="content" data-bind="daytona: myPluginViewModel"></div>
 * ```
 */
function initializeDaytonaPlugin(element, options) {
    var manifestPath = ko.unwrap(options.manifestPath);
    var parameters = ko.unwrap(options.parameters);
    var marshalers = ko.unwrap(options.marshalers);
    var isDebug = utilities.isDebug();
    if (isDebug) {
        parameters = (parameters || {});
        parameters.debug = true;
    }
    // Initializing the plugin
    var plugin = new daytona_1.ElectronHost(element, Path.resolve(manifestPath), constants.themePath, parameters);
    options.daytonaHost = plugin;
    var marshalerNames = underscore.keys(marshalers);
    marshalerNames.forEach(function (m) {
        plugin.addMarshaler(m, marshalers[m]);
    });
    plugin.initialize()
        .then(function () {
        // Daytona first renders plugins using the default theme before the current theme has been swapped in.
        // The result is a brief flash of the default light theme when the plugin first renders.
        // This workaround hides the plugin for a moment to give Daytona time to finish swapping themes.
        // $element.fadeOut(0);
        // setTimeout(() => {
        //     var editorViewModel = <DaytonaEditorViewModel>options;
        //     if (!!editorViewModel.active && editorViewModel.active()) {
        //         $element.fadeIn(200);
        //     } else if (!editorViewModel.active) {
        //         $element.fadeIn(200);
        //     }
        // }, 500);
    });
    if (options.isClosing) {
        options.isClosing.subscribe(function (newValue) {
            if (newValue && plugin) {
                plugin.close();
            }
        });
    }
    if (options.isFocusable !== null) {
        options.isFocusable.subscribe(function (newValue) {
            var index = newValue ? "0" : "-1";
            $(element).find("iframe").attr("tabindex", index);
        });
    }
    $(element).data("plugin", plugin);
    options.initialize();
}
ko.bindingHandlers["daytona"] = {
    update: function (element, valueAccessor) {
        // Get the bound data
        var value;
        if (valueAccessor) {
            value = ko.unwrap(valueAccessor());
        }
        // Return if there is no bound data
        if (!value) {
            return;
        }
        var $element = $(element);
        var plugin = $element.data("plugin");
        // If there was a previous plugin already bound,
        // clean the element.
        if (plugin) {
            $element.html("");
            $element.removeData("plugin");
        }
        // Init new plugin
        initializeDaytonaPlugin(element, value);
    }
};
