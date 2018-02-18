/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, es6_promise_1) {
    "use strict";
    var SearchHandler = (function () {
        function SearchHandler(startingEnumerators, searchString) {
            var _this = this;
            this._remainingSlots = 20;
            this._enumeratorQueue = [];
            this._canceled = false;
            this._paused = false;
            this._resumeFunctions = [];
            this.pause = function () {
                _this._paused = true;
            };
            this.resume = function () {
                if (_this._paused) {
                    _this._paused = false;
                    var resumeFunctions = _this._resumeFunctions;
                    _this._resumeFunctions = [];
                    resumeFunctions.forEach(function (resumeFunction) { return resumeFunction(); });
                }
            };
            this.cancel = function () {
                _this._canceled = true;
            };
            this.hasNext = function () {
                return !_this._canceled && _this._enumeratorQueue.length > 0;
            };
            this.matchNext = function (countPerGroup, isMatch, handleMatch) {
                if (!_this.hasNext()) {
                    return;
                }
                if (_this._paused) {
                    return new es6_promise_1.Promise(function (callback, reject) {
                        _this._resumeFunctions.push(function () {
                            _this.matchNext(countPerGroup, isMatch, handleMatch).then(callback, reject);
                        });
                    });
                }
                _this._remainingSlots -= 1;
                var currentEnumerator = _this._enumeratorQueue.shift();
                var matchLoopPromise = currentEnumerator.forNext(function (node) {
                    if (_this._canceled) {
                        return es6_promise_1.Promise.reject("Search canceled.");
                    }
                    if (node.canSearchChildren()) {
                        _this._enumeratorQueue.push(node.getSearchEnumerator(_this._searchString));
                    }
                    return isMatch(node, _this._searchString).then(function (isMatchResult) {
                        if (!_this._canceled && isMatchResult) {
                            handleMatch(node);
                        }
                    });
                }, countPerGroup).then(function () {
                    if (_this._canceled) {
                        return es6_promise_1.Promise.reject("Search canceled.");
                    }
                    if (currentEnumerator.hasNext()) {
                        _this._enumeratorQueue.push(currentEnumerator);
                    }
                    _this._remainingSlots += 1;
                    return _this.matchNext(countPerGroup, isMatch, handleMatch);
                }, function (err) {
                    if (_this._canceled) {
                        return es6_promise_1.Promise.reject("Search canceled.");
                    }
                    _this._remainingSlots += 1;
                    return _this.matchNext(countPerGroup, isMatch, handleMatch);
                });
                var matchLoopPromises = [matchLoopPromise];
                if (!_this._canceled && _this._remainingSlots > 1) {
                    matchLoopPromises.push(_this.matchNext(countPerGroup, isMatch, handleMatch));
                }
                return es6_promise_1.Promise.all(matchLoopPromises);
            };
            startingEnumerators.forEach(function (enumerator) {
                _this._enumeratorQueue.push(enumerator);
            });
            this._searchString = searchString;
        }
        SearchHandler.prototype.addToSearch = function (enumerator) {
            this._enumeratorQueue.unshift(enumerator);
        };
        return SearchHandler;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SearchHandler;
});
