/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "CloudExplorer/TreeNode/BindingHandlerSet", "es6-promise", "CloudExplorer/TreeNode/NodeEnumerator"], function (require, exports, BindingHandlerSet_1, rsvp, NodeEnumerator) {
    "use strict";
    var Promise = rsvp.Promise;
    var NodeQueryHandler = (function () {
        function NodeQueryHandler(host, attributeResolver, resourceResolver, children, childrenQuery, parentNode, dontSaveChildren) {
            if (dontSaveChildren === void 0) { dontSaveChildren = false; }
            var _this = this;
            this._hasRanAChildrenQuery = false;
            this._numOfResultsAttribute = "numberOfResults";
            this._dontSaveChildren = false;
            this.getEnumerator = function () {
                return new NodeEnumerator(_this._getNodes, _this._hasMoreNodes);
            };
            this._hasMoreNodes = function (start) {
                if (start < _this._children.length) {
                    // there are nodes in _children from where you want to start
                    return true;
                }
                if (_this._childrenINodeCache && _this._childrenINodeCache.length > 0) {
                    // there are nodes in _childrenINodeCache that have not yet been processed
                    // into _children
                    return true;
                }
                if (!!_this._childrenQuery) {
                    // a query exists
                    if (!_this._hasRanAChildrenQuery) {
                        // no queries have been run, so there may be more children
                        return true;
                    }
                    if (!!_this._currentGetChildrenQueryPromise) {
                        // a query is being run
                        return true;
                    }
                    if (!!_this._continuationToken) {
                        // there is a continuation token to use
                        return true;
                    }
                }
                return false;
            };
            this._getNodes = function (start, count) {
                var Node_LocalRequire = require("CloudExplorer/TreeNode/Node");
                if (_this._currentGetChildrenQueryPromise) {
                    // query exists, wait for it to finish and then run _getNodes again
                    return _this._currentGetChildrenQueryPromise.then(function () {
                        return _this._getNodes(start, count);
                    });
                }
                if (_this._children.length > start) {
                    // there are nodes in _children from where you want to start, so grab a slice
                    // note: although count + start may be greater than _children.length, slice
                    // will NOT error and just give as much as it can
                    return Promise.resolve(_this._children.slice(start, count + start));
                }
                else if (_this._childrenINodeCache.length > 0) {
                    // there are nodes in _childrenINodeCache which need to be processed and then
                    // added to _children
                    var slice = _this._childrenINodeCache.slice(0, count);
                    _this._childrenINodeCache = _this._childrenINodeCache.splice(slice.length);
                    if (_this._dontSaveChildren) {
                        // since we aren't saving/caching the children (aka, putting them in the children list), go ahead and just return
                        // the converted INodes, this saves memory
                        var returnArray = [];
                        slice.forEach(function (iNode) {
                            returnArray.push(new Node_LocalRequire(_this._host, iNode, _this._parentNode));
                        });
                        return Promise.resolve(returnArray);
                    }
                    slice.forEach(function (iNode) {
                        _this._children.push(new Node_LocalRequire(_this._host, iNode, _this._parentNode));
                    });
                    return _this._getNodes(start, count);
                }
                else if (_this._childrenQuery && (!_this._hasRanAChildrenQuery || _this._continuationToken)) {
                    // run a query to get more nodes
                    _this._hasRanAChildrenQuery = true;
                    _this._currentGetChildrenQueryPromise = _this._executeGetChildrenQuery(_this._childrenQuery, _this._continuationToken, count)
                        .then(function (producerResult) {
                        _this._currentGetChildrenQueryPromise = null;
                        _this._continuationToken = producerResult.continuationToken;
                        _this._childrenINodeCache = _this._childrenINodeCache.concat(producerResult.results);
                        return _this._getNodes(start, count);
                    }), function (error) {
                        _this._currentGetChildrenQueryPromise = null;
                    };
                    return _this._currentGetChildrenQueryPromise;
                }
                return Promise.resolve(undefined);
            };
            this._executeGetChildrenQuery = function (query, continuationToken, count) {
                if (continuationToken === void 0) { continuationToken = null; }
                var bindingHandlerSet = new BindingHandlerSet_1.default(query.boundArguments, _this._attributeResolver, _this._resourceResolver);
                return bindingHandlerSet.resolveArguments()
                    .then(function (boundArguments) {
                    if (!!count) {
                        boundArguments[_this._numOfResultsAttribute] = count;
                    }
                    var executeChildrenQueryPromise = _this._host.executeQuery(query.namespace, boundArguments, continuationToken)
                        .then(function (queryResult) {
                        var children = [];
                        // If the result of the query contains an error with it, warn the user.
                        if (queryResult.error) {
                            return Promise.reject(queryResult.error);
                        }
                        if (queryResult.results) {
                            if (queryResult.results.length === 0 && queryResult.noResultsString) {
                                // no results and we have an appropriate string to show
                                children = [{ displayName: { value: queryResult.noResultsString } }];
                            }
                            else {
                                // use the query results as normal
                                children = queryResult.results;
                            }
                        }
                        queryResult.results = children;
                        return Promise.resolve(queryResult);
                    });
                    return executeChildrenQueryPromise;
                });
            };
            this.addNode = function (nodeToAdd) {
                _this._children.push(nodeToAdd);
            };
            this.hasRanAQuery = function () {
                return _this._hasRanAChildrenQuery;
            };
            this._attributeResolver = attributeResolver;
            this._resourceResolver = resourceResolver;
            this._host = host;
            this._childrenINodeCache = children || [];
            this._children = [];
            this._childrenQuery = childrenQuery;
            this._parentNode = parentNode;
            this._dontSaveChildren = dontSaveChildren;
        }
        return NodeQueryHandler;
    }());
    return NodeQueryHandler;
});
