/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Utility class to wrap up a property with lazy loading.
     */
    var LazyProperty = (function () {
        /**
         * @constructor
         * @param initializer Function that will be used to initialize the property.
         */
        function LazyProperty(init) {
            var _this = this;
            this._initialized = false;
            /**
             * Gets the value of the property, if it is not initialized,
             * it initializes it.
             */
            this.getValue = function () {
                return new Promise(function (resolve, reject) {
                    // Check if the property is initialized
                    if (!_this._initialized) {
                        // Initialize the property
                        _this._initializer()
                            .then(function (value) {
                            _this._value = value;
                            _this._initialized = true;
                            resolve(_this._value);
                        }, reject);
                    }
                    else {
                        resolve(_this._value);
                    }
                });
            };
            this._initializer = init;
        }
        return LazyProperty;
    }());
    return LazyProperty;
});
