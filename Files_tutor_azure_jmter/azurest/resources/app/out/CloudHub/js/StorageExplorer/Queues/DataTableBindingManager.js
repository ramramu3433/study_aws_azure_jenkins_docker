/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore.string", "Common/DataTableBuilder", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/Queues/DataTableOperationManager", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities", "datatables", "datatables-colReorder", "datatables-colResize", "jquery-contextMenu"], function (require, exports, ko, _string, DataTableBuilder, DataTableOperations, DataTableOperationManager, StorageExplorerConstants, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Custom binding manager of datatable
     */
    var $dataTable;
    var queueListViewModel;
    var queueExplorerViewModel;
    var operationManager;
    var selected;
    function bindDataTable(element, valueAccessor, allBindings, viewModel, bindingContext) {
        queueListViewModel = bindingContext.$data;
        $dataTable = $(element);
        queueExplorerViewModel = bindingContext.$parent;
        operationManager = new DataTableOperationManager($dataTable, queueListViewModel, queueExplorerViewModel.queueCommands, queueExplorerViewModel.queueExplorerContext.telemetry);
        queueListViewModel.table = DataTableBuilder.createDataTable($dataTable, getDataTableSettings());
        $(window).resize(updateTableScrollableRegionHeight);
        // Also resize if the body height has changed (e.g., the Query panel gets opened/closed)
        $(".toolbar").resize(updateTableScrollableRegionHeight);
    }
    function getDataTableSettings() {
        return {
            // WARNING!!! SECURITY: If you add new columns, make sure you encode them if they are user strings from Azure (see encodeText)
            // so that they don't get interpreted as HTML in our page.
            "aoColumns": [
                {
                    "sTitle": "ID",
                    "data": "MessageId",
                    "sClass": "nameColumnText"
                },
                {
                    "sTitle": "Message Text",
                    "mData": "MessageText",
                    "sClass": "nameColumnText",
                    "mRender": encodeText
                },
                {
                    "sTitle": "Insertion Time (UTC)",
                    "data": "InsertionTime",
                    "sType": "date"
                },
                {
                    "sTitle": "Expiration Time (UTC)",
                    "data": "ExpirationTime",
                    "sType": "date"
                },
                {
                    "sTitle": "Dequeue Count",
                    "data": "DequeueCount",
                    "sType": "num",
                    "defaultContent": "0"
                },
                {
                    "sTitle": "Size",
                    "data": "EncodeSize",
                    "bSearchable": false,
                    "sType": "num",
                    "mRender": formatSize,
                    "defaultContent": "",
                    "sClass": "textRight"
                }
            ],
            "dom": "RZlfrtip",
            "oColReorder": {
                "iFixedColumns": 1
            },
            "bPaginate": true,
            "pagingType": "full_numbers",
            "bProcessing": true,
            "oLanguage": {
                "sInfo": "",
                "oPaginate": {
                    "sFirst": "<<",
                    "sNext": ">",
                    "sPrevious": "<",
                    "sLast": ">>"
                },
                "oAria": {
                    "paginate": {
                        "first": "First",
                        "next": "Next",
                        "previous": "Previous",
                        "last": "Last"
                    }
                },
                "sProcessing": "<img style=\"width: 36px; height: 36px; \" src=\"../../../images/Common/Halo_ProgressSpinner.svg\">"
            },
            "bFilter": true,
            "bInfo": true,
            "bLength": false,
            "bLengthChange": false,
            "scrollX": true,
            "scrollCollapse": true,
            "iDisplayLength": 100,
            "aaSorting": [],
            "serverSide": true,
            "fnServerData": getServerData,
            "fnRowCallback": bindClientId,
            "fnInitComplete": initializeTable,
            "fnDrawCallback": updateSelectionStatus,
            "footerCallback": updateFooterInfo
        };
    }
    function updateFooterInfo(ignoredNode, data, start, end, ignoredDisplay) {
        var pluralFooterMessageTemplate = "Showing %d of %d messages in queue";
        var singularFooterMessageTemplate = "Showing %d of %d message in queue";
        var $footer = $(StorageExplorerConstants.htmlSelectors.dataTablesInfoSelector);
        var countDisplayed = end - start;
        return queueListViewModel.queueExplorerContext.queueActions.retrieveApproximateMessageCount(queueListViewModel.queueExplorerContext.queueReference).
            then(function (approximateMessageCount) {
            var info = "";
            if (approximateMessageCount) {
                var template = countDisplayed === 1 ? singularFooterMessageTemplate : pluralFooterMessageTemplate;
                info = _string.sprintf(template, countDisplayed, approximateMessageCount);
            }
            else {
                info = "There are no messages in the queue"; // Localize
            }
            $footer.text(info);
        });
    }
    function getServerData(sSource, aoData, fnCallback, oSettings) {
        queueListViewModel.renderNextPageAndupdateCache(sSource, aoData, fnCallback, oSettings);
    }
    /**
     * Bind table data information to row element so that we can track back to the table data
     * from UI elements.
     */
    function bindClientId(nRow, aData) {
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr, aData.MessageId);
        return nRow;
    }
    function formatSize(data, type, full) {
        if (data || data === "0") {
            return Utilities.formatSize(Number(data));
        }
        else {
            return "";
        }
    }
    function selectionChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(".dataTable tr.selected").removeClass("selected");
        bindingContext.$data.selected().forEach(function (m) {
            var sel = DataTableOperations.getRowSelector([
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr,
                    value: m.MessageId
                }
            ]);
            $(sel).addClass("selected");
        });
        selected = bindingContext.$data.selected();
    }
    function dataChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // do nothing for now
    }
    function initializeTable() {
        updateTableScrollableRegionHeight();
        initializeEventHandlers();
    }
    /*
     * Update the table's scrollable region height. So the pagination control is always shown at the bottom of the page.
     */
    function updateTableScrollableRegionHeight() {
        // Add some padding to the table so it doesn't get too close to the container border.
        var dataTablePaddingBottom = 10;
        var bodyHeight = $dataTable.parents("body").height();
        var dataTablesScrollBodyPosY = $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector).offset().top;
        var dataTablesInfoElem = $(".dataTables_info");
        var dataTablesPaginateElem = $(".dataTables_paginate");
        var scrollHeight = bodyHeight - dataTablesScrollBodyPosY - dataTablesPaginateElem.outerHeight(true) - dataTablePaddingBottom;
        // info and paginate control are stacked
        if (dataTablesInfoElem.offset().top < dataTablesPaginateElem.offset().top) {
            scrollHeight -= dataTablesInfoElem.outerHeight(true);
        }
        $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector).outerHeight(scrollHeight);
    }
    function initializeEventHandlers() {
        var $headers = $(StorageExplorerConstants.htmlSelectors.dataTableHeaderTypeSelector);
        $headers.on("keydown", function (event) {
            StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", StorageExplorerConstants.cssColors.commonControlsButtonActive);
            });
            // Also reset color if [shift-] tabbing away from button while holding down 'enter'
            StorageExplorerUtilities.onTab(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        }).on("keyup", function (event) {
            StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        });
    }
    function updateSelectionStatus() {
        var $dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
        if ($dataTableRows) {
            for (var i = 0; i < $dataTableRows.length; i++) {
                var $row = $dataTableRows.eq(i);
                var messageId = $row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableMessageIdAttr);
                if (queueListViewModel.isItemSelected(queueListViewModel.getMessageKey(messageId))) {
                    $row.addClass("selected");
                }
            }
        }
        updateDataTableFocus();
        DataTableOperations.setPaginationButtonEventHandlers();
    }
    // TODO consider centralizing this "post-command" logic into some sort of Command Manager entity.
    // See VSO:166520: "[Storage Explorer] Consider adding a 'command manager' to track command post-effects."
    function updateDataTableFocus() {
        var $activeElement = $(document.activeElement);
        var isFocusLost = $activeElement.is("body"); // When focus is lost, "body" becomes the active element.
        var storageExplorerFrameHasFocus = document.hasFocus();
        if (operationManager) {
            if (isFocusLost && storageExplorerFrameHasFocus) {
                // We get here when no control is active, meaning that the table update was triggered
                // from a dialog, the context menu or by clicking on a toolbar control or header.
                // Note that giving focus to the table also selects the first row if needed.
                // The document.hasFocus() ensures that the table will only get focus when the
                // focus was lost (i.e. "body has the focus") within the Storage Explorer frame
                // i.e. not when the focus is lost because it is in another frame
                // e.g. a daytona dialog or in the Activity Log.
                operationManager.focusTable();
            }
            else {
                // If some control is active, we don't give focus back to the table,
                // just select the first row if needed (empty selection).
                operationManager.selectFirstIfNeeded();
            }
        }
    }
    ko.bindingHandlers.tableSource = {
        init: bindDataTable,
        update: dataChanged
    };
    ko.bindingHandlers.tableSelection = {
        update: selectionChanged
    };
    /**
     * Encodes the text so it doesn't get interpreted as HTML (which can cause cross-site scripting vulnerabilities)
     */
    function encodeText(data, type, full) {
        if (!!data) {
            return Utilities.htmlEncode(data);
        }
    }
});
