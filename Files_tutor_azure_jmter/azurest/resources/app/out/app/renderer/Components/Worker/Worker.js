"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var Worker = (function () {
    function Worker() {
        var _this = this;
        this._host = global.host;
        this._jobHandlerMap = Object.create(null);
        this.registerJobHandler = function (handler) {
            _this._jobHandlerMap[handler.queue.name] = handler;
        };
        this.handleJob = function (lease) {
            var jobHandler = _this._jobHandlerMap[lease.queue.name];
            return jobHandler ? jobHandler.handleJob(lease) : Q.reject("Job Handler not found for queue: " + lease.queue.name);
        };
    }
    return Worker;
}());
exports.default = Worker;
