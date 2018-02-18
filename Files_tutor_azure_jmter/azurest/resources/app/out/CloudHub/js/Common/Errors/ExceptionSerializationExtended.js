/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "./ExceptionSerialization"], function (require, exports, ExceptionSerialization_1) {
    "use strict";
    /**
     * @deprecated
     * Serializes error objects to a generic object.
     *
     * With standarized error handling, some code paths are now receiving Error
     * objects when they are expecting generic objects. This is because
     * Daytona plugins try to pass errors using JSON serialization across
     * iframe boundaries, which doesn't capture any properties in Error objects.
     *
     * Some code paths also aggregate the results of multiple operations and
     * pass these results to clients in other iframes. The same problem occurs.
     *
     * This method works around that problem by converting Error objects into
     * generic objects in order to preserve error info. Because this method
     * breaks the rule that only proxies should handle error serialization, it
     * is not recommended this method be used often.
     */
    function serializeToObject(error) {
        /* tslint:disable no-console*/
        console.warn("Serializing errors to generic objects is not recommended. Only proxies should handle serialization.");
        /* tslint:enable */
        var result = { name: error.name, message: error.message };
        Object.getOwnPropertyNames(error).forEach(function (prop) {
            result[prop] = error[prop];
        });
        return result;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        serialize: ExceptionSerialization_1.default.serialize,
        deserialize: ExceptionSerialization_1.default.deserialize,
        summarize: ExceptionSerialization_1.default.summarize,
        serializeToObject: serializeToObject
    };
});
