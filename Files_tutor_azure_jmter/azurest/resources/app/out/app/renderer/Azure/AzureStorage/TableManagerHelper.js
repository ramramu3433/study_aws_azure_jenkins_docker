"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var AzureStorage = require("azure-storage");
var Constants = require("../../../Constants");
var _ = require("underscore");
var Utilities = require("../../../Utilities");
/**
 * Resolves entity values according to each property's given EDM type.
 *
 * This ensures that the Azure client API passes properties correctly to Azure.
 */
function resolveEntityValues(entity) {
    for (var propertyName in entity) {
        if (propertyName === "PartitionKey" || propertyName === "RowKey" || propertyName === "Timestamp") {
            continue;
        }
        var property = entity[propertyName];
        property._ = resolvePropertyValue(property);
    }
    return entity;
}
exports.resolveEntityValues = resolveEntityValues;
/**
 * Ensures that a property with a certain EDM type has an appropiate Javascript type for its value.
 *
 * This makes sure the client library interprets the correct EDM type, as the client library does not always
 * honor explicitely set EDM types.
 *
 * For example, sending an Edm.Int32 value as a string will be interpreted as an
 * Edm.String value.
 */
function resolvePropertyValue(property) {
    var propertyValue = property._;
    var propertyType = property.$;
    switch (propertyType) {
        // Edm.Boolean values must be sent as Javascript booleans.
        case AzureStorage.TableUtilities.EdmType.BOOLEAN:
            return _.isBoolean(propertyValue) ?
                propertyValue :
                String(propertyValue).toLowerCase() === "true";
        // Edm.DateTime values must be sent as Date objects or ISO-formatted strings.
        // We prefer Date objects, because the client library returns Date objects.
        case AzureStorage.TableUtilities.EdmType.DATETIME:
            return _.isDate(propertyValue) || _.isString(propertyValue) ?
                propertyValue :
                new Date(propertyValue.toString());
        // Edm.Int32 values must be sent as Javascript numbers.
        case AzureStorage.TableUtilities.EdmType.INT32:
            return _.isNumber(propertyValue) ?
                propertyValue :
                parseInt(propertyValue, 10);
        // Edm.String, Edm.Binary, and Edm.Guid values must be sent as Javascript strings.
        case AzureStorage.TableUtilities.EdmType.BINARY:
        case AzureStorage.TableUtilities.EdmType.GUID:
        case AzureStorage.TableUtilities.EdmType.STRING:
            return (_.isString(propertyValue)) ? propertyValue : String(propertyValue);
        // We don't need to resolve values for any other datatype.
        default:
            return propertyValue;
    }
}
/**
 * Resolves entity property types according to their values.
 *
 * This ensures that an EDM type is always defined, as the client library doesn't always provide one.
 */
function resolveEntityTypes(entity) {
    for (var propertyName in entity) {
        if (propertyName === "PartitionKey" || propertyName === "RowKey" || propertyName === "Timestamp") {
            continue;
        }
        var property = entity[propertyName];
        property.$ = resolvePropertyType(property);
    }
    return entity;
}
exports.resolveEntityTypes = resolveEntityTypes;
/**
 * Resolves EDM types of entity properties.
 */
function resolvePropertyType(property, propertyName) {
    var propertyValue = property._;
    var propertyType = property.$ || "";
    if (propertyType) {
        return propertyType;
    }
    if (propertyName && (propertyName === "PartitionKey" || propertyName === "RowKey")) {
        return AzureStorage.TableUtilities.EdmType.STRING;
    }
    if (propertyName && propertyName === "Timestamp") {
        // May or may not be called ever?
        return AzureStorage.TableUtilities.EdmType.DATETIME;
    }
    if (_.isBoolean(propertyValue)) {
        return AzureStorage.TableUtilities.EdmType.BOOLEAN;
    }
    if (_.isDate(propertyValue)) {
        return AzureStorage.TableUtilities.EdmType.DATETIME;
    }
    if (_.isNumber(propertyValue)) {
        // Analyze the Javascript number to determine the correct EDM type.
        return resolveNumber(Number(propertyValue));
    }
    return AzureStorage.TableUtilities.EdmType.STRING;
}
/**
 * Resolves the EDM type of a Javascript number.
 *
 * Javascript numbers are received from the client library.
 * A Javascript number can only be either an Edm.Double or an Edm.Int32.
 * Edm.Int64 values are received as Javascript strings.
 */
function resolveNumber(value) {
    if (value % 1 === 0) {
        if (value < Constants.Int64.Min || value > Constants.Int64.Max) {
            // Integers beyond the bounds of Int64 are EDM Double properties.
            return AzureStorage.TableUtilities.EdmType.DOUBLE;
        }
        else if (value < Constants.Int32.Min || value > Constants.Int32.Max) {
            // Integers beyond the bounds of Int32 but within Int64 are EDM Int64 properties.
            if (Utilities.isSafeInteger(value)) {
                return AzureStorage.TableUtilities.EdmType.INT64;
            }
            else {
                // Fallback to EDM String if the value is not a safe integer,
                // that is, it falls outside of range (-2^53 - 1, 2^53 - 1).
                return AzureStorage.TableUtilities.EdmType.STRING;
            }
        }
        else {
            // All other integers are EDM Int32 properties.
            return AzureStorage.TableUtilities.EdmType.INT32;
        }
    }
    else {
        // Non-integer values are EDM Double properties.
        return AzureStorage.TableUtilities.EdmType.DOUBLE;
    }
}
