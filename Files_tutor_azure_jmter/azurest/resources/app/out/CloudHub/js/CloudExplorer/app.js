/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
/// <reference path="../../Scripts/global.d.ts" />
// TODO: Convert this file code in to TypeScript.
// RequireJS configuration
require.config({
    baseUrl: "../../",
    paths: {
        "ccs": "internal/ccs/ccs-0.1.0",
        "es6-promise": "lib/es6-promise/es6-promise",
        "jquery": "lib/jquery/dist/jquery",
        "knockout": "lib/knockout/dist/knockout",
        "knockout.mapping": "lib/knockout-mapping/knockout.mapping",
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
require(["jquery", "knockout", "CloudExplorer/UI/CloudExplorerViewModel", "CloudExplorer/UI/KnockoutBindings"], function ($, ko, CloudExplorerViewModel) {
    $(document).ready(function () {
        window.pluginReady(function () {
            // Initialize page binding to CloudExplorerViewModel
            ko.applyBindings(new CloudExplorerViewModel());
        });
    });
});
/* tslint:enable */
