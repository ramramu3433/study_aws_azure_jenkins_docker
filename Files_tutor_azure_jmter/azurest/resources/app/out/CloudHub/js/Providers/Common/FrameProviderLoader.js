/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
/// <reference path="../../../Scripts/global.d.ts" />
// TODO: Convert this file code in to TypeScript.
// TODO: Create a TSLINT for checking if require imports
// are ordered. i.e: All require("Providers/Azure/*") together.
// RequireJS Configuration
// IMPORTANT: 'baseUrl' is calculated from index.html
require.config({
    baseUrl: "../../",
    paths: {
        "base64": "lib/base64/base64",
        "es6-promise": "lib/es6-promise/es6-promise",
        "jquery": "lib/jquery/dist/jquery",
        "knockout": "lib/knockout/dist/knockout",
        "underscore": "lib/underscore/underscore",
        "underscore.string": "lib/underscore.string/dist/underscore.string",
        "URIjs": "lib/uri.js/src",
        "ActivityLog": "js/ActivityLog",
        "CloudExplorer": "js/CloudExplorer",
        "Common": "js/Common",
        "Providers": "js/Providers",
        "StorageExplorer": "js/StorageExplorer"
    },
    shim: {
        jquery: {
            exports: "$"
        }
    }
});
/**
 * This is the main entry point of the plugin.
 * RequireJS will execute this function first.
 */
/* tslint:disable */
require([], function () {
    // Gets the value of requirePath from url.
    var requirePath = location.search.split("requirePath=")[1].split("&")[0];
    // Converts %2 to slashes
    var decodedPath = decodeURIComponent(requirePath);
    require([decodedPath], function (Plugin) {
        var plugin = new Plugin();
        plugin.initialize();
    });
});
/* tslint:enable */
