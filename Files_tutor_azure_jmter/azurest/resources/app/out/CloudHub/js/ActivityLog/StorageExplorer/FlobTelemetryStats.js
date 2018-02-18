/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Keeps statistics for various sizes of files/blobs, e.g. how many there are
     * in the range of 0-9 bytes, 10-99 bytes, 100-999 bytes, etc., and can send
     * telemetry about them.
     */
    var FlobTelemetryStats = (function () {
        function FlobTelemetryStats(telemetry, telemetryBaseName, telemetryFlobType // "Blob" or "File"
        ) {
            this._ranges = [];
            this._unknownSizeRange = {
                rangeMinimum: -1,
                rangeMaximum: -1,
                count: 0
            };
            this._telemetry = telemetry;
            this._telemetryBaseName = telemetryBaseName;
            this._telemetryFlobType = telemetryFlobType;
        }
        /**
         * Enumerates through the size ranges we want to consider, until visit function returns false.
         * We currently use the following pattern for our size ranges: 0-9 bytes, 10-99 bytes, 100-999 bytes, etc.
         */
        FlobTelemetryStats._enumerateRanges = function (visit) {
            var nextPowerOf10 = 10;
            var min = 0;
            for (var i = 0;; ++i) {
                var max = nextPowerOf10 - 1;
                var keepGoing = visit(i, min, max);
                if (!keepGoing) {
                    break;
                }
                min = nextPowerOf10;
                nextPowerOf10 = nextPowerOf10 * 10;
            }
        };
        /**
         * Add to the count in the range that matches the given size
         */
        FlobTelemetryStats.prototype.add = function (size) {
            var range = this._findRange(size);
            range.count++;
        };
        FlobTelemetryStats.prototype.sendTelemetry = function () {
            var _this = this;
            [this._unknownSizeRange].concat(this._ranges).forEach(function (range) {
                if (range.count) {
                    // e.g. StorageExplorer.FileDeleteGroupActivity.FileStats
                    _this._telemetry.sendEvent(_this._telemetryBaseName + "." + _this._telemetryFlobType + "Stats", {
                        rangeMin: range.rangeMinimum.toString(),
                        rangeMax: range.rangeMaximum.toString(),
                        count: range.count.toString()
                    });
                }
            });
        };
        FlobTelemetryStats.prototype._findRange = function (n) {
            var _this = this;
            var range;
            if (!(typeof n === "number") || isNaN(n)) {
                return this._unknownSizeRange;
            }
            FlobTelemetryStats._enumerateRanges(function (index, minimum, maximum) {
                // Does that range exist yet?
                range = _this._ranges[index];
                if (!range) {
                    range = {
                        rangeMinimum: minimum,
                        rangeMaximum: maximum,
                        count: 0
                    };
                    _this._ranges[index] = range;
                }
                if (n <= maximum) {
                    // Stop iterating
                    return false;
                }
                return true;
            });
            return range;
        };
        return FlobTelemetryStats;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobTelemetryStats;
});
