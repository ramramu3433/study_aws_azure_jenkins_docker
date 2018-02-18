/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "Common/Debug", "StorageExplorer/Settings/SettingsManager", "../../Common/UIActions"], function (require, exports, Debug, SettingsManager_1, UIActions) {
    "use strict";
    var QuickAccessManager = (function () {
        function QuickAccessManager(host, telemetry) {
            this._host = host;
            this._settingsManager = new SettingsManager_1.default(telemetry, 1 /* localStorage */);
            this._telemetry = telemetry;
            this._settingName = Debug.isDebug() ? "StorageExplorer_InPlaceQuickAccessItems_v1_DBG" : "StorageExplorer_InPlaceQuickAccessItems_v1";
            this._encryptItems = !Debug.isDebug();
        }
        QuickAccessManager.prototype.addToQuickAccess = function (newItem) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var items;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Debug.assert(!!newItem);
                            if (!newItem || !newItem.displayName || !newItem.producerArgs || !newItem.producerNamespace) {
                                Debug.assert(false, "Invalid Quick Access item.");
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.readFromSettings()];
                        case 1:
                            items = _a.sent();
                            if (!!items.some(function (v) { return _this.isSameResource(v, newItem); })) return [3 /*break*/, 3];
                            items.push(newItem);
                            this._telemetry.sendEvent("Azure.QuickAccess.Add", { "nodeType": newItem.producerNamespace });
                            return [4 /*yield*/, this.writeToSettings(items)];
                        case 2:
                            _a.sent();
                            this.refreshQuickAccessNode();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        QuickAccessManager.prototype.removeFromQuickAccess = function (itemToRemove) {
            return __awaiter(this, void 0, void 0, function () {
                var items, index, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readFromSettings()];
                        case 1:
                            items = _a.sent();
                            for (i = 0; i < items.length; i++) {
                                if (this.isSameResource(items[i], itemToRemove)) {
                                    index = i;
                                    break;
                                }
                            }
                            if (!(index >= 0)) return [3 /*break*/, 3];
                            items.splice(index, 1);
                            this._telemetry.sendEvent("Azure.QuickAccess.Remove");
                            return [4 /*yield*/, this.writeToSettings(items)];
                        case 2:
                            _a.sent();
                            this.refreshQuickAccessNode();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        QuickAccessManager.prototype.getQuickAccessItems = function () {
            return __awaiter(this, void 0, void 0, function () {
                var items, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.readFromSettings()];
                        case 1:
                            items = _a.sent();
                            this._telemetry.sendMetric("Azure.QuickAccess.ItemCount", items.length);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            Debug.error(error_1);
                            items = [];
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/, items];
                    }
                });
            });
        };
        QuickAccessManager.prototype.readFromSettings = function () {
            return __awaiter(this, void 0, void 0, function () {
                var settingValue, error_2, items;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingValue = this._settingsManager.loadSettings(this._settingName);
                            if (typeof settingValue !== "string") {
                                settingValue = "";
                            }
                            if (!this._encryptItems) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this._host.executeOperation("CloudExplorer.Actions.Crypto.DecryptText", [settingValue])];
                        case 2:
                            settingValue = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            Debug.error(error_2);
                            settingValue = "";
                            return [3 /*break*/, 4];
                        case 4:
                            try {
                                items = JSON.parse(settingValue);
                                if (!(items instanceof Array)) {
                                    items = [];
                                }
                            }
                            catch (error) {
                                Debug.error(error);
                                items = [];
                            }
                            return [2 /*return*/, items];
                    }
                });
            });
        };
        QuickAccessManager.prototype.writeToSettings = function (items) {
            return __awaiter(this, void 0, void 0, function () {
                var settingValue, processedValue, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            settingValue = JSON.stringify(items);
                            if (!this._encryptItems) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._host.executeOperation("CloudExplorer.Actions.Crypto.EncryptText", [settingValue])];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = settingValue;
                            _b.label = 3;
                        case 3:
                            processedValue = _a;
                            this._settingsManager.saveSettings(processedValue, this._settingName);
                            return [2 /*return*/];
                    }
                });
            });
        };
        QuickAccessManager.prototype.refreshQuickAccessNode = function () {
            var uiActions = new UIActions(this._host);
            // always call addNodeToSearchResults incase we are in search mode, as it only does anything if we are
            return uiActions.addNodeToSearchResults(QuickAccessManager.QuickAccessNodeId)
                .then(function () {
                // since adding to the QuickAccess settings is analagous to the backend being modified, we simply
                // refresh the "Quick Access" node
                uiActions.refreshNodeChildren([{ name: "id", value: QuickAccessManager.QuickAccessNodeId }]);
            })
                .then(function () {
                // make sure "Quick Access" node is expanded
                uiActions.expand([{ name: "id", value: QuickAccessManager.QuickAccessNodeId }]);
            });
        };
        QuickAccessManager.prototype.isSameResource = function (itemX, itemY) {
            if (!itemX || !itemY) {
                return itemX === itemY;
            }
            if (itemX.producerNamespace !== itemY.producerNamespace) {
                return false;
            }
            if (!itemX.producerArgs || !itemY.producerArgs) {
                return itemX.producerArgs === itemY.producerArgs;
            }
            var xKeys = Object.keys(itemX.producerArgs);
            var yKeys = Object.keys(itemY.producerArgs);
            if (xKeys.length !== yKeys.length) {
                return false;
            }
            return xKeys.every(function (value, index, array) {
                return yKeys.indexOf(value) !== -1 && itemX.producerArgs[value] === itemY.producerArgs[value];
            });
        };
        return QuickAccessManager;
    }());
    QuickAccessManager.getQuickAccessNodeName = function () { return "Quick Access"; }; // Localize
    QuickAccessManager.QuickAccessNodeId = "Azure.QuickAccess";
    QuickAccessManager.AddToQuickAccessResourceStringId = "TreeView.QuickAccess.Add";
    QuickAccessManager.RemoveFromQuickAccessResourceStringId = "TreeView.QuickAccess.Remove";
    QuickAccessManager.GoToItemResourceStringId = "TreeView.QuickAccess.GoTo";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QuickAccessManager;
});
