/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "es6-promise", "CloudExplorer/CloudExplorerConstants", "CloudExplorer/TreeNode/Node"], function (require, exports, ko, rsvp, CloudExplorerConstants, Node) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * View model of a placeholder for user input during resource creation.
     */
    var PlaceholderViewModel = (function () {
        function PlaceholderViewModel(owningNode, panel, host, action) {
            var _this = this;
            this.owningNode = ko.observable();
            this.newChildName = ko.observable();
            this.isNameValid = ko.observable(true);
            this.errorMessage = ko.observable("");
            this._newChildNameAttr = "newChildName";
            this._addedNodeViewModel = ko.observable();
            this._initialPlaceholderName = "";
            this.ariaLabel = ko.pureComputed(function () {
                var label = _this.newChildName();
                return _this.isNameValid() ? label : "Invalid name: " + label + ". " + _this.errorMessage();
            });
            this.generateNewNode = function (placeholderName) {
                return new Node(_this._host, {
                    displayName: { value: placeholderName },
                    icon: _this.owningNode().icon(),
                    themeSrc: _this.owningNode().themeSrc(),
                    uid: "placeholder"
                }, null);
            };
            this.setFocusToPlaceholder = function () {
                document.getElementById("placeholderForInput").focus();
            };
            this.resetFocus = function () {
                $(".panel.active .treeView").focus();
            };
            this.removePlaceholder = function () {
                _this.owningNode().childGroupViewModel().shiftChild();
                if (_this.owningNode().canExpand() && !_this.owningNode().isExpanded()) {
                    _this.owningNode().toggle();
                }
                _this.resetFocus();
            };
            this.classifyNameValidationType = function () {
                if (!_this.newChildName()) {
                    return Promise.resolve(NameValidationType.Empty);
                }
                // if the plugin doesn't provide a name validation namespace, then always assumes the name valid.
                var createChildNamespaceAttr = _this._creatAction.unwrappedAction.createChild.namespace;
                if (!createChildNamespaceAttr) {
                    return Promise.resolve(NameValidationType.Valid);
                }
                return _this.executeNameValidationAction(createChildNamespaceAttr, _this.newChildName())
                    .then(function (value) {
                    _this.errorMessage(value);
                    return value === "" ? NameValidationType.Valid : NameValidationType.Invalid;
                });
            };
            this.validateName = function () {
                return _this.classifyNameValidationType().then(function (value) {
                    switch (value) {
                        case NameValidationType.Empty:
                        case NameValidationType.Valid:
                            _this.isNameValid(true);
                            break;
                        case NameValidationType.Invalid:
                            _this.isNameValid(false);
                            break;
                        default:
                            break;
                    }
                });
            };
            this.executeNameValidationAction = function (namespace, name) {
                return _this._host.executeAction(namespace, name).
                    then(function (response) {
                    return response;
                });
            };
            this.showPlaceholderNode = function () {
                _this.owningNode().childGroupViewModel().unshiftChild(_this._addedNodeViewModel());
                if (_this.owningNode().canExpand() && !_this.owningNode().isExpanded()) {
                    _this.owningNode().toggle();
                }
                _this._panel.selectNode(_this._addedNodeViewModel());
                _this.setFocusToPlaceholder();
            };
            this.onKeydown = function (data, event) {
                switch (event.keyCode) {
                    case CloudExplorerConstants.keyCodes.Enter:
                        _this.executeAddResourceAction();
                        return false;
                    case CloudExplorerConstants.keyCodes.Esc:
                        _this.removePlaceholder();
                        return false;
                }
                return true;
            };
            this.handleFocus = function (data, event) {
                event.stopPropagation();
            };
            this.executeAddResourceAction = function () {
                _this.classifyNameValidationType().then(function (value) {
                    switch (value) {
                        case NameValidationType.Valid:
                            _this._creatAction.unwrappedAction.boundArguments[_this._newChildNameAttr] = {
                                value: _this.newChildName()
                            };
                            _this.owningNode().executeAction(_this._creatAction, "ContextMenu");
                            break;
                    }
                    return value;
                }).then(function (value) {
                    switch (value) {
                        case NameValidationType.Valid:
                        case NameValidationType.Empty:
                            _this.removePlaceholder();
                            break;
                        case NameValidationType.Invalid:
                            _this.setFocusToPlaceholder();
                            break;
                    }
                });
            };
            this.owningNode(owningNode);
            this._panel = panel;
            this._host = host;
            this._creatAction = action;
            this.newChildName.subscribe(function () { _this.validateName(); });
            var initialName = this._creatAction.unwrappedAction.createChild.newChildName;
            if (!!initialName) {
                this._initialPlaceholderName = initialName;
            }
            // Due to dependency order issues, we need to dynamically import NodeViewModel.
            // TODO: [cralvord] Use default import/export to bypass circular dependency limitation.
            var NodeViewModelInst = require("CloudExplorer/UI/NodeViewModel");
            var newNode = this.generateNewNode(this._initialPlaceholderName);
            var newNodeViewModel = NodeViewModelInst.createNodeViewModel(newNode, owningNode, panel, host, "placeholderTemplate", this);
            this._addedNodeViewModel(newNodeViewModel);
            this.newChildName(this._initialPlaceholderName);
        }
        return PlaceholderViewModel;
    }());
    var NameValidationType;
    (function (NameValidationType) {
        NameValidationType[NameValidationType["Empty"] = 0] = "Empty";
        NameValidationType[NameValidationType["Invalid"] = 1] = "Invalid";
        NameValidationType[NameValidationType["Valid"] = 2] = "Valid";
    })(NameValidationType || (NameValidationType = {}));
    ;
    return PlaceholderViewModel;
});
