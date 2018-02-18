/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Common/Errors", "Common/Debug"], function (require, exports, _, Errors, Debug) {
    "use strict";
    var IconState;
    (function (IconState) {
        IconState[IconState["default"] = 0] = "default";
        IconState[IconState["hoverState"] = 1] = "hoverState";
        IconState[IconState["toggleOn"] = 2] = "toggleOn";
    })(IconState = exports.IconState || (exports.IconState = {}));
    function containMultipleItems(items) {
        return items && (items.length > 1);
    }
    exports.containMultipleItems = containMultipleItems;
    function containSingleItem(items) {
        return items && (items.length === 1);
    }
    exports.containSingleItem = containSingleItem;
    function containItems(items) {
        return items && (items.length > 0);
    }
    exports.containItems = containItems;
    function setTargetIcon(idToIconHandlerMap, $sourceElement, toIconState) {
        if (idToIconHandlerMap) {
            var iconId = $sourceElement.attr("id");
            var iconHandler = idToIconHandlerMap[iconId];
            Debug.assert(!!iconHandler, "Missing iconHandler for icon " + iconId);
            switch (toIconState) {
                case IconState.default:
                    iconHandler.observable(iconHandler.default);
                    break;
                case IconState.hoverState:
                    iconHandler.observable(iconHandler.hoverState);
                    break;
                default:
                    throw new Errors.ArgumentOutOfRangeError("toIconState");
            }
        }
    }
    exports.setTargetIcon = setTargetIcon;
    /**
     * Get the property union of input entities.
     * Example:
     * Input:
     *  Entities: [{ PrimaryKey, RowKey, Prop1, Prop2 }, { PrimaryKey, RowKey, Prop2, Prop3, Prop4 }]
     * Return:
     *  Union: [PrimaryKey, RowKey, Prop1, Prop2, Prop3, Prop4]
     */
    function getPropertyIntersectionFromTableEntities(entities) {
        var headerUnion = [];
        entities.forEach(function (row) {
            Object.keys(row).forEach(function (key) {
                if ((key !== ".metadata") && !_.contains(headerUnion, key)) {
                    headerUnion.push(key);
                }
            });
        });
        return headerUnion;
    }
    exports.getPropertyIntersectionFromTableEntities = getPropertyIntersectionFromTableEntities;
    /**
     * Compares the names of two Azure table columns and returns a number indicating which comes before the other.
     * System-defined properties come before custom properties. Otherwise they are compared using string comparison.
     */
    function compareTableColumns(a, b) {
        if (a === "PartitionKey") {
            if (b !== "PartitionKey") {
                return -1;
            }
        }
        else if (a === "RowKey") {
            if (b === "PartitionKey") {
                return 1;
            }
            else if (b !== "RowKey") {
                return -1;
            }
        }
        else if (a === "Timestamp") {
            if (b === "PartitionKey" || b === "RowKey") {
                return 1;
            }
            else if (b !== "Timestamp") {
                return -1;
            }
        }
        else if (b === "PartitionKey" || b === "RowKey" || b === "Timestamp") {
            return 1;
        }
        return a.localeCompare(b);
    }
    exports.compareTableColumns = compareTableColumns;
    /**
     * DataTableBindingManager registers an event handler of body.resize and recalculates the data table size.
     * This method forces the event to happen.
     */
    function forceRecalculateTableSize() {
        $("body").trigger("resize");
    }
    exports.forceRecalculateTableSize = forceRecalculateTableSize;
    /**
     * Turns off the spinning progress indicator on the data table.
     */
    function turnOffProgressIndicator() {
        $("div.dataTables_processing").hide();
    }
    exports.turnOffProgressIndicator = turnOffProgressIndicator;
});
