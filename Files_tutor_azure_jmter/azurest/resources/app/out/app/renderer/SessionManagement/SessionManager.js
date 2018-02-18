"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var rimraf = require("rimraf");
var Q = require("q");
var Utilities = require("../../Utilities");
var Session_1 = require("./Session");
var SessionStatus_1 = require("./SessionStatus");
var SessionManager = (function () {
    function SessionManager() {
        this._host = global.host;
        this._renewPromise = Promise.resolve(true);
        this.startSession();
    }
    SessionManager.prototype.currentSessionFolder = function () {
        return { path: this._currentSession.getFolderPath() };
    };
    SessionManager.prototype.sendResumeEvents = function () {
        this._componentsNeedingResume = {};
        for (var i = 0; i < this._toResumeSessions.length; i++) {
            var session = this._toResumeSessions[i];
            var sessionResumeInfo = session.getResumeInfo();
            for (var component in sessionResumeInfo) {
                if (!this._componentsNeedingResume[component]) {
                    this._componentsNeedingResume[component] = [];
                }
                this._componentsNeedingResume[component].push(sessionResumeInfo[component]);
            }
        }
        var promises = [];
        for (var component in this._componentsNeedingResume) {
            promises.push(this._host.raiseEvent("SessionManager.onSessionResume." + component, this._componentsNeedingResume[component]));
        }
        return Promise.all(promises);
    };
    SessionManager.prototype.sendExpiredEvent = function () {
        if (this._expiredSessions.length > 1) {
            var expiredSessionsInfos = [];
            for (var i = 0; i < this._expiredSessions.length; i++) {
                var filesInSession = this._expiredSessions[i].getAvailableFiles();
                var likelyTimeOfCrash = this._expiredSessions[i].getExpirationDate();
                var guid = this._expiredSessions[i].getGuid();
                expiredSessionsInfos.push({
                    files: filesInSession,
                    timestamp: likelyTimeOfCrash,
                    sessionGuid: guid
                });
            }
            return this._host.raiseEvent("SessionManager.onExpiredSessionsFound", expiredSessionsInfos);
        }
        else {
            return Promise.resolve();
        }
    };
    SessionManager.prototype.endSession = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var eventResults, timestamp, changeStatusToResume, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._renewIntervalId) {
                            // cannot end a season which has not started
                            return [2 /*return*/];
                        }
                        clearInterval(this._renewIntervalId);
                        return [4 /*yield*/, this.deleteSessions(this._toResumeSessions)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.deleteSessions(this._expiredSessions)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._host.raiseEvent("SessionManager.sessionEnding", {})];
                    case 3:
                        eventResults = _a.sent();
                        timestamp = Date.now();
                        changeStatusToResume = false;
                        for (i = 0; i < eventResults.length; i++) {
                            if (!!eventResults[i]) {
                                eventResults[i].timestamp = timestamp;
                                eventResults[i].sessionGuid = this._currentSession.getGuid();
                                this._currentSession.setComponentToBeResumed(eventResults[i]);
                                changeStatusToResume = true;
                            }
                        }
                        if (changeStatusToResume) {
                            this._currentSession.setStatus(SessionStatus_1.default.Resume);
                        }
                        else {
                            this._currentSession.setStatus(SessionStatus_1.default.Delete);
                        }
                        return [2 /*return*/, this._renewPromise
                                .then(function () {
                                return Promise.resolve(undefined);
                            })];
                }
            });
        });
    };
    SessionManager.prototype.startSession = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._renewIntervalId) {
                            // should only call startSession once
                            return [2 /*return*/];
                        }
                        if (!fs.existsSync(SessionManager._sessionsFolder)) {
                            fs.mkdirSync(SessionManager._sessionsFolder);
                        }
                        this._currentSession = new Session_1.default(SessionManager._sessionsFolder, Utilities.guid());
                        this._renewIntervalId = window.setInterval(function () {
                            _this.renewSession();
                        }, SessionManager._renewTimeout);
                        return [4 /*yield*/, this.processOldSessions()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.renewSession = function (retryCount) {
        if (retryCount === void 0) { retryCount = 10; }
        this._renewPromise = this._currentSession.renew();
        this._renewPromise
            .then(function (didRenew) {
            if (!didRenew) {
                console.error("Unable to renew lease? This should not happen!");
            }
        });
    };
    SessionManager.prototype.processOldSessions = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var sessionsToDelete;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._toResumeSessions = [];
                        this._expiredSessions = [];
                        sessionsToDelete = [];
                        fs.readdirSync(SessionManager._sessionsFolder).forEach(function (guid) {
                            if (guid[0] !== "." && guid !== _this._currentSession.getGuid()) {
                                var session = _this.getSessionFromGuid(guid);
                                var status = session.getStatus();
                                var isExpired = session.isExpired();
                                if (status === SessionStatus_1.default.Delete) {
                                    sessionsToDelete.push(session);
                                }
                                else if (status === SessionStatus_1.default.Resume) {
                                    _this._toResumeSessions.push(session);
                                    session.setStatus(SessionStatus_1.default.Resumed);
                                }
                                else if (isExpired) {
                                    _this._expiredSessions.push(session);
                                    session.setStatus(SessionStatus_1.default.Expired);
                                }
                            }
                        });
                        if (!(this._toResumeSessions.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendResumeEvents()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(this._expiredSessions.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendExpiredEvent()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.deleteSessions(sessionsToDelete)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.deleteSessions = function (sessions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var promises, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (i = 0; i < sessions.length; i++) {
                            promises.push(Q.Promise(function (resolve, reject) {
                                rimraf(sessions[i].getFolderPath(), function () {
                                    resolve(null);
                                });
                            }));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.getSessionFromGuid = function (guid) {
        var sessionDirectory = path.join(SessionManager._sessionsFolder, guid);
        return Session_1.default.readFromSessionDirectory(sessionDirectory);
    };
    return SessionManager;
}());
SessionManager._renewTimeout = 500;
SessionManager._sessionsFolder = path.join(electron_1.remote.app.getPath("userData"), "sessions");
exports.default = new SessionManager();
