"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ExceptionSerialization_1 = require("../../Errors/ExceptionSerialization");
var child_process_1 = require("child_process"); // Module from node.js
var Q = require("q");
var path = require("path");
var ForkedProcess = (function () {
    function ForkedProcess(startupModuleFullPath, startupFunctionName, startupFunctionArgs, debugPort, sslCertDirectory) {
        var _this = this;
        this._disconnectionBroadcasted = false;
        this._onMessageHandlers = [];
        this._onDisconnectedHandlers = [];
        this._startAckReceived = false;
        this._startCanceled = false;
        this.start = function () {
            _this._startDefer = Q.defer();
            var forkOptions = {
                execArgv: [],
                // Possible options cwd, env, execPath, execArgv, silent
                cwd: process.cwd()
            };
            if (!!_this._debugPort) {
                forkOptions.execArgv.push("--debug-brk=" + _this._debugPort);
            }
            // Start up the child node.js process. If there are errors, they will be directed to the "error"
            // handler.
            // Note: fork spawns a new Node.js process and invokes the specified module with an IPC communication channel established between parent/child
            _this._childProcess = child_process_1.fork(ForkedProcess._bootloaderPath, [
                _this._startupModuleFullPath,
                _this._startupFunctionName || "",
                _this._startupFunctionArgs ? JSON.stringify(_this._startupFunctionArgs) : "",
                _this._sslCertDirectory
            ], forkOptions);
            _this._childProcess.on("exit", _this._onExit);
            _this._childProcess.on("error", _this._onError);
            _this._childProcess.on("message", _this._onMessage);
            console.log("ProcessManager: Starting child process with ID " + _this._childProcess.pid);
            if (!!_this._debugPort) {
                console.warn("The child process of module '" + _this._startupModuleFullPath + "' is now waiting for a debugger to be attached at port '" + _this._debugPort + "'");
            }
            else {
                setTimeout(function () {
                    if (!_this._startAckReceived) {
                        // Start-up timed out
                        _this._handleFatalError(new Error("The child process failed to start in a timely manner.")); // Localize
                        try {
                            _this._childProcess.kill();
                        }
                        catch (error) {
                            // Ignore
                        }
                    }
                }, ForkedProcess._startupTimeoutInSeconds * 1000);
            }
            return _this._startDefer.promise;
        };
        this._onExit = function (processExitCode, signal) {
            if (processExitCode > 0 || !_this._startAckReceived) {
                _this._handleFatalError(new Error(signal
                    ? "Child process exited with signal '" + signal + "'" // Localize
                    : "Child process exited with error code '" + processExitCode + "'")); // Localize
            }
            else {
                _this.broadcastDisconnection();
            }
        };
        this._onError = function (err) {
            // The 'error' event is emitted when the process could not be spawned or killed,
            //   or sending a message to the child process failed.
            _this._handleFatalError(err);
        };
        this._onMessage = function (message) {
            // Message received from child
            // window.console.log("Message from child:");
            // window.console.log(message);
            if (message.$isProcessManagerMessage) {
                var ackFromChild = message.ackFromChild;
                var unhandledException = message.unhandledException;
                var log = message.log;
                var warn = message.warn;
                var error = message.error;
                if (ackFromChild) {
                    if (!_this._startCanceled) {
                        _this._startDefer.resolve();
                        _this._startAckReceived = true;
                    }
                }
                else if (unhandledException) {
                    var deserializedError = ExceptionSerialization_1.default.deserialize(unhandledException);
                    _this._handleFatalError(deserializedError);
                }
                else if (log) {
                    console.log("FROM CHILD PROCESS " + message.childPid + ": " + log);
                }
                else if (warn) {
                    console.warn("FROM CHILD PROCESS " + message.childPid + ": " + warn);
                }
                else if (error) {
                    var deserializedError = ExceptionSerialization_1.default.deserialize(error);
                    console.error("FROM CHILD PROCESS " + message.childPid + ": " + ExceptionSerialization_1.default.summarize(deserializedError));
                }
            }
            else if (_this._startAckReceived) {
                _this.broadcastMessageFromChild(message);
            }
        };
        this._handleFatalError = function (error) {
            if (_this._startAckReceived) {
                _this.broadcastDisconnection(error);
            }
            else {
                _this._startCanceled = true;
                _this._startDefer.reject(error);
            }
        };
        /**
         * Broadcasts a message from the child to the listener of onMessage
         */
        this.broadcastMessageFromChild = function (message) {
            _this._onMessageHandlers.forEach(function (handler) {
                handler(message);
            });
        };
        /**
         * Broadcasts a disconnection event
         */
        this.broadcastDisconnection = function (error) {
            if (!_this._disconnectionBroadcasted) {
                _this._disconnectionBroadcasted = true;
                _this._onDisconnectedHandlers.forEach(function (handler) {
                    handler(error);
                });
            }
        };
        /**
         * Sets up a listener to handle messages
         */
        this.onMessage = function (handler) {
            _this._onMessageHandlers.push(handler);
        };
        this.onDisconnected = function (handler) {
            _this._onDisconnectedHandlers.push(handler);
        };
        /**
         * Sends a message to the child process
         */
        this.sendMessage = function (message) {
            return Q.Promise(function (resolve, reject) {
                var sendError = null;
                if (!_this.disconnected) {
                    if (_this._startAckReceived) {
                        _this._childProcess.send(message, function (error) {
                            if (sendError) {
                                reject(sendError);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    }
                    else {
                        _this._startDefer.promise.then(function () {
                            _this._childProcess.send(message, function (error) {
                                if (sendError) {
                                    reject(sendError);
                                }
                                else {
                                    resolve(null);
                                }
                            });
                        }).catch(reject);
                    }
                }
                else {
                    // Not connected
                    var error = new Error("The child process has been disconnected."); // Localize
                    _this.broadcastDisconnection(error);
                    reject(error);
                }
                ;
            });
        };
        this.kill = function () {
            _this._childProcess.kill();
        };
        this._startupModuleFullPath = startupModuleFullPath;
        this._startupFunctionName = startupFunctionName;
        this._startupFunctionArgs = startupFunctionArgs;
        this._debugPort = debugPort;
        this._sslCertDirectory = sslCertDirectory;
    }
    Object.defineProperty(ForkedProcess.prototype, "disconnected", {
        get: function () {
            return this._disconnectionBroadcasted || !this._childProcess.connected;
        },
        enumerable: true,
        configurable: true
    });
    return ForkedProcess;
}());
ForkedProcess._startupTimeoutInSeconds = 20;
ForkedProcess._bootloaderPath = path.resolve(__dirname, "../Child/BootLoader");
exports.default = ForkedProcess;
