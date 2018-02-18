/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, es6_promise_1) {
    "use strict";
    /*
     * This class is an abstraction of a user inputted string path as an object.
     */
    var Path = (function () {
        function Path() {
            var _this = this;
            this._canceled = false;
            this._paused = false;
            this._resumeFunction = null;
            /**
             * Recursively follows the path by using the enumerator to loop over a node's children
             * and find any whose name is the same as this._parts[currPart]. Will return a list of nodes
             * which are at the end of any matching path of nodes.
             */
            this.followPath = function (currPart, enumerator) {
                if (_this._paused) {
                    return new es6_promise_1.Promise(function (callback, reject) {
                        return _this._resumeFunction = function () {
                            return _this.followPath(currPart, enumerator).then(callback, reject);
                        };
                    });
                }
                var currTarget = _this._parts[currPart];
                var matchingNodes = [];
                return enumerator.forNext(function (node) {
                    return Path.isExactMatch(node, currTarget).then(function (isExactMatchResult) {
                        if (isExactMatchResult) {
                            matchingNodes.push(node);
                        }
                    });
                }, 50).then(function () {
                    if (_this._canceled) {
                        // follow path was cancelled, return []
                        return es6_promise_1.Promise.reject([]);
                    }
                    if (matchingNodes.length > 0) {
                        // we found some nodes which matched the current part of the path we are looking for
                        if (currPart === _this._parts.length - 1) {
                            // no more parts to find, we have successfully followed the path
                            return es6_promise_1.Promise.resolve(matchingNodes);
                        }
                        else {
                            // more parts to find, so recurse over all matching nodes and return their results
                            return es6_promise_1.Promise.all(matchingNodes.map(function (node) {
                                return _this.followPath(currPart + 1, node.getSearchEnumerator(_this._searchTerm));
                            })).then(function (separatedResults) {
                                var concatedResults = [];
                                separatedResults.forEach(function (results) {
                                    Array.prototype.push.apply(concatedResults, results);
                                });
                                return concatedResults;
                            });
                        }
                    }
                    else {
                        // didn't find any nodes which matched
                        if (enumerator.hasNext()) {
                            // the enumerator has more children we can examine
                            return _this.followPath(currPart, enumerator);
                        }
                        else {
                            // the enumerator is a dead end
                            return es6_promise_1.Promise.resolve([]);
                        }
                    }
                });
            };
            this.pause = function () {
                _this._paused = true;
            };
            this.resume = function () {
                if (_this._paused) {
                    _this._paused = false;
                    var resumeFunction = _this._resumeFunction;
                    _this._resumeFunction = null;
                    resumeFunction();
                }
            };
            this.cancel = function () {
                _this._canceled = true;
            };
            this.getSearchTerm = function () {
                return _this._searchTerm;
            };
            this.getParts = function () {
                return _this._parts;
            };
            this.isOnlyRoot = function () {
                return _this._searchTerm === "" && _this._parts.length === 0;
            };
            this.isSearchFromRoot = function () {
                return _this._searchTerm !== "" && _this._parts.length === 0;
            };
            this._parts = [];
            this._searchTerm = "";
        }
        return Path;
    }());
    // Parse out a path object from some string.
    Path.parsePathFromString = function (searchQuery) {
        if (searchQuery.charAt(0) !== "/") {
            // only search queries starting with a / can be a path
            return null;
        }
        // drop the first slash and then remove any repeating /'s
        searchQuery = searchQuery.substr(1).replace(/(\/)\/+/g, "$1");
        var pathParts = searchQuery.split("/");
        // _searchTerm will be an empty string if searchQuery ended with
        // a /, which means it should cause the UI to scope
        var result = new Path();
        result._searchTerm = pathParts.pop();
        result._parts = pathParts;
        return result;
    };
    Path.isExactMatch = function (node, currTarget) {
        return node.getDisplayName().then(function (name) {
            return name === currTarget;
        });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Path;
});
