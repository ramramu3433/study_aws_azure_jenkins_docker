/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
// Daytona global reference Dev12 back-compat fix
if (typeof Microsoft === "undefined") {
    window.Microsoft = { Plugin: Plugin };
}
else if (!Microsoft.Plugin) {
    window.Microsoft.Plugin = Plugin;
}
if (Microsoft.Plugin) {
    // Daytona fatal error handling
    window.onerror = function (errorMsg, url, lineNumber) {
        // Prevent the browser to show an error message.
        return true;
    };
    // Attach to Daytona's pluginready event at a global level
    // so we can notify it at the right time.
    window.pluginReady = (function () {
        var pluginReady = false;
        var pluginReadyEventName = "pluginready";
        function onPluginReady() {
            Microsoft.Plugin.removeEventListener(pluginReadyEventName, onPluginReady);
            pluginReady = true;
        }
        ;
        Microsoft.Plugin.addEventListener(pluginReadyEventName, onPluginReady);
        return function (callback) {
            if (!pluginReady) {
                var callbackWrapper = function () {
                    Microsoft.Plugin.removeEventListener(pluginReadyEventName, callbackWrapper);
                    callback();
                };
                Microsoft.Plugin.addEventListener(pluginReadyEventName, callbackWrapper);
            }
            else {
                callback();
            }
        };
    }());
}
// RequireJS configuration
window.require = {
    baseUrl: "../../../",
    paths: {
        "es6-promise": "lib/es6-promise/es6-promise",
        "datatables": "lib/datatables/media/js/jquery.dataTables",
        "datatables-colReorder": "lib/datatables-colreorder/js/dataTables.colReorder",
        "datatables-colResize": "lib/datatables-colresize/dataTables.colResize",
        "jquery": "lib/jquery/dist/jquery",
        "jquery-contextMenu": "lib/jQuery-contextMenu/src/jquery.contextMenu",
        "knockout": "lib/knockout/dist/knockout",
        "knockout.mapping": "lib/knockout-mapping/knockout.mapping",
        "text": "lib/text/text",
        "underscore": "lib/underscore/underscore",
        "underscore.string": "lib/underscore.string/dist/underscore.string",
        "URIjs": "lib/uri.js/src",
        "ActivityLog": "js/ActivityLog",
        "Azure": "js/Azure",
        "CloudExplorer": "js/CloudExplorer",
        "Common": "js/Common",
        "images": "images",
        "Providers": "js/Providers",
        "StorageExplorer": "js/StorageExplorer"
    },
    shim: {
        jquery: {
            exports: "$"
        },
        knockout: {
            deps: ["jquery"],
            exports: "ko"
        },
        "knockout.mapping": {
            deps: ["jquery", "knockout"],
            exports: "mapping"
        },
        "datatables": {
            deps: ["jquery"]
        },
        "jquery-contextMenu": {
            deps: ["jquery"]
        }
    }
};
