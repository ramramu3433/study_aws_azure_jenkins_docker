define(["require", "exports", "underscore", "../TableEntityProcessor"], function (require, exports, _, TableEntityProcessor) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    // export function setTargetIcon(idToIconHandlerMap: CloudHub.Common.IToolbarElementIdIconMap, $sourceElement: JQuery, toIconState: IconState): void {
    //     if (idToIconHandlerMap) {
    //         var iconId: string = $sourceElement.attr("id");
    //         var iconHandler = idToIconHandlerMap[iconId];
    //         switch (toIconState) {
    //             case IconState.default:
    //                 iconHandler.observable(iconHandler.default);
    //                 break;
    //             case IconState.hoverState:
    //                 iconHandler.observable(iconHandler.hoverState);
    //                 break;
    //             default:
    //                 window.console.log("error");
    //         }
    //     }
    // }
    function addCssClass($sourceElement, cssClassName) {
        if (!$sourceElement.hasClass(cssClassName)) {
            $sourceElement.addClass(cssClassName);
        }
    }
    exports.addCssClass = addCssClass;
    function removeCssClass($sourceElement, cssClassName) {
        if ($sourceElement.hasClass(cssClassName)) {
            $sourceElement.removeClass(cssClassName);
        }
    }
    exports.removeCssClass = removeCssClass;
    /**
     * Get the property union of input entities.
     * Example:
     * Input:
     *  Entities: [{ PrimaryKey, id, Prop1, Prop2 }, { PrimaryKey, id, Prop2, Prop3, Prop4 }]
     * Return:
     *  Union: [PrimaryKey, id, Prop1, Prop2, Prop3, Prop4]
     */
    function getPropertyIntersectionFromTableEntities(entities) {
        var headerUnion = [];
        entities.forEach(function (row) {
            Object.keys(row).forEach(function (key) {
                if ((key !== ".metadata") && !_.contains(headerUnion, key)
                    && key !== TableEntityProcessor.keyProperties.attachments
                    && key !== TableEntityProcessor.keyProperties.etag
                    && key !== TableEntityProcessor.keyProperties.resourceId
                    && key !== TableEntityProcessor.keyProperties.self) {
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
