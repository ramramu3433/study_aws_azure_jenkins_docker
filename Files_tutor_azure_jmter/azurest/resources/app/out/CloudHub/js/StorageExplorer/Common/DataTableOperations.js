/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "underscore.string", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, _, _string, StorageExplorerConstants, Utilities) {
    "use strict";
    function getRowSelector(selectorSchema) {
        var cssAttrMatchTemplate = "[%s=\"%s\"]";
        var selector = "";
        selectorSchema.forEach(function (p) {
            selector += _string.sprintf(cssAttrMatchTemplate, p.key, Utilities.jQuerySelectorEscape(p.value));
        });
        return StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector + selector;
    }
    exports.getRowSelector = getRowSelector;
    function isRowVisible(dataTableScrollBodyQuery, element) {
        var isVisible = false;
        if (dataTableScrollBodyQuery.length && element) {
            var elementRect = element.getBoundingClientRect(), dataTableScrollBodyRect = dataTableScrollBodyQuery.get(0).getBoundingClientRect();
            isVisible = ((elementRect.bottom <= dataTableScrollBodyRect.bottom) && (dataTableScrollBodyRect.top <= elementRect.top));
        }
        return isVisible;
    }
    exports.isRowVisible = isRowVisible;
    function scrollToRowIfNeeded(dataTableRows, currentIndex, isScrollUp) {
        if (dataTableRows.length) {
            var dataTableScrollBodyQuery = $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector), selectedRowElement = dataTableRows.get(currentIndex);
            if (dataTableScrollBodyQuery.length && selectedRowElement) {
                var isVisible = isRowVisible(dataTableScrollBodyQuery, selectedRowElement);
                if (!isVisible) {
                    var selectedRowQuery = $(selectedRowElement), scrollPosition = dataTableScrollBodyQuery.scrollTop(), selectedElementPosition = selectedRowQuery.position().top, newScrollPosition = 0;
                    if (isScrollUp) {
                        newScrollPosition = scrollPosition + selectedElementPosition;
                    }
                    else {
                        newScrollPosition = scrollPosition +
                            ((selectedElementPosition + selectedRowQuery.height()) - dataTableScrollBodyQuery.height());
                    }
                    dataTableScrollBodyQuery.scrollTop(newScrollPosition);
                }
            }
        }
    }
    exports.scrollToRowIfNeeded = scrollToRowIfNeeded;
    function scrollToTopIfNeeded() {
        var $dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector), $dataTableScrollBody = $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector);
        if ($dataTableRows.length && $dataTableScrollBody.length) {
            $dataTableScrollBody.scrollTop(0);
        }
    }
    exports.scrollToTopIfNeeded = scrollToTopIfNeeded;
    function setPaginationButtonEventHandlers() {
        $(StorageExplorerConstants.htmlSelectors.dataTablePaginationButtonSelector).on("mousedown", function (event) {
            // Prevents the table contents from briefly jumping when clicking on "Load more"
            event.preventDefault();
        });
    }
    exports.setPaginationButtonEventHandlers = setPaginationButtonEventHandlers;
    function filterColumns(table, settings) {
        settings.forEach(function (value, index) {
            table.column(index).visible(value, false);
        });
        table.columns.adjust().draw(false);
    }
    exports.filterColumns = filterColumns;
    /**
     * Reorder columns based on current order.
     * If no current order is specified, reorder the columns based on intial order.
     */
    function reorderColumns(table, targetOrder, currentOrder) {
        var columnsCount = targetOrder.length;
        var isCurrentOrderPassedIn = !!currentOrder;
        if (!isCurrentOrderPassedIn) {
            currentOrder = getInitialOrder(columnsCount);
        }
        var isSameOrder = Utilities.isEqual(currentOrder, targetOrder);
        // if the targetOrder is the same as current order, do nothing.
        if (!isSameOrder) {
            // Otherwise, calculate the transformation order.
            // If current order not specified, then it'll be set to initial order,
            //  i.e., either no reorder happened before or reordering to its initial order,
            //  Then the transformation order will be the same as target order.
            // If current order is specified, then a transformation order is calculated.
            //  Refer to calculateTransformationOrder for details about transformation order.
            var transformationOrder = isCurrentOrderPassedIn
                ? calculateTransformationOrder(currentOrder, targetOrder)
                : targetOrder;
            try {
                $.fn.dataTable.ColReorder(table).fnOrder(transformationOrder);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.resolve();
    }
    exports.reorderColumns = reorderColumns;
    function resetColumns(table) {
        $.fn.dataTable.ColReorder(table).fnReset();
    }
    exports.resetColumns = resetColumns;
    /**
     * A table's initial order is described in the form of a natural ascending order.
     * E.g., for a table with 9 columns, the initial order will be: [0, 1, 2, 3, 4, 5, 6, 7, 8]
     */
    function getInitialOrder(columnsCount) {
        return _.range(columnsCount);
    }
    exports.getInitialOrder = getInitialOrder;
    /**
     * Get current table's column order which is described based on initial table. E.g.,
     * Initial order:  I = [0, 1, 2, 3, 4, 5, 6, 7, 8]   <---->   {prop0, prop1, prop2, prop3, prop4, prop5, prop6, prop7, prop8}
     * Current order:  C = [0, 1, 2, 6, 7, 3, 4, 5, 8]   <---->   {prop0, prop1, prop2, prop6, prop7, prop3, prop4, prop5, prop8}
     */
    function getCurrentOrder(table) {
        return $.fn.dataTable.ColReorder(table).fnOrder();
    }
    exports.getCurrentOrder = getCurrentOrder;
    /**
     * Switch the index and value for each element of an array. e.g.,
     * InputArray: [0, 1, 2, 6, 7, 3, 4, 5, 8]
     * Result:     [0, 1, 2, 5, 6, 7, 3, 4, 8]
     */
    function invertIndexValues(inputArray) {
        var invertedArray = [];
        if (inputArray) {
            inputArray.forEach(function (value, index) {
                invertedArray[inputArray[index]] = index;
            });
        }
        return invertedArray;
    }
    exports.invertIndexValues = invertIndexValues;
    /**
     * DataTable fnOrder API is based on the current table. So we need to map the order targeting original table to targeting current table.
     * An detailed example for this. Assume the table has 9 columns.
     * Initial order (order of the initial table):  I = [0, 1, 2, 3, 4, 5, 6, 7, 8]   <---->   {prop0, prop1, prop2, prop3, prop4, prop5, prop6, prop7, prop8}
     * Current order (order of the current table):  C = [0, 1, 2, 6, 7, 3, 4, 5, 8]   <---->   {prop0, prop1, prop2, prop6, prop7, prop3, prop4, prop5, prop8}
     * Target order (order of the targeting table): T = [0, 1, 2, 5, 6, 7, 8, 3, 4]   <---->   {prop0, prop1, prop2, prop5, prop6, prop7, prop8, prop3, prop4}
     * Transformation order: an order passed to fnOrder API that transforms table from current order to target order.
     * When the table is constructed, it has the intial order. After an reordering with current order array, now the table is shown in current order, e.g.,
     * column 3 in the current table is actually column C[3]=6 in the intial table, both indicate the column with header prop6.
     * Now we want to continue to do another reorder to make the target table in the target order. Directly invoking API with the new order won't work as
     * the API only do reorder based on the current table like the first time we invoke the API. So an order based on the current table needs to be calulated.
     * Here is an example of how to calculate the transformation order:
     * In target table, column 3 should be column T[3]=5 in the intial table with header prop5, while in current table, column with header prop5 is column 7 as C[7]=5.
     * As a result, in transformation order, column 3 in the target table should be column 7 in the current table, Trans[3] = 7. In the same manner, we can get the
     * transformation order: Trans = [0, 1, 2, 7, 3, 4, 8, 5, 6]
     */
    function calculateTransformationOrder(currentOrder, targetOrder) {
        var transformationOrder = [];
        if (currentOrder && targetOrder && currentOrder.length === targetOrder.length) {
            var invertedCurrentOrder = invertIndexValues(currentOrder);
            transformationOrder = targetOrder.map(function (value) { return invertedCurrentOrder[value]; });
        }
        return transformationOrder;
    }
    exports.calculateTransformationOrder = calculateTransformationOrder;
    function getDataTableHeaders(table) {
        var columns = table.columns();
        var headers = [];
        if (columns) {
            // table.columns() return ColumnsMethods which is an array of arrays
            var columnIndexes = columns[0];
            if (columnIndexes) {
                headers = columnIndexes.map(function (value) { return $(table.columns(value).header()).html(); });
            }
        }
        return headers;
    }
    exports.getDataTableHeaders = getDataTableHeaders;
});
