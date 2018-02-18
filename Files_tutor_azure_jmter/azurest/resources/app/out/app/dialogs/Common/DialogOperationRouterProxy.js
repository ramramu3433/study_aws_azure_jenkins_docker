"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var q = require("q");
var electron_1 = require("electron");
/**
 * A proxy that communicates with Cloud Explorer to handle operations.
 */
var DialogOperationRouterProxy = (function () {
    function DialogOperationRouterProxy() {
        var _this = this;
        this.nextMessageID = 0;
        this.operations = {};
        electron_1.ipcRenderer.on("dialog-did-execute-operation", function (e, messageID, error, result) {
            console.assert(!!_this.operations[messageID], "Unknown message ID '" + messageID + "' received in DialogOperationRouterProxy");
            if (error) {
                _this.operations[messageID].reject(error);
            }
            else {
                _this.operations[messageID].resolve(result);
            }
            delete _this.operations[messageID];
        });
    }
    DialogOperationRouterProxy.prototype.getNextMessageID = function () {
        return "DialogOperationRouterProxy" + (this.nextMessageID++);
    };
    DialogOperationRouterProxy.prototype.executeOperation = function (namespace, args) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            var messageID = _this.getNextMessageID();
            _this.operations[messageID] = { resolve: resolve, reject: reject };
            try {
                electron_1.ipcRenderer.send("dialog-execute-operation", messageID, namespace, args);
            }
            catch (error) {
                delete _this.operations[messageID];
                throw error;
            }
        });
    };
    DialogOperationRouterProxy.prototype.raiseEvent = function (nameSpace, args) {
        return q.Promise(function (resolve, reject) {
            reject("DialogOperationRouterProxy does not implement events yet");
        });
    };
    return DialogOperationRouterProxy;
}());
exports.default = new DialogOperationRouterProxy();
