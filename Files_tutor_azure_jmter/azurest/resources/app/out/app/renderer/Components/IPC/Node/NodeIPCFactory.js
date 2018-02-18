"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodeIPCClient_1 = require("./NodeIPCClient");
var NodeIPCServer_1 = require("./NodeIPCServer");
var uuid = require("uuid/v1");
var net_1 = require("net");
var crypto = require("crypto");
var os = require("os");
var path = require("path");
var Q = require("q");
var NodeIPCFactory = (function () {
    function NodeIPCFactory() {
    }
    NodeIPCFactory.mainIPCHandle = function (userDataDir, appName, appVersion) { return NodeIPCFactory._getIPCHandle(userDataDir, appName, appVersion, "main"); };
    NodeIPCFactory.serve = function (namedPipe) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        var server = net_1.createServer();
                        server.on("error", reject);
                        server.listen(namedPipe, function () {
                            server.removeListener("error", reject);
                            resolve(new NodeIPCServer_1.default(server));
                        });
                    })];
            });
        });
    };
    NodeIPCFactory.connect = function (namedPipe) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        var socket = net_1.createConnection(namedPipe, function () {
                            socket.removeListener("error", reject);
                            resolve(new NodeIPCClient_1.default(socket));
                        });
                        socket.once("error", reject);
                    })];
            });
        });
    };
    NodeIPCFactory._getUniqueUserId = function () {
        var username;
        if (process.platform === "win32") {
            username = process.env.USERNAME;
        }
        else {
            username = process.env.USER;
        }
        if (!username) {
            return "unknown"; // fail gracefully if there is no user name
        }
        // use sha256 to ensure the userid value can be used in filenames and are unique
        return crypto.createHash("sha256").update(username).digest("hex").substr(0, 6);
    };
    NodeIPCFactory._getWin32IPCHandle = function (appName, appVersion, type) {
        // Support to run VS Code multiple times as different user
        // by making the socket unique over the logged in user
        var userId = NodeIPCFactory._getUniqueUserId();
        var name = appName + (userId ? "-" + userId : "");
        return "\\\\.\\pipe\\" + name + "-" + appVersion + "-" + type + "-sock";
    };
    NodeIPCFactory._getNixIPCHandle = function (userDataPath, appName, appVersion, type) {
        if (process.env["XDG_RUNTIME_DIR"]) {
            return path.join(process.env["XDG_RUNTIME_DIR"], appName + "-" + appVersion + "-" + type + ".sock");
        }
        return path.join(userDataPath, appVersion + "-" + type + ".sock");
    };
    NodeIPCFactory._getIPCHandle = function (userDataPath, appName, appVersion, type) {
        if (process.platform === "win32") {
            return NodeIPCFactory._getWin32IPCHandle(appName, appVersion, type);
        }
        else {
            return NodeIPCFactory._getNixIPCHandle(userDataPath, appName, appVersion, type);
        }
    };
    NodeIPCFactory.generateUniquePipeName = function () {
        var randomSuffix = uuid();
        if (process.platform === "win32") {
            return "\\\\.\\pipe\\stgexp-" + randomSuffix + "-sock";
        }
        else {
            // Mac/Unix: use socket file
            return path.join(os.tmpdir(), "stgexp-" + randomSuffix + ".sock");
        }
    };
    return NodeIPCFactory;
}());
exports.default = NodeIPCFactory;
