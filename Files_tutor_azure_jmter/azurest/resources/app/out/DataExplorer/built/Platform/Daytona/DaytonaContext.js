/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "./TelemetryActions", "./DaytonaHostProxy"], function (require, exports, _, TelemetryActions, DaytonaHostProxy) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DaytonaContext = (function () {
        function DaytonaContext() {
            this.parameters = this._getParameters();
            this.hostProxy = new DaytonaHostProxy();
            this.telemetry = new TelemetryActions(this.hostProxy);
        }
        DaytonaContext.prototype._getParameters = function () {
            var query = _.chain(location.search.slice(1).split('&'))
                .map(function (item) { return item.split('='); })
                .compact()
                .object()
                .value();
            return query && query.parameters ?
                JSON.parse(decodeURIComponent(decodeURIComponent(query.parameters))) : null;
        };
        return DaytonaContext;
    }());
    exports.default = DaytonaContext;
});
