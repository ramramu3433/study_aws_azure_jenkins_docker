"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var _ = require("underscore");
var _string = require("underscore.string");
var q = require("q");
var utilities = require("../../../Utilities");
var Constants = {
    registryTag: "REG_SZ",
    queryCmd: "REG QUERY",
    registryKeyOnx64: "\"HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows Azure Storage Emulator\"",
    registryKeyOnx32: "\"HKLM\\SOFTWARE\\Microsoft\\Windows Azure Storage Emulator\"",
    queryArg: "/v",
    registryName: "InstallPath",
    emulatorExeName: "AzureStorageEmulator.exe",
    emulatorCmdTemplate: "\"%s\" %s",
    registryKeyNotFoundMessage: "The system was unable to find the specified registry key or value."
};
function startStorageEmulator() {
    var exec = child_process.exec;
    var registryKey = utilities.isWinx64() ? Constants.registryKeyOnx64 : Constants.registryKeyOnx32;
    var emulatorPathQueryCmd = [Constants.queryCmd, registryKey, Constants.queryArg, Constants.registryName].join(" ");
    return q.Promise(function (resolve, reject) {
        exec(emulatorPathQueryCmd, function (error, stdout, stderr) {
            if (error) {
                if (_string.contains(error.message, Constants.registryKeyNotFoundMessage)) {
                    reject(new StorageEmulatorNotAvailableError());
                }
                else {
                    reject(error);
                }
            }
            try {
                var registryQueryResult = _.find(stdout.toString().split("\n"), function (value) {
                    return _string.contains(value, Constants.registryTag);
                });
                var storageEmulatorExePath = registryQueryResult.substr(registryQueryResult.indexOf(Constants.registryTag) + Constants.registryTag.length)
                    .trim()
                    .split("\\")
                    .join("\\\\")
                    .concat(Constants.emulatorExeName);
                var statusCmd = _string.sprintf(Constants.emulatorCmdTemplate, storageEmulatorExePath, "status");
            }
            catch (error) {
                reject(error);
            }
            exec(statusCmd, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                }
                else if (stdout && _string.contains(stdout.toString(), "IsRunning: True")) {
                    resolve({});
                }
                else {
                    var startCmd = _string.sprintf(Constants.emulatorCmdTemplate, storageEmulatorExePath, "start");
                    exec(startCmd, function (error, stdout, stderr) {
                        // Remove the error rejection for two situations found so far.
                        // Situation 1:
                        // if user closes emulator then refreshes development account immediately
                        // the check of the status will be not running, but the emulator hasn't been stopped completely,
                        // so start cmd will throw exception here saying emulator already running.
                        // Just ignore the error for now.
                        // Situation 2:
                        // If there are other processes monitoring ports that emulator use, starting emulator will throw
                        // port conflict exception. But emulator can still be started.
                        // TODO: better handle this corner stituation.
                        resolve({});
                    });
                }
            });
        });
    });
}
exports.startStorageEmulator = startStorageEmulator;
var StorageEmulatorNotAvailableError = (function () {
    function StorageEmulatorNotAvailableError() {
        this.name = "StorageEmulatorNotAvailable";
        this.message = this.name;
    }
    return StorageEmulatorNotAvailableError;
}());
exports.StorageEmulatorNotAvailableError = StorageEmulatorNotAvailableError;
var StorageEmulatorNotSupportedError = (function () {
    function StorageEmulatorNotSupportedError() {
        this.name = "StorageEmulatorNotSupported";
        this.message = this.name;
    }
    return StorageEmulatorNotSupportedError;
}());
exports.StorageEmulatorNotSupportedError = StorageEmulatorNotSupportedError;
