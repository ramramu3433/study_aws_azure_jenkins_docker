define(["require", "exports", "knockout", "./ToolbarDropdown", "./ToolbarAction", "./ToolbarToggle"], function (require, exports, ko, ToolbarDropdown_1, ToolbarAction_1, ToolbarToggle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Toolbar = (function () {
        function Toolbar(actionItems, afterExecute) {
            var _this = this;
            this._toolbarWidth = ko.observable();
            this._hasFocus = false;
            this.toolbarItems = ko.pureComputed(function () {
                var remainingToolbarSpace = _this._toolbarWidth();
                var toolbarItems = [];
                var moreItem = {
                    type: "dropdown",
                    title: "More",
                    displayName: "More",
                    id: "more-actions-toggle",
                    enabled: ko.observable(true),
                    visible: ko.observable(true),
                    icon: "images/ASX_More.svg",
                    subgroup: []
                };
                var showHasMoreItem = false;
                var addSeparator = false;
                _this._actionConfigs.forEach(function (actionConfig) {
                    if (actionConfig.type === "separator") {
                        addSeparator = true;
                    }
                    else if (remainingToolbarSpace / 60 > 2) {
                        if (addSeparator) {
                            addSeparator = false;
                            toolbarItems.push(Toolbar._createToolbarItemFromConfig({ type: "separator" }));
                            remainingToolbarSpace -= 10;
                        }
                        toolbarItems.push(Toolbar._createToolbarItemFromConfig(actionConfig));
                        remainingToolbarSpace -= 60;
                    }
                    else {
                        showHasMoreItem = true;
                        if (addSeparator) {
                            addSeparator = false;
                            moreItem.subgroup.push({
                                type: "separator"
                            });
                        }
                        if (!!actionConfig) {
                            moreItem.subgroup.push(actionConfig);
                        }
                    }
                });
                if (showHasMoreItem) {
                    toolbarItems.push(Toolbar._createToolbarItemFromConfig({ type: "separator" }), Toolbar._createToolbarItemFromConfig(moreItem));
                }
                return toolbarItems;
            });
            this._focusFirstEnabledItem = function (items) {
                if (!!_this._focusedSubscription) {
                    // no memory leaks! :D
                    _this._focusedSubscription.dispose();
                }
                if (_this._hasFocus) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type !== "separator" && items[i].enabled()) {
                            items[i].focused(true);
                            _this._focusedSubscription = items[i].focused.subscribe(function (newValue) {
                                if (!newValue) {
                                    _this._hasFocus = false;
                                    _this._focusedSubscription.dispose();
                                }
                            });
                            break;
                        }
                    }
                }
            };
            this._actionConfigs = actionItems;
            this._afterExecute = afterExecute;
            this.toolbarItems.subscribe(this._focusFirstEnabledItem);
            $(window).resize(function () {
                _this._toolbarWidth($(".toolbar").width());
            });
            setTimeout(function () {
                _this._toolbarWidth($(".toolbar").width());
            }, 500);
        }
        Toolbar.prototype.focus = function () {
            this._hasFocus = true;
            this._focusFirstEnabledItem(this.toolbarItems());
        };
        Toolbar._createToolbarItemFromConfig = function (configItem, afterExecute) {
            switch (configItem.type) {
                case "dropdown":
                    return new ToolbarDropdown_1.default(configItem, afterExecute);
                case "action":
                    return new ToolbarAction_1.default(configItem, afterExecute);
                case "toggle":
                    return new ToolbarToggle_1.default(configItem, afterExecute);
                case "separator":
                    return {
                        type: "separator",
                        visible: ko.observable(true)
                    };
            }
        };
        return Toolbar;
    }());
    exports.default = Toolbar;
    /**
     * Helper class for ko component registration
     */
    var ToolbarComponent = (function () {
        function ToolbarComponent() {
            return {
                viewModel: Toolbar,
                template: { require: "text!toolbar.html" }
            };
        }
        return ToolbarComponent;
    }());
    exports.ToolbarComponent = ToolbarComponent;
});
