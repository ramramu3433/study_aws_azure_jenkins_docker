"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var Q = require("q");
var LogProvider = {
    "Log.log": function (args) { return console.log(args.message); },
    "Log.warn": function (args) { return console.warn(args.message); },
    "Log.error": function (args) { return console.error(args.message); },
    "Log.logWithDelay": function (args) {
        var deferred = Q.defer();
        setTimeout(function () {
            console.log(args.message);
            deferred.resolve();
        }, args.delay);
        return deferred.promise;
    }
};
module.exports = LogProvider;
