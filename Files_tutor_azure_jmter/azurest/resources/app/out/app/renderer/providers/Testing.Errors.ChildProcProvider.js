"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var fs = require("fs");
var q = require("q");
module.exports = {
    "Testing.Errors.ChildProc.throwPrimitive": function (args) {
        return q.reject(false);
    },
    "Testing.Errors.ChildProc.throwString": function (args) {
        return q.reject("This exception is a string.");
    },
    "Testing.Errors.ChildProc.throwObject": function (args) {
        return q.reject({ n: "Object", m: "This exception is an object." });
    },
    "Testing.Errors.ChildProc.throwError": function (args) {
        return q.reject(new Error("This exception is an Error."));
    },
    "Testing.Errors.ChildProc.throwSystemError": function (args) {
        return q.Promise(function (resolve, reject) {
            fs.readFile("false-file.txt", function (error, data) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
};
