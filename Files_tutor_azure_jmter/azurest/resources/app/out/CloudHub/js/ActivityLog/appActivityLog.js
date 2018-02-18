/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
/// <reference path="../../Scripts/global.d.ts" />
// RequireJS configuration
require.config({
    baseUrl: "../../",
    paths: {
        "es6-promise": "lib/es6-promise/es6-promise",
        "jquery": "lib/jquery/dist/jquery",
        "knockout": "lib/knockout/dist/knockout",
        "underscore": "lib/underscore/underscore",
        "underscore.string": "lib/underscore.string/dist/underscore.string",
        "URIjs": "lib/uri.js/src",
        "ActivityLog": "js/ActivityLog",
        "CloudExplorer": "js/CloudExplorer",
        "Common": "js/Common",
        "Providers": "js/Providers"
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
        }
    }
});
/*
 * This is the main entry point of Cloud Explorer.
 * RequireJS will execute this function first.
 */
/* tslint:disable */
require(["jquery", "knockout", "ActivityLog/UI/ActivityLogViewModel"], function ($, ko, ActivityLogViewModel) {
    $(document).ready(function () {
        window.pluginReady(function () {
            // Initialize page binding to ActivityLogViewModel
            ko.applyBindings(new ActivityLogViewModel());
        });
    });
});
/* tslint:enable */
