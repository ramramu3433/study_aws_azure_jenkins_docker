/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "knockout.mapping", "es6-promise", "ccs", "underscore", "Providers/Azure/Resources/AzureResources", "Providers/Common/AzureConstants", "Providers/CloudExplorer/Actions/CloudExplorerActions", "CloudExplorer/CloudExplorerConstants", "Common/Debug", "CloudExplorer/UI/Details/ReadOnlyPropertyViewModel", "CloudExplorer/UI/Details/ActionViewModel", "CloudExplorer/TreeNode/NodeAdapter", "CloudExplorer/TreeNode/Path", "CloudExplorer/UI/PlaceholderViewModel", "Common/Errors", "Providers/Common/ResourceTypesService", "Common/Utilities", "CloudExplorer/TreeNode/Node"], function (require, exports, ko, mapping, rsvp, ccs, underscore, AzureResources, AzureConstants, CloudExplorerActions, CloudExplorerConstants, Debug, ReadOnlyPropertyViewModel, ActionViewModel, NodeAdapter, Path_1, PlaceholderViewModel, Errors, ResourceTypesService, Utilities, Node) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * Node view representation
     */
    var NodeViewModel = (function () {
        /**
         * WARNING: do not use this constructor, use createNodeViewModel (found above). This method adds the created NodeViewModel
         *  to the nodeCache. This has the potential to overwrite existing createNodeViewModel which can break things!
         *
         * @param node
         * @param parent
         * @param panel
         * @param host
         * @param templateName Template to use in the HTML, if not the default
         * @param placeholder A view model if this is not a resource node, but rather the special "new" node that allows you to type in a name
         */
        function NodeViewModel(node, parent, panel, host, templateName, placeholder) {
            var _this = this;
            this.dispose = function () {
                delete NodeViewModel._nodeCache[_this.uid];
                var childGroupViewModel = _this.childGroupViewModel();
                _this.childGroupViewModel().dispose();
                if (childGroupViewModel) {
                    childGroupViewModel.dispose();
                }
                if (_this._disposables) {
                    _this._disposables.forEach(function (disposable) {
                        if (disposable.dispose) {
                            disposable.dispose();
                        }
                    });
                    _this._disposables.length = 0;
                }
            };
            this.supportsScopedSearch = ko.pureComputed(function () {
                return !_this.isLeafNode() && _this._node.canSearchChildren();
            });
            this.actions = function () {
                var actionsKey = "__actions";
                var actions = _this[actionsKey];
                if (!actions) {
                    var allActions = [];
                    if (_this._node.Actions) {
                        allActions = _this._node.Actions.concat(_this.viewModelActions());
                    }
                    else {
                        allActions = _this.viewModelActions();
                    }
                    var sortedActions = underscore.sortBy(allActions, NodeViewModel._getSortIndex);
                    actions = sortedActions.map(function (action) { return new ActionViewModel(action, _this._attributeResolver, _this._host); });
                    Array.prototype.push.apply(_this._disposables, actions);
                    _this[actionsKey] = actions;
                }
                return actions;
            };
            this.viewModelActions = function () {
                var actions = [];
                if (_this.supportsScopedSearch()) {
                    actions.push(NodeViewModel.scopedSearchAction);
                }
                return actions;
            };
            this.properties = function () {
                var propertiesKey = "__properties";
                var properties = _this[propertiesKey];
                if (!properties) {
                    if (_this._node.Properties) {
                        var sortedProperties = underscore.sortBy(_this._node.Properties, NodeViewModel._getSortIndex);
                        properties = sortedProperties.map(function (property) { return new ReadOnlyPropertyViewModel(property, _this._attributeResolver, _this._host); });
                        Array.prototype.push.apply(_this._disposables, properties);
                    }
                    else {
                        properties = [];
                    }
                    _this[propertiesKey] = properties;
                }
                return properties;
            };
            this.clearHighlightLocations = function () {
                if (_this._highlightLocations && _this._highlightLocations().length > 0) {
                    _this._highlightLocations([]);
                }
            };
            this.addHighlightLocation = function (locationInfo) {
                _this._highlightLocations.push(locationInfo);
            };
            this._getBaseDisplayName = function () {
                return _this._displayNameValue();
            };
            this.displayName = ko.pureComputed(function () { return _this._getBaseDisplayName(); });
            this.displayNameHighlightParts = ko.pureComputed(function () {
                var baseDisplayName = _this._getBaseDisplayName();
                var highlightLocations = _this._highlightLocations();
                var displayNameParts = [];
                if (highlightLocations.length > 0) {
                    var highlightMap = [];
                    for (var i = 0; i < baseDisplayName.length; i++) {
                        highlightMap[i] = false;
                    }
                    highlightLocations.forEach(function (highlightLocation) {
                        for (var h = highlightLocation.start; h <= highlightLocation.end; h++) {
                            highlightMap[h] = true;
                        }
                    });
                    var currentNamePart = { val: "", highlight: false };
                    for (var charIndex = 0; charIndex < baseDisplayName.length; charIndex++) {
                        if (highlightMap[charIndex] !== currentNamePart.highlight) {
                            displayNameParts.push(currentNamePart);
                            currentNamePart = { val: "", highlight: highlightMap[charIndex] };
                        }
                        currentNamePart.val += baseDisplayName.charAt(charIndex);
                    }
                    displayNameParts.push(currentNamePart);
                }
                else {
                    displayNameParts.push({ val: baseDisplayName, highlight: false });
                }
                if (Debug.isDebug()) {
                    displayNameParts.push({ val: " [" + _this.uid + "]", highlight: false });
                }
                return displayNameParts;
            });
            this.displayStatus = ko.pureComputed(function () {
                var displayStatus = "";
                var status = _this._statusValue();
                if (status) {
                    displayStatus = " (" + status + ")";
                }
                return displayStatus;
            });
            this.depth = ko.pureComputed(function () {
                if (_this.parent()) {
                    return _this.parent().depth() + 1;
                }
                else {
                    return 0;
                }
            });
            this.paddingLeftPx = ko.pureComputed(function () {
                // 23px is the total width of the expander which causes
                // nested nodes to match the VS tree view layout.
                return (23 * _this.depth()) + "px";
            });
            this.hasChildren = ko.pureComputed(function () {
                var childGroupViewModel = _this.childGroupViewModel();
                return !!childGroupViewModel && childGroupViewModel.hasChildren();
            });
            this.refresh = function () {
                var selectedNode = _this._panel.selectedNode();
                var thisNode = _this;
                if (selectedNode === thisNode) {
                    _this._panel.nodeDetailsPanel().updateNode(thisNode);
                }
                // Refresh dynamic attributes so properties that use these attributes will update (if loaders exist for those attributes).
                _this.refreshDynamicAttributes(null);
                _this.resetAndRefreshChildren();
            };
            this.resetAndRefreshChildren = function () {
                _this._node.resetChildren();
                var oldChildGroupViewModel = _this.childGroupViewModel();
                var wasShowingSearchResults = oldChildGroupViewModel.showingSearchResults();
                if (oldChildGroupViewModel) {
                    var newChildGroupViewModel = _this._createNodeGroupViewModel();
                    if (oldChildGroupViewModel.isExpanded()) {
                        newChildGroupViewModel.expand();
                    }
                    _this.childGroupViewModel(newChildGroupViewModel);
                    oldChildGroupViewModel.dispose();
                    if (wasShowingSearchResults) {
                        newChildGroupViewModel.onlyShowSearchResults();
                        _this._panel.refreshSearchOnNode(_this._node);
                    }
                }
            };
            this.addChildNode = function (addedChildNode) {
                var childGroupViewModel = _this.childGroupViewModel();
                if (childGroupViewModel) {
                    return _this._expandAncestorNodes(_this._getAncestorNodes(), 0).then(function () {
                        var node = new Node(_this._host, addedChildNode, _this._node);
                        // this adds to the query handlers
                        _this._node.addChildNode(node);
                        // this adds to the currently displayed children
                        var addedNodeViewModel = childGroupViewModel.addChildNode(node);
                        childGroupViewModel.sortChildren();
                        childGroupViewModel.expand();
                        addedNodeViewModel.select();
                    });
                }
            };
            /**
             * Given the uid of a NodeViewModel, adds said NodeViewModel to the children
             * of this node. If the NodeViewModel doesn't exist, method does nothing.
             */
            this.addChildByUid = function (uid) {
                var childGroupViewModel = _this.childGroupViewModel();
                var nodeViewModelToAdd = NodeViewModel.getNode(uid);
                if (childGroupViewModel && !!nodeViewModelToAdd) {
                    return _this._expandAncestorNodes(_this._getAncestorNodes(), 0).then(function () {
                        childGroupViewModel.addChildNode(nodeViewModelToAdd._node);
                        childGroupViewModel.sortChildren();
                        nodeViewModelToAdd.childGroupViewModel().expand();
                        nodeViewModelToAdd.select();
                    });
                }
            };
            /**
             * Given the name of a child node, finds that node and returns its UID.
             */
            this.findChildNodeByName = function (nameToFind) {
                var result = { uids: [] };
                if (_this._node.hasQueriedForChildren()) {
                    // reset the query handler in case the child we are tyring to find
                    // has been added since the query completed
                    _this._node.resetChildren();
                }
                // leverage Path class to find a specific child
                var path = Path_1.default.parsePathFromString("/" + nameToFind + "/");
                return path.followPath(0, _this._node.getChildrenEnumerator())
                    .then(function (nodes) {
                    if (!!nodes && nodes.length > 0) {
                        // assume the first result is the one we want
                        // go ahead and create the view model so its available in the NodeViewModel cache if it
                        // doesn't already exist
                        result.uids.push(NodeViewModel.createNodeViewModel(nodes[0], _this, _this._panel, _this._host).uid);
                    }
                    return Promise.resolve(result);
                });
            };
            this._getAncestorNodes = function () {
                var ancestorNodes = [];
                var topNode = _this.parent();
                while (topNode && topNode.canExpand() && !topNode.isExpanded()) {
                    ancestorNodes.push(topNode);
                    topNode = topNode.parent();
                }
                return ancestorNodes;
            };
            this._expandAncestorNodes = function (ancestorNodes, level) {
                var expandPromise = Promise.resolve();
                if (level < ancestorNodes.length) {
                    var processingNode = ancestorNodes[level];
                    expandPromise = processingNode.childGroupViewModel().GetAndLoadChildren().then(function () {
                        processingNode.toggle();
                        return _this._expandAncestorNodes(ancestorNodes, level + 1);
                    });
                }
                return expandPromise;
            };
            this.deleteNode = function (selectedChildNode) {
                var parent = _this.parent();
                var parentsChildren = _this.getParentsChildren();
                var indexOfNodeToDelete = parentsChildren.indexOf(_this);
                if (parent) {
                    parent.select();
                    var childGroupViewModel = parent.childGroupViewModel();
                    if (childGroupViewModel) {
                        childGroupViewModel.deleteChild(indexOfNodeToDelete);
                    }
                }
            };
            this.refreshDynamicAttributes = function (attributes) {
                _this._attributeResolver.expireAttributes();
                _this._node.getStatus().then(function (value) {
                    _this._statusValue(value);
                });
            };
            this.triggerAction = function (action, source) {
                if (action.showChildPlaceholder) {
                    var placeholder = new PlaceholderViewModel(_this, _this._panel, _this._host, action);
                    placeholder.showPlaceholderNode();
                }
                else {
                    _this.executeAction(action, source);
                }
            };
            this.getAttributeValueIfLoaded = function (name) {
                var attribute = _this._attributeResolver.getAttributeValueIfLoaded(name);
                return attribute ? attribute.value : undefined;
            };
            this.getAttributesValueIfLoaded = function (names) {
                var requestedAttributes = {};
                if (!names || !names.length) {
                    names = _this.getLoadedAttributeKeys();
                }
                names.forEach(function (name) {
                    requestedAttributes[name] = _this.getAttributeValueIfLoaded(name);
                });
                return requestedAttributes;
            };
            this.getLoadedAttributeKeys = function () {
                return _this._attributeResolver.getLoadedAttributeKeys();
            };
            this.setAttribute = function (attribute) {
                _this._attributeResolver.setAttribute(attribute);
            };
            this.createChildAction = function (action, newChildNameAttr, source) {
                _this._attributeResolver.setAttribute(newChildNameAttr);
                _this.executeAction(action, source);
            };
            this.executeAction = function (action, source) {
                var unwrappedAction, startTelemetryTimer;
                var telemetryType = "ActionNamespace";
                var telemetryProperties = {};
                action.resolveArguments()
                    .then(function (boundArguments) {
                    // The action parameter may be an observable.
                    unwrappedAction = mapping.toJS(action.unwrappedAction);
                    telemetryProperties[telemetryType] = unwrappedAction.namespace.toString(); // Need to capture this as soon as possible
                    startTelemetryTimer = Date.now();
                    // TODO we should only be returning arguments that are asked for.
                    // Always provide the argument which is the uid of the node.
                    var targetArgName = "target";
                    var sourceArgName = "source";
                    var pathArgName = "path";
                    if (!boundArguments[targetArgName]) {
                        boundArguments[targetArgName] = { uids: [_this.uid] };
                    }
                    if (!boundArguments[sourceArgName]) {
                        boundArguments[sourceArgName] = source;
                    }
                    if (!boundArguments[pathArgName]) {
                        boundArguments[pathArgName] = _this.getPath(false);
                    }
                    return _this._host.executeAction(unwrappedAction.namespace, boundArguments);
                }).then(function () {
                    var subscriptionId = "";
                    var resourceIdAttribute = _this.getAttributeValueIfLoaded("id");
                    if (ResourceTypesService.isResourceId(resourceIdAttribute)) {
                        subscriptionId = ResourceTypesService.parseResourceDescriptor(resourceIdAttribute).subscription;
                    }
                    // Telemetry: Send an action telemetry event
                    telemetryProperties[telemetryType + ".elapsed"] = (Date.now() - startTelemetryTimer).toString();
                    telemetryProperties[telemetryType + ".executedFrom"] = source;
                    telemetryProperties[telemetryType + ".subscriptionId"] = subscriptionId;
                    if (telemetryProperties[telemetryType].indexOf("Azure.Actions.Storage") > -1) {
                        // Log extra values specifically for Storage Provider related actions
                        telemetryProperties = _this._handleStorageProviderTelemetryProperties(telemetryType, telemetryProperties);
                    }
                    _this._host.telemetry.sendEvent("CloudHub.executeAction", telemetryProperties);
                }).then(null, function (err) {
                    var message = "The requested action could not be completed."; // Localize
                    _this._showError(err, "NodeViewModel.ExecuteAction", message, telemetryProperties);
                });
            };
            this.onKeyDown = function (data, event) {
                var onKeyDownKey = "__onKeyDown";
                var onKeyDown = _this[onKeyDownKey];
                if (!onKeyDown) {
                    if (_this._node.Actions && underscore.any(_this._node.Actions, function (a) { return a.keyboard && a.keyboard.length > 0; })) {
                        onKeyDown = function (data, event) {
                            var propagate = true;
                            var actionViewModel = NodeViewModel._findMatchingAction(_this.actions(), event);
                            if (actionViewModel && actionViewModel.enabled()) {
                                propagate = false;
                                _this.executeAction(actionViewModel, "Keyboard");
                            }
                            return propagate;
                        };
                    }
                    else {
                        onKeyDown = function (data, event) { return true; };
                    }
                    _this[onKeyDownKey] = onKeyDown;
                }
                return onKeyDown(data, event);
            };
            this.toggle = function () {
                _this.childGroupViewModel().toggle();
            };
            this.isExpanded = ko.pureComputed(function () {
                return _this.childGroupViewModel().isExpanded();
            });
            this.canExpand = ko.pureComputed(function () {
                return _this.childGroupViewModel().canExpand();
            });
            this.executeElementChildrenQuery = function (selector, caseInsensitive) {
                var result = { uids: [] };
                var matches = [];
                return _this.childGroupViewModel().GetAndLoadChildren().then(function () {
                    var adapter = !!caseInsensitive ? NodeViewModel.caseInsensitiveAdapter : NodeViewModel.adapter;
                    _this.childGroupViewModel().children().forEach(function (nodeViewModel) {
                        matches = matches.concat(ccs.select(selector, nodeViewModel, adapter));
                    });
                    result.uids = matches.map(function (nodeViewModel) {
                        return nodeViewModel.uid;
                    });
                    return result;
                });
            };
            this.select = function () {
                _this._pendingActionableErrors = [];
                _this._panel.selectNode(_this);
                _this._panel.scrollToSelected();
            };
            this.selectNext = function () {
                if (_this.hasChildren() && _this.isExpanded() && _this.childGroupViewModel().length() !== 0) {
                    _this.childGroupViewModel().getChild(0).select();
                }
                else {
                    _this.selectNextSibling();
                }
            };
            this.getParentsChildren = function () {
                var parent = _this.parent() || _this._panel;
                return parent.childGroupViewModel().children();
            };
            this.selectNextSibling = function () {
                var parentsChildren = _this.getParentsChildren();
                var myIndex = parentsChildren.indexOf(_this);
                if (myIndex === parentsChildren.length - 1 && !!_this.parent()) {
                    _this.parent().selectNextSibling();
                }
                else if (myIndex !== parentsChildren.length - 1) {
                    parentsChildren[myIndex + 1].select();
                }
                return myIndex;
            };
            this.firstChild = function () {
                if (_this.hasChildren() && _this.isExpanded() && _this.childGroupViewModel().length() !== 0) {
                    return _this.childGroupViewModel().getChild(0);
                }
            };
            this.nextSibling = function () {
                var parentsChildren = _this.getParentsChildren();
                var myIndex = parentsChildren.indexOf(_this);
                if (myIndex + 1 < parentsChildren.length) {
                    return parentsChildren[myIndex + 1];
                }
            };
            this.previousSibling = function () {
                var parentsChildren = _this.getParentsChildren();
                var myIndex = parentsChildren.indexOf(_this);
                if (myIndex > 0) {
                    return parentsChildren[myIndex - 1];
                }
            };
            this.selectPrevious = function () {
                var parentsChildren = _this.getParentsChildren();
                var myIndex = parentsChildren.indexOf(_this);
                if (myIndex === 0 && !!_this.parent()) {
                    _this.parent().select();
                }
                else if (myIndex !== 0) {
                    parentsChildren[myIndex - 1].selectLast();
                }
            };
            /* tslint:disable:no-unused-variable  */ // tslint is broken and thinks this isn't used.
            this.selectLast = function () {
                /* tslint:enable */
                if (_this.hasChildren() && _this.isExpanded() && _this.childGroupViewModel().length() !== 0) {
                    _this.childGroupViewModel().getChild(_this.childGroupViewModel().length() - 1).selectLast();
                }
                else {
                    _this.select();
                }
            };
            this.dig = function () {
                if (_this.hasChildren()) {
                    if (_this.canExpand() && !_this.isExpanded()) {
                        _this.toggle();
                    }
                    else {
                        _this.selectNext();
                    }
                }
            };
            this.unDig = function () {
                if (_this.hasChildren() && _this.isExpanded()) {
                    _this.toggle();
                }
                else if (_this.parent()) {
                    _this.parent().select();
                }
            };
            this.executeDefaultAction = function (source) {
                var defaultActionKey = "__defaultAction";
                var defaultAction = _this[defaultActionKey];
                if (!defaultAction) {
                    if (_this.hasChildren()) {
                        defaultAction = _this.toggle;
                    }
                    else if (_this._node.isLeafNode()) {
                        var defaulActionViewModel = underscore.find(_this.actions(), function (actionViewModel) { return actionViewModel.isDefault(); });
                        if (defaulActionViewModel) {
                            defaultAction = function (source) { return _this.executeAction(defaulActionViewModel, source); };
                        }
                    }
                    else {
                        defaultAction = underscore.noop;
                    }
                    _this[defaultActionKey] = defaultAction;
                }
                defaultAction(source);
            };
            this.canLoadMoreChildren = ko.pureComputed(function () {
                var cgvm = (_this.childGroupViewModel) ? _this.childGroupViewModel() : null;
                return (cgvm) ? cgvm.canLoadMoreChildren() : false;
            });
            this.isLoadingMoreChildren = ko.pureComputed(function () {
                var cgvm = (_this.childGroupViewModel) ? _this.childGroupViewModel() : null;
                return (cgvm) ? cgvm.loadingMoreChildren() : false;
            });
            this.handleClick = function () {
                var isDoubleClickKey = "__isDoubleClick";
                var isDoubleClick = _this[isDoubleClickKey];
                if (!isDoubleClick) {
                    _this[isDoubleClickKey] = true;
                    _this.select();
                    setTimeout(function () {
                        if (_this[isDoubleClickKey]) {
                            delete _this[isDoubleClickKey];
                            if (_this._node.isLeafNode() && _this._panel.defaultActionMode === 0 /* SingleClick */) {
                                _this.executeDefaultAction("singleClick");
                            }
                        }
                    }, 400);
                }
                else {
                    delete _this[isDoubleClickKey];
                    _this.executeDefaultAction("doubleClick");
                }
            };
            this.openContextMenu = function (node, e) {
                _this._panel.openContextMenu(node, e);
            };
            this.matches = function (selector, adapter) {
                if (adapter === void 0) { adapter = NodeViewModel.adapter; }
                return ccs.selectorMatches(selector, _this, adapter);
            };
            this.scopedSearch = function () {
                var path = _this.getPath();
                _this._panel.searchViewModel().setSearchValueWithFocus(path);
            };
            this._makeSearchResult = function () {
                if (_this._panel.childGroupViewModel().showingSearchResults()) {
                    _this.childGroupViewModel().onlyShowSearchResults();
                    _this._panel.addSearchNode(_this._node);
                }
            };
            this.getPath = function (trailingSlash) {
                if (trailingSlash === void 0) { trailingSlash = true; }
                var pathKey = "__path";
                var path = _this[pathKey];
                if (!path) {
                    if (!!_this.parent()) {
                        path = _this.parent().getPath() + _this._displayNameValue();
                    }
                    else {
                        path = "/" + _this._displayNameValue();
                    }
                    _this[pathKey] = path;
                }
                return trailingSlash ? (path + "/") : path;
            };
            this.getResourceUid = function () {
                // Resource Uid uniquely represents the actual azure resource that this
                // NodeViewModel represents. It is currently used during searching from
                // multiple queries to prevent duplicates.
                return _this._node.getResourceUid();
            };
            this._createNodeGroupViewModel = function () {
                var nodeGroupViewModel = require("CloudExplorer/UI/NodeGroupViewModel");
                return new nodeGroupViewModel(_this, _this._panel, _this._host, _this._node.getChildrenEnumerator(), _this._host, _this._node.PreExpanded);
            };
            this._handleStorageProviderTelemetryProperties = function (telemetryType, telemetryProperties) {
                var connectionString = _this.getAttributeValueIfLoaded("connectionString");
                var connectionType;
                if (!connectionString) {
                    connectionType = "Attached";
                    telemetryProperties[telemetryType + ".connectionType"] = connectionType;
                    return telemetryProperties;
                }
                if (connectionString.indexOf("UseDevelopmentStorage") > -1) {
                    connectionType = "development";
                }
                else if (connectionString.indexOf("AccountKey") > -1 && connectionString.indexOf("AccountName") > -1) {
                    connectionType = "accountNameAndKey";
                }
                else if (connectionString.indexOf("SharedAccessSignature") > -1) {
                    connectionType = "sharedAccessSignature";
                    var protocolMatch = connectionString.match(/(http|https)::/);
                    if (protocolMatch) {
                        telemetryProperties[telemetryType + ".protocol"] = protocolMatch[0];
                    }
                }
                else {
                    connectionType = "unknown";
                }
                telemetryProperties[telemetryType + ".connectionType"] = connectionType;
                return telemetryProperties;
            };
            this._showError = function (err, telemetryErrorName, simpleMessage, properties) {
                if (!err) {
                    return;
                }
                if (err.name === Errors.errorNames.ActionableError) {
                    var actionableError = err;
                    var innerErrorName = actionableError.innerError.name;
                    if (_this._pendingActionableErrors.indexOf(innerErrorName) < 0) {
                        _this._host.errorsManager.handleActionableError(actionableError)
                            .then(function (retry) {
                            var index = _this._pendingActionableErrors.indexOf(innerErrorName);
                            _this._pendingActionableErrors.splice(index, 1);
                            if (retry) {
                                _this.refresh();
                            }
                            else if (_this.childGroupViewModel() &&
                                _this.childGroupViewModel().loadingMoreChildren()) {
                                _this.resetAndRefreshChildren();
                            }
                        });
                        _this._pendingActionableErrors.push(innerErrorName);
                    }
                }
                else {
                    var errorToLog;
                    var errorMessage;
                    var displayError = false;
                    if (err.name === Errors.errorNames.DisplayableError) {
                        errorToLog = err.error;
                        errorMessage = err.message;
                        displayError = true;
                    }
                    else {
                        errorToLog = err;
                        errorMessage = Utilities.getErrorMessage(err, simpleMessage);
                        displayError = true;
                    }
                    var telemetryError = {
                        name: telemetryErrorName,
                        error: errorToLog,
                        properties: properties
                    };
                    _this._host.telemetry.sendError(telemetryError);
                    if (displayError) {
                        _this._host.executeAction(CloudExplorerActions.showErrorMessageBox, { message: errorMessage });
                    }
                }
            };
            this.uid = node.uid;
            NodeViewModel._nodeCache[this.uid] = this;
            this._disposables = [];
            this._host = host;
            this._panel = panel;
            this._pendingActionableErrors = [];
            this._node = node;
            this.isLeafNode = node.isLeafNode;
            this._attributeResolver = this._node.getAttributeResolver();
            this.childGroupViewModel = ko.observable(this._createNodeGroupViewModel());
            this.isPlaceholder = ko.observable(!!placeholder);
            this.parent = ko.observable(parent);
            this.placeholderViewModel = ko.observable(placeholder);
            this.selected = ko.observable(false);
            this.templateName = ko.observable(templateName || "defaultTreeItemTemplate");
            this.icon = ko.observable(this._node.Icon);
            this.themeSrc = ko.observable(this._node.ThemeSource);
            this._displayNameValue = ko.observable();
            this.displayNameReady = this._node.getDisplayName().then(function (value) {
                _this._displayNameValue(value);
            });
            this._highlightLocations = ko.observableArray();
            this._statusValue = ko.observable();
            this._node.getStatus().then(function (value) {
                _this._statusValue(value);
            });
        }
        NodeViewModel._convertToCloudExplorerRepresentation = function (event) {
            var result = [event.which || event.keyCode];
            if (event.metaKey) {
                result.push(CloudExplorerConstants.keyCodes.MacCommand);
            }
            if (event.ctrlKey) {
                result.push(CloudExplorerConstants.keyCodes.Ctrl);
            }
            if (event.altKey) {
                result.push(CloudExplorerConstants.keyCodes.Alt);
            }
            if (event.shiftKey) {
                result.push(CloudExplorerConstants.keyCodes.Shift);
            }
            return result;
        };
        /**
         * Find first ActionViewModel whose action matches received event
         */
        NodeViewModel._findMatchingAction = function (actionViewModels, event) {
            var match;
            var eventCloudExplorerRepresentation = NodeViewModel._convertToCloudExplorerRepresentation(event);
            for (var i = 0; i < actionViewModels.length; i++) {
                var action = actionViewModels[i].unwrappedAction;
                if (action.keyboard && (action.keyboard.length === eventCloudExplorerRepresentation.length)) {
                    if (underscore.every(action.keyboard, function (keyCode) { return eventCloudExplorerRepresentation.indexOf(keyCode) >= 0; })) {
                        match = actionViewModels[i];
                        break;
                    }
                }
            }
            return match;
        };
        /**
         * Get the sortIndex of an object (if it exists)
         */
        NodeViewModel._getSortIndex = function (obj) {
            // If sortIndex hasn't been set, set to default
            var defaultSortIndex = 500;
            return (obj.sortIndex === null || obj.sortIndex === undefined) ? defaultSortIndex : obj.sortIndex;
        };
        return NodeViewModel;
    }());
    NodeViewModel.adapter = new NodeAdapter(false);
    NodeViewModel.caseInsensitiveAdapter = new NodeAdapter(true);
    // Use this wrapper method in place of the constructor. This method makes checks the nodeCache
    // before creating the requested nodeViewModel.
    NodeViewModel.createNodeViewModel = function (node, parent, panel, host, templateName, placeholder) {
        var cacheModel = NodeViewModel.getNode(node.uid);
        if (cacheModel) {
            return cacheModel;
        }
        else {
            return new NodeViewModel(node, parent, panel, host, templateName, placeholder);
        }
    };
    NodeViewModel.getNode = function (uid) {
        return uid !== undefined ? NodeViewModel._nodeCache[uid] : undefined;
    };
    NodeViewModel.addToNodeCache = function (nodeToAdd) {
        NodeViewModel._nodeCache[nodeToAdd.uid] = nodeToAdd;
    };
    NodeViewModel.removeFromNodeCache = function (uid) {
        delete NodeViewModel._nodeCache[uid];
    };
    NodeViewModel.getNodes = function (uids, compact) {
        if (compact === void 0) { compact = true; }
        var results = uids.map(function (uid) { return NodeViewModel._nodeCache[uid]; });
        if (compact) {
            results = underscore.compact(results);
        }
        return results;
    };
    /**
     * Adds the NodeViewModel with the given uid to the search results (if in search mode).
     */
    NodeViewModel.makeSearchResult = function (nodeUid) {
        var newSearchResult = NodeViewModel.getNode(nodeUid);
        if (!!newSearchResult) {
            newSearchResult._makeSearchResult();
        }
    };
    NodeViewModel._nodeCache = {};
    NodeViewModel.scopedSearchAction = {
        displayName: {
            resource: { resourceId: "Actions.Resources.ScopedSearch", namespace: AzureResources.commonNamespace }
        },
        visible: {
            value: true
        },
        icon: AzureConstants.imagePaths.SearchIcon,
        namespace: "CloudExplorer.ElementInteraction.scopedSearch",
        // one less than "Refresh" action
        sortIndex: 999
    };
    return NodeViewModel;
});
