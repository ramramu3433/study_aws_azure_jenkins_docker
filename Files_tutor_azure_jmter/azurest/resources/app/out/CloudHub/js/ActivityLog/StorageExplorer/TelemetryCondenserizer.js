/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "StorageExplorer/StorageExplorerConstants", "Common/Debug"], function (require, exports, StorageExplorerConstants, Debug) {
    "use strict";
    /**
     * "Condenses" telemetry events by combining them into single events with ".Multiple" appended to
     * the names.  Can generate averages, etc., for specific properties.
     */
    var TelemetryCondenserizer = (function () {
        function TelemetryCondenserizer(telemetry) {
            // Arrays of events, keyed by event name
            this._eventGroups = {};
            this._groupOptions = {};
            this._timeoutHandle = null;
            this._telemetry = telemetry;
        }
        TelemetryCondenserizer.prototype.sendEvent = function (name, properties, options) {
            var event = {
                name: name,
                properties: properties
            };
            var group = this._eventGroups[name];
            if (!group) {
                group = [];
                this._eventGroups[name] = group;
            }
            group.push(event);
            this._groupOptions[name] = options; // Last one wins
            if (group.length >= TelemetryCondenserizer.EventBufferSize) {
                this._flushGroup(name);
            }
            else {
                this._delayFlush();
            }
        };
        TelemetryCondenserizer.prototype._flushGroup = function (name) {
            function setPropertyIfNumber(o, propertyName, value) {
                if (typeof value === "number" && !isNaN(value)) {
                    o[propertyName] = value.toString();
                }
            }
            try {
                var group = this._eventGroups[name];
                if (group) {
                    if (group.length) {
                        var options = this._groupOptions[name];
                        var summaryProperties = {
                            Count: group.length.toString()
                        };
                        // Handle averages for specified properties
                        (options.propertiesToAverage || []).forEach(function (propertyName) {
                            var sum = 0;
                            var count = 0;
                            var min;
                            var max;
                            group.forEach(function (event) {
                                var value = parseFloat(event.properties[propertyName]);
                                if (!isNaN(value)) {
                                    sum += value;
                                    count++;
                                    if (isNaN(min) || value < min) {
                                        min = value;
                                    }
                                    if (isNaN(max) || value > max) {
                                        max = value;
                                    }
                                }
                            });
                            var average = sum / count;
                            // Record the average/min/max
                            setPropertyIfNumber(summaryProperties, propertyName + ".Average", average);
                            setPropertyIfNumber(summaryProperties, propertyName + ".Min", min);
                            setPropertyIfNumber(summaryProperties, propertyName + ".Max", max);
                        });
                        // Handle "combine" for specified properties
                        (options.propertiesToCombine || []).forEach(function (propertyName) {
                            var values = [];
                            group.forEach(function (event) {
                                var value = event.properties[propertyName];
                                if (value && values.indexOf(value) < 0) {
                                    values.push(value);
                                }
                            });
                            // Record the values we found
                            if (values.length) {
                                summaryProperties[propertyName] = values.sort().join(",");
                            }
                        });
                        this._telemetry.sendEvent(group[0].name + ".Multiple", summaryProperties);
                    }
                    delete this._eventGroups[name];
                }
            }
            catch (error) {
                Debug.error(String(error));
            }
        };
        TelemetryCondenserizer.prototype.flush = function () {
            if (this._timeoutHandle !== null) {
                clearTimeout(this._timeoutHandle);
                this._timeoutHandle = null;
            }
            for (var groupName in this._eventGroups) {
                this._flushGroup(groupName);
            }
        };
        TelemetryCondenserizer.prototype._delayFlush = function () {
            var _this = this;
            // Flush every 60 seconds if not otherwise flushed
            if (this._timeoutHandle !== null) {
                clearTimeout(this._timeoutHandle);
            }
            this._timeoutHandle = setTimeout(function () { return _this.flush(); }, TelemetryCondenserizer.FlushTimeoutSeconds * StorageExplorerConstants.Time.MillisecondsPerSecond);
        };
        return TelemetryCondenserizer;
    }());
    TelemetryCondenserizer.EventBufferSize = 100; // Flushes automatically after 50 entries
    TelemetryCondenserizer.FlushTimeoutSeconds = 60;
    return TelemetryCondenserizer;
});
