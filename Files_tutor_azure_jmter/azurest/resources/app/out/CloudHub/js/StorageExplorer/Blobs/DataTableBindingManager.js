/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "Providers/Common/AzureConstants", "Common/DataTableBuilder", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/Blobs/DataTableOperationManager", "Common/Debug", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities", "datatables", "datatables-colReorder", "datatables-colResize", "jquery-contextMenu"], function (require, exports, ko, AzureConstants, DataTableBuilder, DataTableOperations, DataTableOperationManager, Debug, StorageExplorerConstants, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Custom binding manager of datatable
     */
    var operationManager;
    var dataTableElem;
    var blobListViewModel;
    var blobExplorerViewModel;
    var selected;
    function bindDataTable(element, valueAccessor, allBindings, viewModel, bindingContext) {
        blobListViewModel = bindingContext.$data;
        dataTableElem = $(element);
        blobExplorerViewModel = bindingContext.$parent;
        operationManager = new DataTableOperationManager(dataTableElem, blobListViewModel, blobExplorerViewModel);
        operationManager.bind();
        blobListViewModel.bind(operationManager);
        blobListViewModel.table = DataTableBuilder.createDataTable(dataTableElem, getDataTableSettings());
        $(window).resize(updateTableScrollableRegionHeight);
        operationManager.focusTable(); // Also selects the first row if needed.
    }
    function getDataTableSettings() {
        return {
            "dom": "RZlfrtip",
            "oColReorder": {
                "iFixedColumns": 1
            },
            "bPaginate": true,
            "pagingType": "full_numbers",
            "bProcessing": true,
            "oLanguage": {
                "sEmptyTable": "No data available in this blob container",
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ cached items",
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
            "stateSave": false,
            "bFilter": true,
            "bInfo": true,
            "bLength": false,
            "bLengthChange": false,
            "scrollX": true,
            "scrollCollapse": true,
            "iDisplayLength": 100,
            "aaSorting": [[0, "asc"]],
            "serverSide": true,
            "fnServerData": getServerData,
            "aoColumns": [
                // WARNING!!! SECURITY: If you add new columns, make sure you encode them if they are user strings from Azure (see encodeText)
                // so that they don't get interpreted as HTML in our page.
                {
                    "sTitle": "Name",
                    "mData": "FileName",
                    "mRender": renderName,
                    "sClass": "nameColumnText blobs"
                },
                {
                    "sTitle": "Last Modified",
                    "data": "LastModified",
                    "bSearchable": false,
                    "sType": "date",
                    "defaultContent": ""
                },
                {
                    "sTitle": "Blob Type",
                    "data": "Blob.BlobType",
                    "mRender": formatType,
                    "defaultContent": ""
                },
                {
                    "sTitle": "Content Type",
                    "data": "ContentType",
                    "defaultContent": ""
                },
                {
                    "sTitle": "Size",
                    "data": "Size",
                    "bSearchable": false,
                    "sType": "num",
                    "mRender": formatSize,
                    "defaultContent": "",
                    "sClass": "textRight"
                },
                {
                    sTitle: "Lease State",
                    mRender: formatLeaseState,
                    defaultContent: ""
                },
                {
                    sTitle: "Disk Name",
                    data: "Blob.metadata.microsoftazurecompute_diskname",
                    mRender: encodeText,
                    defaultContent: ""
                },
                {
                    sTitle: "VM Name",
                    data: "Blob.metadata.microsoftazurecompute_vmname",
                    mRender: encodeText,
                    defaultContent: ""
                },
                {
                    sTitle: "Disk Type",
                    data: "Blob.metadata.microsoftazurecompute_disktype",
                    mRender: encodeText,
                    defaultContent: ""
                },
                {
                    sTitle: "Resource Group Name",
                    data: "Blob.metadata.microsoftazurecompute_resourcegroupname",
                    mRender: encodeText,
                    defaultContent: ""
                }
            ],
            "fnRowCallback": bindClientId,
            "fnInitComplete": initializeTable,
            "fnDrawCallback": updateSelectionStatus
        };
    }
    function getServerData(sSource, aoData, fnCallback, oSettings) {
        blobListViewModel.renderNextPageAndupdateCache(sSource, aoData, fnCallback, oSettings);
    }
    /**
     * Bind table data information to row element so that we can track back to the table data
     * from UI elements.
     */
    function bindClientId(nRow, aData) {
        var snapshot = "";
        if (aData.Blob && aData.Blob.Snapshot) {
            snapshot = aData.Blob.Snapshot;
        }
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr, aData.FullName);
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr, aData.ContentType);
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr, snapshot);
        return nRow;
    }
    function selectionChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(".dataTable tr.selected").removeClass("selected");
        bindingContext.$data.selected().forEach(function (b) {
            var snapshot = "";
            if (b.Blob && b.Blob.Snapshot) {
                snapshot = b.Blob.Snapshot;
            }
            var sel = DataTableOperations.getRowSelector([
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr,
                    value: b.FullName
                },
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr,
                    value: b.ContentType
                },
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr,
                    value: snapshot
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
        var bodyHeight = dataTableElem.parents("body").height();
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
        var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
        if (dataTableRows) {
            for (var i = 0; i < dataTableRows.length; i++) {
                var row = dataTableRows.eq(i);
                var name = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
                var contentType = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
                var snapshot = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                if (blobListViewModel.isItemSelected(blobListViewModel.getFlobKeys(name, contentType, snapshot))) {
                    row.addClass("selected");
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
    // Render the name plus any icons as HTML
    function renderName(fileName, type, full) {
        var contentType = full.ContentType || "";
        var icon;
        if (contentType === StorageExplorerConstants.ContentTypes.Folder) {
            icon = "Folder_16x.png";
        }
        else if (contentType === StorageExplorerConstants.ContentTypes.Json) {
            icon = "JSONScript_16x.png";
        }
        else if (contentType.indexOf(StorageExplorerConstants.ContentTypes.ImagePrefix) === 0) {
            icon = "Image_16x.png";
        }
        else if (contentType.indexOf(StorageExplorerConstants.ContentTypes.TextPrefix) === 0) {
            icon = "TextFile_16x.png";
        }
        else if (contentType.indexOf(StorageExplorerConstants.ContentTypes.VideoPrefix) === 0) {
            icon = "Video_16x.png";
        }
        else {
            switch (Utilities.getFileExtension(fileName).toLowerCase()) {
                case ".vhd":
                case ".vhdx":
                    icon = "FileTypes/HardDrive_16x.png";
                    break;
                default:
                    // Generic blob/file icon
                    icon = "Document_16x.png";
                    break;
            }
        }
        var lockedIconHtml = "";
        if (full.Blob && full.Blob.LeaseStatus === AzureConstants.leaseStatuses.locked) {
            // Add locked icon
            lockedIconHtml = "<img src='../../../images/StorageExplorer/Lock_yellow_12x16.png' />";
        }
        lockedIconHtml = "<div class='locked-lease-icon'>" + lockedIconHtml + "</div>";
        var imageHtml = "<img src=\"../../../images/StorageExplorer/" + icon + "\" />";
        // Add name
        var itemHtml = lockedIconHtml + imageHtml + "&nbsp;&nbsp;" + Utilities.htmlEncode(fileName);
        if (full.Blob && full.Blob.Snapshot) {
            itemHtml += " (" + Utilities.htmlEncode(full.Blob.Snapshot) + ")";
        }
        return itemHtml;
    }
    function formatSize(data, type, full) {
        if (data || data === "0") {
            return Utilities.formatSize(Number(data));
        }
        else {
            return "";
        }
    }
    function formatType(data, type, full) {
        if (data !== undefined) {
            switch (data) {
                case "BlockBlob":
                    return "Block Blob";
                case "PageBlob":
                    return "Page Blob";
                case "AppendBlob":
                    return "Append Blob";
                default:
                    return data;
            }
        }
        else {
            return "";
        }
    }
    function formatLeaseState(data, type, full) {
        var state = full.Blob.LeaseState || "";
        var localizedState;
        switch (state) {
            case "available":
                localizedState = "";
                break;
            case "leased":
                localizedState = "Leased"; // localize
                break;
            case "expired":
                localizedState = "Expired"; // Localize
                break;
            case "breaking":
                localizedState = "Breaking"; // Localize
                break;
            case "broken":
                localizedState = "Broken"; // Localize
                break;
            case "":
                localizedState = "";
                break;
            default:
                Debug.fail("Unrecognized lease state " + state);
                localizedState = state;
                break;
        }
        if (state && full.Blob.LeaseDuration === "fixed") {
            localizedState = localizedState + " (Short-term)"; // Localize
        }
        return localizedState;
    }
    /**
     * Encodes the text so it doesn't get interpreted as HTML (which can cause cross-site scripting vulnerabilities)
     */
    function encodeText(data, type, full) {
        if (!!data) {
            return Utilities.htmlEncode(data);
        }
    }
    ko.bindingHandlers.tableSource = {
        init: bindDataTable,
        update: dataChanged
    };
    ko.bindingHandlers.tableSelection = {
        update: selectionChanged
    };
});
