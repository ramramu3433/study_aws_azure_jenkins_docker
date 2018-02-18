"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var request = require("request");
var Q = require("q");
module.exports = {
    "Request.get": function (args) {
        return Q.Promise(function (resolve, reject) {
            request.get(args.uri, function (error, response, body) {
                resolve({ error: error, response: response, body: body });
            });
        });
    }
};
