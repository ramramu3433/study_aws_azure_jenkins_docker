/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../Scripts/global.d.ts" />
    /**
     * Contains actions related to the UI.
     */
    var UIActions = (function () {
        function UIActions(host) {
            var _this = this;
            this.refreshNodeChildren = function (query) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.refreshChildren", [{
                            queryResult: queryResult
                        }]);
                });
            };
            this.refreshNodeDynamicAttributes = function (query, attributes) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.refreshDynamicAttributes", [{
                            queryResult: queryResult,
                            attributes: attributes
                        }]);
                });
            };
            this.expand = function (query) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.expand", [{ queryResult: queryResult }]);
                });
            };
            this.addChild = function (query, addedChildNode) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.addChild", [{
                            queryResult: queryResult,
                            addedChildNode: addedChildNode
                        }]);
                });
            };
            this.addChildByUid = function (query, uid) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.addChildByUid", [{
                            queryResult: queryResult,
                            uid: uid
                        }]);
                });
            };
            this.findChildByName = function (query, nameToSelect) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.findChildByName", [{
                            queryResult: queryResult,
                            nameToSelect: nameToSelect
                        }]);
                });
            };
            this.deleteNode = function (query) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.delete", [{
                            queryResult: queryResult
                        }]);
                });
            };
            this.setAttribute = function (query, newAttribute) {
                return _this._getNodes(query).then(function (queryResult) {
                    return _this._host.executeOperation("CloudExplorer.ElementInteraction.setAttribute", [{
                            queryResult: queryResult,
                            newAttribute: newAttribute
                        }]);
                });
            };
            this.getTheme = function () {
                return _this._host.executeOperation("CloudExplorer.Actions.getTheme", []);
            };
            this.addNodeToSearchResults = function (uid) {
                return _this._host.executeOperation("CloudExplorer.ElementInteraction.makeSearchResult", [{
                        uid: uid
                    }]);
            };
            this._getNodes = function (query) {
                var queryString = _this._convertQueryToQueryString(query);
                return _this._host.executeOperation("CloudExplorer.ElementInteraction.query", [{
                        selector: queryString
                    }]);
            };
            this._convertQueryToQueryString = function (query) {
                var queryString = "";
                query.forEach(function (attribute) {
                    queryString += "[" + attribute.name + " = \"" + attribute.value + "\"]";
                });
                return queryString;
            };
            this._host = host;
        }
        return UIActions;
    }());
    return UIActions;
});
