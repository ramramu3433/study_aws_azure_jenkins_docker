"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
require("./CloudExplorerProxyMarshaler");
var ExceptionSerialization_1 = require("../Components/Errors/ExceptionSerialization");
var host = global.host;
/**
 * Routes operation requests from Daytona plugins to the Cloud Explorer host.
 */
var HostProxy = (function () {
    function HostProxy() {
        this.raiseEvent = function (namespace, args) {
            return host.raiseEvent(namespace, args);
        };
        this.executeOperation = function (namespace, args) {
            return host.executeOperation(namespace, args)
                .then(function (result) {
                return JSON.stringify({ type: "result", result: result });
            })
                .catch(function (error) {
                return JSON.stringify({ type: "error", error: ExceptionSerialization_1.default.serialize(error) });
            });
        };
    }
    return HostProxy;
}());
var instance = new HostProxy();
exports.default = instance;
