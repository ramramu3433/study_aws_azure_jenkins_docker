"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var nodeRequest = require("request");
var q = require("q");
;
/**
 * This is a wrapper of the request node module that returns a promise
 * and handles HTTP errors.
 */
function request(options) {
    return q.Promise(function (resolve, reject) {
        nodeRequest(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            if (response.statusCode >= 400) {
                return reject({
                    message: "HTTP ERROR " + response.statusCode + ": " + response.statusMessage,
                    response: response,
                    body: body
                });
            }
            resolve(body);
        });
    });
}
exports.request = request;
