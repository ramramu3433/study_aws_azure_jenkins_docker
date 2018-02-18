/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "Providers/CloudExplorer/Resources/CloudExplorerResources"], function (require, exports, ko, CloudExplorerResources) {
    "use strict";
    /**
     * Node details view representation
     */
    var BaseDetailsViewModel = (function () {
        function BaseDetailsViewModel(name, templateName, resourceId, resourceResolver) {
            var _this = this;
            this._startUpdate = function () {
                if (!_this._activeSubscription) {
                    _this._activeSubscription = _this.active.subscribe(function (value) {
                        if (value) {
                            _this._startUpdateTimer(true);
                        }
                        else {
                            _this._stopUpdateTimer();
                        }
                    });
                }
                if (!_this._nodeSubscription) {
                    _this._nodeSubscription = _this.node.subscribe(function (node) {
                        if (node) {
                            _this._startUpdateTimer(true);
                        }
                        else {
                            _this._stopUpdateTimer();
                        }
                    });
                }
                _this._startUpdateTimer(!!_this.active() && !!_this.node());
            };
            this._startUpdateTimer = function (refreshImmediately) {
                if (refreshImmediately) {
                    _this._stopUpdateTimer();
                    _this.updateHandler();
                }
                if (!_this._refreshTimerHandle) {
                    _this._refreshTimerHandle = setInterval(_this._updateHandler, _this.refreshFrequency);
                }
            };
            this._stopUpdate = function () {
                if (_this._activeSubscription) {
                    _this._activeSubscription.dispose();
                    _this._activeSubscription = null;
                }
                if (_this._nodeSubscription) {
                    _this._nodeSubscription.dispose();
                    _this._nodeSubscription = null;
                }
                _this._stopUpdateTimer();
            };
            this._stopUpdateTimer = function () {
                if (_this._refreshTimerHandle) {
                    clearInterval(_this._refreshTimerHandle);
                    _this._refreshTimerHandle = 0;
                }
            };
            this._refreshFrequency = BaseDetailsViewModel.refreshFrequency;
            this.active = ko.observable(false);
            this.displayName = ko.observable();
            this.name = name;
            this.node = ko.observable().extend({ rateLimit: 200 });
            this.templateName = templateName;
            resourceResolver.resolveResource(CloudExplorerResources.namespace, resourceId)
                .then(function (value) {
                _this.displayName(value);
            });
        }
        BaseDetailsViewModel.prototype.setFocus = function () {
            return;
        };
        Object.defineProperty(BaseDetailsViewModel.prototype, "refreshFrequency", {
            get: function () {
                return this._refreshFrequency;
            },
            set: function (value) {
                this._stopUpdateTimer();
                this._refreshFrequency = value;
                if (this.refreshFrequency > 0) {
                    this._startUpdateTimer(false);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseDetailsViewModel.prototype, "updateHandler", {
            get: function () {
                return this._updateHandler;
            },
            set: function (handler) {
                if (handler === this._updateHandler) {
                    return;
                }
                if (this._updateHandler) {
                    this._stopUpdate();
                }
                this._updateHandler = handler;
                if (this._updateHandler) {
                    this._startUpdate();
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseDetailsViewModel;
    }());
    BaseDetailsViewModel.refreshFrequency = 10000;
    return BaseDetailsViewModel;
});
