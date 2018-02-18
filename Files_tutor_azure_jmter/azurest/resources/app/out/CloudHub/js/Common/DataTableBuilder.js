/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Utilities", "datatables"], function (require, exports, Utilities) {
    "use strict";
    var _telemetry;
    var _telemetryEventName = "CloudHub.Common.DataTableBuilder";
    /**
     * Wrapper function for creating data tables. Call this method, not the
     * data tables constructor when you want to create a data table. This
     * function makes sure that content without a render function is properly
     * encoded to prevent XSS.
     * @param{$dataTableElem} JQuery data table element
     * @param{$settings} Settings to use when creating the data table
     */
    function createDataTable($dataTableElem, settings) {
        return $dataTableElem.DataTable(applyDefaultRendering(settings));
    }
    exports.createDataTable = createDataTable;
    /**
     * Go through the settings for a data table and apply a simple HTML encode to any column
     * without a render function to prevent XSS.
     * @param{settings} The settings to check
     * @return The given settings with all columns having a rendering function
     */
    function applyDefaultRendering(settings) {
        var tableColumns = null;
        if (settings.aoColumns) {
            tableColumns = settings.aoColumns;
        }
        else if (settings.aoColumnDefs) {
            // for tables we use aoColumnDefs instead of aoColumns
            tableColumns = settings.aoColumnDefs;
        }
        // either the settings had no columns defined, or they were called
        // by a property name which we have not used before
        if (!tableColumns) {
            _telemetry.sendEvent(_telemetryEventName, {
                "Action": "applyDefaultRendering",
                "Event": "No rows found.",
                "Table Settings": settings
            });
            return settings;
        }
        for (var i = 0; i < tableColumns.length; i++) {
            // the column does not have a render function
            if (!tableColumns[i].mRender) {
                tableColumns[i].mRender = defaultDataRender;
            }
        }
        return settings;
    }
    /**
     * Default data render function, whatever is done to data in here
     * will be done to any data which we do not specify a render for.
     */
    function defaultDataRender(data, type, full) {
        return Utilities.htmlEncode(data);
    }
});
