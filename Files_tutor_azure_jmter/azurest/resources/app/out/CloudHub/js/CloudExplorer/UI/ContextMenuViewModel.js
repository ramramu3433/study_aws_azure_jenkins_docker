/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/CloudExplorerConstants"], function (require, exports, ko, CloudExplorerConstants) {
    "use strict";
    /*
     * ContextMenu view representation
     */
    var ContextMenuViewModel = (function () {
        function ContextMenuViewModel(environmentObservables) {
            var _this = this;
            this.environmentObservables = ko.observable();
            this.node = ko.observable();
            this.actions = ko.observableArray();
            this.visible = ko.observable(false);
            this.mouseXPos = ko.observable(-1);
            this.mouseYPos = ko.observable(-1);
            this.screenReaderText = "context menu to move through items press up or down arrow";
            this.left = ko.pureComputed(function () {
                var xPosVal = _this.mouseXPos();
                if (_this.mouseXPos() > -1) {
                    if (_this.mouseXPos() + _this.environmentObservables().contextMenuWidth() > _this.environmentObservables().windowWidth()) {
                        var popLeftX = _this.mouseXPos() - _this.environmentObservables().contextMenuWidth();
                        // Default is popping right.
                        // If opening the context menu would go out of the window to the right then it pops left.
                        // If popping left would go off screen then it centers the context menu.
                        if (popLeftX > 0) {
                            xPosVal = popLeftX;
                        }
                        else if (_this.environmentObservables().contextMenuWidth() < _this.environmentObservables().windowWidth()) {
                            xPosVal = (_this.environmentObservables().windowWidth() - _this.environmentObservables().contextMenuWidth()) / 2;
                        }
                    }
                }
                return xPosVal + "px";
            });
            this.top = ko.pureComputed(function () {
                var yPosVal = _this.mouseYPos();
                // Default is popping down.
                // If opening the context menu would go out of the window to the bottom then it pops up.
                if (_this.mouseXPos() > -1) {
                    if (_this.mouseYPos() + _this.environmentObservables().contextMenuHeight() > _this.environmentObservables().windowHeight()) {
                        yPosVal = _this.mouseYPos() - _this.environmentObservables().contextMenuHeight();
                    }
                }
                return yPosVal + "px";
            });
            this.onKeyDown = function (data, event) {
                if (_this.actions()) {
                    // event.key is not supported in Chrome so fallback to keyCode
                    // see: http://www.w3schools.com/jsref/event_key_key.asp
                    // Note that IE and Chrome use different strings for some of the
                    // event.key values.  ArrowDown etc appears to be the newest standard.
                    var length = _this.actions().length;
                    var keyPressed = event.key || event.keyCode;
                    switch (keyPressed) {
                        case "Down":
                        case "ArrowDown":
                        case CloudExplorerConstants.keyCodes.DownArrow:
                            if (_this._selectedAction && _this.actions().length) {
                                var index = _this.actions.indexOf(_this._selectedAction) + 1;
                                index === length ? _this.selectAction(_this.actions()[0]) : _this.selectAction(_this.actions()[index]);
                            }
                            else {
                                _this.selectAction(_this.actions()[0]);
                            }
                            return false;
                        case "Up":
                        case "ArrowUp":
                        case CloudExplorerConstants.keyCodes.UpArrow:
                            if (_this._selectedAction && _this.actions().length) {
                                var index = _this.actions.indexOf(_this._selectedAction) - 1;
                                index === -1 ? _this.selectAction(_this.actions()[length - 1]) : _this.selectAction(_this.actions()[index]);
                            }
                            else {
                                _this.selectAction(_this.actions()[length - 1]);
                            }
                            return false;
                        case "Enter":
                        case CloudExplorerConstants.keyCodes.Enter:
                            _this.executeAction(_this._selectedAction);
                            return false;
                        case "Escape":
                        case CloudExplorerConstants.keyCodes.Esc:
                            _this.selectAction(null);
                            _this._selectedAction = null;
                            _this.close();
                            _this.setFocus();
                            return false;
                        default:
                            return false;
                    }
                }
                return true;
            };
            this.setFocus = function () {
                $(".panel.active .treeView").focus();
            };
            this.selectAction = function (action) {
                var selectedAction = _this._selectedAction;
                if (selectedAction) {
                    selectedAction.selected(false);
                }
                if (action) {
                    _this._selectedAction = action;
                    action.selected(true);
                }
            };
            this.executeAction = function (action) {
                if (action.enabled()) {
                    _this.node().triggerAction(action, "ContextMenu");
                    _this.close();
                }
                _this.selectAction(null);
                _this._selectedAction = null;
                // setTimeout(function() { // TODO : put focus back to the node after completing the action
                //     this.setFocus(); // This will allow create blob container,file share,queue & table context menu action to complete
                // }, 200);
            };
            this.open = function (node, e) {
                _this.close();
                if (node.actions().length) {
                    _this.node(node);
                    _this.actions(node.actions());
                    var isAnyVisible = false;
                    node.actions().forEach(function (action) {
                        if (action.visible()) {
                            isAnyVisible = true;
                            return;
                        }
                    });
                    _this.visible(isAnyVisible);
                    var $contextMenu = $(".context-menu");
                    $contextMenu.focus();
                    var selectedNode = $(".treeView .children .tree .node.selected");
                    _this.environmentObservables().updateContextMenu();
                    if (e.originalEvent.toString() === "[object MouseEvent]") {
                        _this.mouseXPos(e.pageX);
                        _this.mouseYPos(e.pageY);
                    }
                    else {
                        _this.mouseXPos(60);
                        _this.mouseYPos(selectedNode.offset().top + 15);
                    }
                    _this.updateActionStatus();
                }
            };
            this.close = function () {
                _this.visible(false);
            };
            this.updateActionStatus = function () {
                if (_this.node()) {
                    _this.node().actions().forEach(function (action) {
                        action.updateStatus();
                    });
                }
            };
            this.environmentObservables(environmentObservables);
            setInterval(this.updateActionStatus, 10000);
            this.node.subscribe(this.updateActionStatus);
        }
        return ContextMenuViewModel;
    }());
    return ContextMenuViewModel;
});
