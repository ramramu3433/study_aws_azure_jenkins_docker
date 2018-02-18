"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var CosmosDBConnectionString = (function () {
    function CosmosDBConnectionString(defaultExperience, connectionString) {
        this._accountEndpointSegmentKey = "AccountEndpoint";
        this._accountKeySegmentKey = "AccountKey";
        this._tableEndpointSegmentKey = "TableEndpoint";
        var result;
        if (defaultExperience === "MongoDB") {
            result = this._parseMongoDBConnectionString(connectionString);
        }
        else {
            result = this._parseCommonConnectionString(connectionString);
        }
        this.accountEndpoint = result.accountEndpoint;
        this.accountKey = result.accountKey;
    }
    CosmosDBConnectionString.prototype._parseCommonConnectionString = function (connectionString) {
        var keyValuePairs = {};
        if (connectionString) {
            // split string to get key value pairs
            connectionString.split(";").forEach(function (segment) {
                var separator = segment.indexOf("=");
                if (separator !== -1) {
                    // found the separator in the string
                    var key = segment.substring(0, separator);
                    var value = segment.substring(separator + 1);
                    keyValuePairs[key] = value;
                }
            });
        }
        if (keyValuePairs[this._tableEndpointSegmentKey]) {
            keyValuePairs[this._accountEndpointSegmentKey] = keyValuePairs[this._tableEndpointSegmentKey];
        }
        return {
            accountEndpoint: keyValuePairs[this._accountEndpointSegmentKey] || "",
            accountKey: keyValuePairs[this._accountKeySegmentKey] || ""
        };
    };
    CosmosDBConnectionString.prototype._parseMongoDBConnectionString = function (connectionString) {
        var endpoint = "";
        var key = "";
        var separator = connectionString.indexOf("@");
        if (separator !== -1) {
            var nameKey = connectionString.substring(0, separator).replace("mongodb://", "");
            separator = nameKey.indexOf(":");
            if (separator !== -1) {
                endpoint = "https://" + nameKey.substring(0, separator) + ".documents.azure.com:443/";
                key = nameKey.substring(separator + 1);
            }
        }
        return {
            accountEndpoint: endpoint,
            accountKey: key
        };
    };
    return CosmosDBConnectionString;
}());
exports.default = CosmosDBConnectionString;
