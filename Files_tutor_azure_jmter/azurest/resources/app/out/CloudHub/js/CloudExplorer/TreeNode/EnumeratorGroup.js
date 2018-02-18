/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, es6_promise_1) {
    "use strict";
    /*
     * Class which abstracts multiple enumerators as one enumerator
     */
    var EnumeratorGroup = (function () {
        function EnumeratorGroup(enumerators) {
            var _this = this;
            this.forNext = function (callback, count) {
                _this.updateCurrentEnumeratorIndex();
                if (!!_this._enumerators[_this._currentEnumeratorIndex]) {
                    return _this._enumerators[_this._currentEnumeratorIndex].forNext(callback, count);
                }
                return es6_promise_1.Promise.resolve(undefined);
            };
            this.mapNext = function (callback, count) {
                _this.updateCurrentEnumeratorIndex();
                if (!!_this._enumerators[_this._currentEnumeratorIndex]) {
                    return _this._enumerators[_this._currentEnumeratorIndex].mapNext(callback, count);
                }
                return es6_promise_1.Promise.resolve(undefined);
            };
            this.hasNext = function () {
                _this.updateCurrentEnumeratorIndex();
                return !!_this._enumerators[_this._currentEnumeratorIndex];
            };
            this.updateCurrentEnumeratorIndex = function () {
                var currentEnumerator = _this._enumerators[_this._currentEnumeratorIndex];
                while (!!currentEnumerator && !currentEnumerator.hasNext()) {
                    _this._currentEnumeratorIndex++;
                    currentEnumerator = _this._enumerators[_this._currentEnumeratorIndex];
                }
            };
            this._enumerators = enumerators.slice(0);
            this._currentEnumeratorIndex = 0;
        }
        return EnumeratorGroup;
    }());
    return EnumeratorGroup;
});
