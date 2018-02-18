"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
function init() {
    process.on("message", function (message) {
        if (message === "Ping") {
            process.send("Pong");
        }
        else {
            process.send("NotPong");
        }
    });
    return Q.resolve(null);
}
exports.init = init;
;
