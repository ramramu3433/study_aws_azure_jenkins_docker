/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "knockout", "StorageExplorer/Blobs/BlobListViewModel", "StorageExplorer/Blobs/BlobExplorerContext", "StorageExplorer/Blobs/BlobCommands", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Configurable/Toolbar/Toolbar", "StorageExplorer/Common/NavigationViewModel", "StorageExplorer/Common/AddressBarViewModel", "StorageExplorer/Configurable/ContextMenu", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/Utilities", "StorageExplorer/Common/StorageExplorerUtilities", "../../CloudExplorer/DaytonaTabMessengerProxy", "Providers/Common/AzureConstants", "Common/Debug"], function (require, exports, ko, BlobListViewModel_1, BlobExplorerContext_1, BlobCommands_1, StorageExplorerConstants, Toolbar_1, NavigationViewModel, AddressBarViewModel_1, ContextMenu_1, StorageActionsHelper, Utilities, StorageExplorerUtilities, DaytonaTabMessengerProxy_1, AzureConstants, Debug) {
    "use strict";
    /**
     * View model for the entire Storage Explorer document window for blobs
     */
    var BlobExplorerViewModel = (function () {
        function BlobExplorerViewModel() {
            var _this = this;
            /* Observables */
            this.blobListViewModel = ko.observable();
            this.toolbarViewModel = ko.observable();
            this.addressBarViewModel = ko.observable();
            this.navigationViewModel = ko.observable();
            this.searchText = ko.observable("");
            this.blobUploadTimeMap = {};
            this._setFocus = function () {
                _this.toolbarViewModel().focus();
            };
            this._logTelemetry = function (action) {
                _this.blobExplorerContext.telemetry.sendEvent("StorageExplorer.BlobEditor.Toolbar", {
                    "Action": action
                });
            };
            this.dataTableSearch = function () {
                _this.blobListViewModel().search(_this.searchText());
            };
            this._selected = ko.pureComputed(function () { return _this.blobListViewModel().selected(); });
            this._areItemsSelected = ko.pureComputed(function () { return _this._selected().length > 0; });
            this._showUpload = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canUpload = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._pomptAndUploadFiles = function () {
                var host = _this.blobExplorerContext.hostProxy;
                return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.uploadBlobs,
                    parameters: {
                        uploadFolder: false,
                        defaultDestinationBlobFolder: _this.blobListViewModel().currentFolderPath()
                    }
                }).then(function (parameters) {
                    if (parameters) {
                        _this._uploadFiles(parameters.filePaths, undefined, parameters.defaultBlobType, parameters.autoDetectPageBlobs, parameters.destinationBlobFolder);
                    }
                });
            };
            this._promptAndUploadFolder = function () {
                var defaultDestBlobFolder = Utilities.removeTrailingSlash(_this.blobListViewModel().currentFolderPath());
                var host = _this.blobExplorerContext.hostProxy;
                return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.uploadBlobs,
                    parameters: {
                        uploadFolder: true,
                        defaultDestinationBlobFolder: defaultDestBlobFolder
                    }
                }).then(function (parameters) {
                    if (parameters) {
                        _this._uploadFiles(undefined, parameters.filePaths, parameters.defaultBlobType, parameters.autoDetectPageBlobs, parameters.destinationBlobFolder);
                    }
                });
            };
            this._uploadFiles = function (filePaths, folderPaths, defaultBlobType, autoDetectPageBlobs, destinationBlobFolder) {
                if (filePaths === void 0) { filePaths = []; }
                if (folderPaths === void 0) { folderPaths = []; }
                var host = _this.blobExplorerContext.hostProxy;
                var containerReference = _this.blobExplorerContext.containerReference;
                var commonPath = StorageExplorerUtilities.getCommonFileFolderPath(filePaths.concat(folderPaths));
                var args = {
                    blobContainerRef: {
                        name: containerReference.containerName,
                        connectionString: containerReference.connectionString
                    },
                    destinationPath: _this._sanitizeBlobFolder(destinationBlobFolder),
                    localFileQuery: {
                        folders: folderPaths.map(function (path) { return { path: path }; }),
                        files: filePaths.map(function (path) { return { path: path }; }),
                        errors: []
                    },
                    defaultBlobType: defaultBlobType,
                    autoDetectPageBlobs: autoDetectPageBlobs,
                    commonPath: commonPath
                };
                var queue = { name: "upload" };
                var iterator = {
                    type: "Iterator",
                    properties: {
                        args: args
                    }
                };
                host.executeProviderOperation("JobQueueManager.addIterator", { iterator: iterator, queue: queue });
            };
            this._canOpen = ko.pureComputed(function () {
                return _this.blobCommands.isEnabled("open", _this._selected());
            });
            this.OpenSelected = function () {
                var host = _this.blobExplorerContext.hostProxy;
                var containerReference = _this.blobExplorerContext.containerReference;
                if (_this._isSingleBlobSelected()) {
                    var blob = _this._selected()[0];
                    return host.executeProviderOperation("Azure.Storage.Blobs.open", {
                        blobContainerRef: {
                            name: containerReference.containerName,
                            connectionString: containerReference.connectionString
                        },
                        blobRef: {
                            fileName: blob.FullName,
                            snapshot: blob.Blob.Snapshot,
                            length: blob.Size
                        }
                    });
                }
                else if (_this._isSingleFolderSelected()) {
                    _this.blobListViewModel().navigateToFolder(_this._selected()[0].FullName);
                }
            };
            this._isSingleBlobSelected = function () {
                var items = _this._selected();
                var topLevelBlobs = items.filter(function (item) { return item.ContentType !== StorageExplorerConstants.ContentTypes.Folder; });
                var topLevelFolders = items.filter(function (item) { return item.ContentType === StorageExplorerConstants.ContentTypes.Folder; });
                return topLevelBlobs.length === 1 && topLevelFolders.length === 0;
            };
            this._isSingleFolderSelected = function () {
                var items = _this._selected();
                var topLevelBlobs = items.filter(function (item) { return item.ContentType !== StorageExplorerConstants.ContentTypes.Folder; });
                var topLevelFolders = items.filter(function (item) { return item.ContentType === StorageExplorerConstants.ContentTypes.Folder; });
                return topLevelBlobs.length === 0 && topLevelFolders.length === 1;
            };
            this._download = function () {
                var host = _this.blobExplorerContext.hostProxy;
                var containerReference = _this.blobExplorerContext.containerReference;
                if (_this._isSingleBlobSelected()) {
                    var blob = _this._selected()[0];
                    var saveOperationArgs = {
                        message: "Specify where to save the downloaded blob",
                        defaultName: blob.FileName
                    };
                    return host.executeProviderOperation("Environment.Dialogs.getSaveFileDialogResult", saveOperationArgs)
                        .then(function (filePath) {
                        if (!!filePath) {
                            var args = {
                                blobContainerRef: {
                                    name: containerReference.containerName,
                                    connectionString: containerReference.connectionString
                                },
                                blobRef: {
                                    fileName: blob.FullName,
                                    snapshot: blob.Blob.Snapshot,
                                    length: blob.Size
                                },
                                baseLocalPath: filePath,
                                relativePath: "",
                                localOverwritePolicy: "overwrite",
                                openFile: false
                            };
                            var queue = { name: "download" };
                            var job = {
                                type: "Job",
                                properties: {
                                    args: args
                                }
                            };
                            host.executeProviderOperation("JobQueueManager.addJob", { job: job, queue: queue });
                        }
                    })
                        .catch(function (error) {
                        StorageActionsHelper.showError(host, error, "StorageExplorer.newDownload");
                    });
                }
                else {
                    // Download multiple blobs and/or one or more folders
                    var openOperationArgs = {
                        message: "Select a folder to save the downloaded blobs into",
                        browseForFolder: true,
                        allowMultiSelect: false
                    };
                    return host.executeProviderOperation("Environment.Dialogs.getOpenFileDialogResult", openOperationArgs)
                        .then(function (folderPath) {
                        if (!!folderPath) {
                            var rootDownloadFolder = Utilities.appendPathSeparator(folderPath[0]);
                            var blobsToUpload = [];
                            var foldersToUpload = [];
                            _this._selected().forEach(function (blob) {
                                if (blob.ContentType !== StorageExplorerConstants.ContentTypes.Folder) {
                                    blobsToUpload.push({
                                        fileName: blob.FullName,
                                        snapshot: blob.Blob.Snapshot,
                                        length: blob.Size
                                    });
                                }
                                else {
                                    foldersToUpload.push({
                                        path: blob.FullName
                                    });
                                }
                            });
                            var args = {
                                blobContainerRef: {
                                    name: containerReference.containerName,
                                    connectionString: containerReference.connectionString
                                },
                                blobQuery: {
                                    folders: foldersToUpload,
                                    blobs: blobsToUpload
                                },
                                localPath: rootDownloadFolder,
                                sourceFolder: _this.blobListViewModel().currentFolderPath()
                            };
                            var queue = { name: "download" };
                            var iterator = {
                                type: "Iterator",
                                properties: {
                                    args: args
                                }
                            };
                            host.executeProviderOperation("JobQueueManager.addIterator", { iterator: iterator, queue: queue });
                        }
                    }).catch(function (error) {
                        StorageActionsHelper.showError(host, error, "StorageExplorer._showDownloadMultipleItemsDialog");
                    });
                }
            };
            this._copyUrl = function () {
                return _this.blobCommands.copyUrl(_this._selected(), _this.blobListViewModel());
            };
            /*
            private _deleteBlobs = async (): Promise<void> => {
                if (this._isSingleBlobSelected()) {
                    let blob = this._selected()[0];
                    let host = this.blobExplorerContext.hostProxy;
                    let containerReference = this.blobExplorerContext.containerReference;
        
                    try {
                        let result = await host.executeProviderOperation("Azure.Storage.Blobs.delete", {
                            blobContainerRef: {
                                name: containerReference.containerName,
                                connectionString: containerReference.connectionString
                            },
                            blobRef: {
                                fileName: blob.FullName,
                                snapshot: blob.Blob.Snapshot,
                                length: blob.Size
                            }
                        });
                        if (result) {
                            let container = new BlobFlobContainer(host, containerReference);
                            FlobDeleter.removeEmptyVirtualFoldersFromView(container, this.blobListViewModel());
                            await this._refresh();
                        }
                    } catch (error) {
                        await StorageActionsHelper.showError(host, error, "StorageExplorer.newDeleteBlobs");
                    };
                } else {
                    await this._oldDeleteBlobs();
                }
            }
            */
            this._deleteBlobs = function () {
                return _this.blobCommands.startDeleteBlobsTask(_this.blobListViewModel());
            };
            this._refresh = function () {
                var dataTable;
                _this.blobListViewModel().clearCache();
                _this.blobListViewModel().clearSelection();
                dataTable = _this.blobListViewModel().table.ajax.reload();
                return dataTable;
            };
            this._canCopy = ko.pureComputed(function () { return _this._areItemsSelected() && _this.blobCommands.canCopy(_this._selected()); });
            this._copy = function () {
                _this.blobCommands.copyBlobsToClipboard(_this._selected(), _this.blobListViewModel().currentFolderPath());
            };
            this._showPaste = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canPaste = ko.pureComputed(function () { return _this.blobCommands.canPaste(); });
            this._paste = function () {
                _this.blobCommands.startBlobPasteTask(_this.blobListViewModel().currentFolderPath(), _this.blobListViewModel());
            };
            this._showRename = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canRename = ko.pureComputed(function () { return _this.blobCommands.canRename(_this._selected()); });
            this._rename = function () {
                var promise = _this.blobCommands.startRenameTask(_this.blobListViewModel());
                promise.then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.blobListViewModel().focusDataTable();
                });
            };
            this._showNewFolder = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canNewFolder = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._newFolder = function () {
                _this.blobCommands.newFolder(_this.blobListViewModel().currentFolderPath(), _this.blobListViewModel());
            };
            this._canMakeSnapshot = ko.pureComputed(function () { return _this._areItemsSelected() && _this.blobCommands.canMakeSnapshot(_this._selected()); });
            this._makeSnapshot = function () {
                _this.blobCommands.makeSnapshot(_this._selected(), _this.blobListViewModel());
            };
            this._showPromoteSnapshot = ko.pureComputed(function () { return _this.addressBarViewModel().isFile(); });
            this._canPromoteSnapshot = ko.pureComputed(function () { return _this._areItemsSelected() && _this.blobCommands.canPromoteSnapshot(_this._selected()); });
            this._promoteSnapshot = function () {
                _this.blobCommands.promoteSnapshot(_this._selected(), _this.blobListViewModel());
            };
            this._showManageSnapshots = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canManageSnapshots = ko.pureComputed(function () { return _this._areItemsSelected() && _this.blobCommands.canManageSnapshots(_this._selected()); });
            this._manageSnapshots = function () {
                _this.blobCommands.manageSnapshots(_this.blobListViewModel());
            };
            this._canGenerateSharedAccessSignature = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.generateSharedAccessSignatureCommand, _this._selected()); });
            this._generateSharedAccessSignature = function () {
                _this.blobCommands.generateSharedAccessSignature(_this._selected(), _this.blobListViewModel());
            };
            this._canAcquireLease = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.acquireLeaseCommand, _this._selected()); });
            this._acquireLease = function () {
                _this.blobCommands.acquireLease(_this._selected(), _this.blobListViewModel());
            };
            this._canBreakLease = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.breakLeaseCommand, _this._selected()); });
            this._breakLease = function () {
                _this.blobCommands.breakLease(_this._selected(), _this.blobListViewModel());
            };
            this._canViewBlobProperties = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.showBlobPropertiesCommand, _this._selected()); });
            this._viewBlobProperties = function () {
                _this.blobCommands.showBlobProperties(_this._selected(), _this.blobListViewModel());
            };
            this._canGetFolderStats = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.getFolderStatsCommand, _this._selected()); });
            this._getFolderStats = function () {
                _this.blobCommands.getBlobStats(null /*all*/, _this.blobListViewModel().currentFolderPath());
            };
            this._canGetSelectionStats = ko.pureComputed(function () { return _this.blobCommands.isEnabled(BlobCommands_1.default.getSelectionStatsCommand, _this._selected()); });
            this._getSelectionStats = function () {
                _this.blobCommands.getBlobStats(_this.blobListViewModel().selected(), _this.blobListViewModel().currentFolderPath());
            };
            this._copyAction = {
                type: "action",
                title: "Copy selected Item",
                displayName: "Copy",
                id: StorageExplorerConstants.buttonIds.copy,
                action: this._copy,
                enabled: this._canCopy,
                icon: "images/StorageExplorer/ASX_Copy.svg"
            };
            this._pasteAction = {
                type: "action",
                title: "Paste selected items",
                displayName: "Paste",
                id: StorageExplorerConstants.buttonIds.paste,
                action: this._paste,
                enabled: this._canPaste,
                visible: this._showPaste,
                icon: "images/StorageExplorer/ASX_Paste.svg"
            };
            this._deleteAction = {
                type: "action",
                title: "Delete selected items",
                displayName: "Delete",
                id: StorageExplorerConstants.buttonIds.deleteBlobs,
                action: this._deleteBlobs,
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_Delete.svg"
            };
            this._renameAction = {
                type: "action",
                title: "Rename selected blob or folder",
                displayName: "Rename",
                id: StorageExplorerConstants.buttonIds.rename,
                action: this._rename,
                enabled: this._canRename,
                visible: this._showRename,
                icon: "images/StorageExplorer/ASX_Rename.svg"
            };
            this._downloadAction = {
                type: "action",
                title: "Download selected items",
                displayName: "Download",
                id: StorageExplorerConstants.buttonIds.download,
                action: function () {
                    _this._download();
                },
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_TransferDownload.svg"
            };
            this._openAction = {
                type: "action",
                title: "Open selected item",
                displayName: "Open",
                id: StorageExplorerConstants.buttonIds.openFolder,
                action: this.OpenSelected,
                enabled: this._canOpen,
                icon: "images/StorageExplorer/ASX_Open.svg"
            };
            this._copyUrlAction = {
                type: "action",
                title: "Copy URLs of selected items to clipboard",
                displayName: "Copy URL",
                id: StorageExplorerConstants.buttonIds.copyUrl,
                action: this._copyUrl,
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_Link.svg"
            };
            this._makeSnapshotAction = {
                type: "action",
                title: "Make Snapshot",
                displayName: "Make Snapshot",
                id: StorageExplorerConstants.buttonIds.makeSnapshot,
                action: this._makeSnapshot,
                enabled: this._canMakeSnapshot,
                icon: "images/StorageExplorer/ASX_Camera.svg"
            };
            this._manageSnapshotAction = {
                type: "action",
                title: "Manage Snapshots",
                displayName: "Manage Snapshots",
                id: StorageExplorerConstants.buttonIds.manageSnapshots,
                action: this._manageSnapshots,
                enabled: this._canManageSnapshots,
                visible: this._showManageSnapshots,
                icon: "images/StorageExplorer/ASX_SnapshotManager.svg"
            };
            this._promoteSnapshotAction = {
                type: "action",
                title: "Promote Snapshot",
                displayName: "Promote Snapshot",
                id: StorageExplorerConstants.buttonIds.promoteSnapshot,
                action: this._promoteSnapshot,
                enabled: this._canPromoteSnapshot,
                visible: this._showPromoteSnapshot,
                icon: "images/StorageExplorer/ASX_RestoreSnapshot.svg"
            };
            this._contextMenuActionsConfig = [
                this._openAction,
                {
                    type: "separator"
                },
                this._copyAction,
                this._pasteAction,
                this._renameAction,
                this._deleteAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Get Shared Access Signature...",
                    displayName: "Get Shared Access Signature...",
                    id: "generateSharedAccessSignature",
                    action: this._generateSharedAccessSignature,
                    enabled: this._canGenerateSharedAccessSignature
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Acquire Lease",
                    displayName: "Acquire Lease",
                    id: "acquireLease",
                    action: this._acquireLease,
                    enabled: this._canAcquireLease
                },
                {
                    type: "action",
                    title: "Break Lease",
                    displayName: "Break Lease",
                    id: "breakLease",
                    action: this._breakLease,
                    enabled: this._canBreakLease
                },
                {
                    type: "separator"
                },
                this._makeSnapshotAction,
                this._manageSnapshotAction,
                this._promoteSnapshotAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Blob statistics for selected items and their children",
                    displayName: "Selection Statistics...",
                    id: "getSelectionStats",
                    action: this._getSelectionStats,
                    enabled: this._canGetSelectionStats
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Properties...",
                    displayName: "Properties...",
                    id: "showBlobProperties",
                    action: this._viewBlobProperties,
                    enabled: this._canViewBlobProperties
                }
            ];
            this._toolbarActionsConfig = [
                {
                    type: "dropdown",
                    title: "Upload",
                    displayName: "Upload",
                    id: StorageExplorerConstants.buttonIds.uploadDropdownToggle,
                    action: function () { },
                    enabled: this._canUpload,
                    visible: this._showUpload,
                    icon: "images/StorageExplorer/ASX_TransferUploadDropdown.svg",
                    subgroup: [
                        {
                            type: "action",
                            title: "Upload Folder",
                            displayName: "Upload Folder ...",
                            id: StorageExplorerConstants.buttonIds.uploadFolder,
                            action: function () {
                                _this._promptAndUploadFolder();
                            },
                            enabled: this._canUpload,
                            icon: "../../../images/StorageExplorer/Folder_16x.svg"
                        },
                        {
                            type: "action",
                            title: "Upload Files",
                            displayName: "Upload Files ...",
                            id: StorageExplorerConstants.buttonIds.uploadFiles,
                            action: function () {
                                _this._pomptAndUploadFiles();
                            },
                            enabled: this._canUpload,
                            icon: "../../../images/StorageExplorer/TextFile_16x.svg"
                        }
                    ]
                },
                this._downloadAction,
                {
                    type: "separator"
                },
                this._openAction,
                {
                    type: "action",
                    title: "New Folder",
                    displayName: "New Folder",
                    id: StorageExplorerConstants.buttonIds.newFolder,
                    action: this._newFolder,
                    enabled: this._canNewFolder,
                    visible: this._showNewFolder,
                    icon: "images/StorageExplorer/ASX_Add.svg"
                },
                this._copyUrlAction,
                {
                    type: "dropdown",
                    title: "Select all entitites",
                    displayName: "Select All",
                    id: StorageExplorerConstants.buttonIds.selectAll,
                    action: function () { },
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_CheckboxCheckAllDropdown.svg",
                    subgroup: [
                        {
                            type: "action",
                            title: "Select All in Page",
                            displayName: "Select All in Page",
                            id: StorageExplorerConstants.buttonIds.selectAllInCurrentPage,
                            action: function () { return _this.selectAllInCurrentPage(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        },
                        {
                            type: "action",
                            title: "Select All Cached",
                            displayName: "Select All Cached",
                            id: StorageExplorerConstants.buttonIds.selectAllInCache,
                            action: function () { return _this.selectAllInCache(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        }
                    ]
                },
                {
                    type: "separator"
                },
                this._copyAction,
                this._pasteAction,
                {
                    type: "separator"
                },
                this._renameAction,
                {
                    type: "separator"
                },
                this._deleteAction,
                {
                    type: "separator"
                },
                this._makeSnapshotAction,
                this._manageSnapshotAction,
                this._promoteSnapshotAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Properties",
                    displayName: "Properties",
                    id: "showBlobProperties",
                    action: this._viewBlobProperties,
                    enabled: this._canViewBlobProperties,
                    icon: "../../../images/StorageExplorer/ASX_Properties.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Blob statistics for current folder and subfolders",
                    displayName: "Folder Statistics",
                    id: "getFolderStats",
                    action: this._getFolderStats,
                    enabled: this._canGetFolderStats,
                    icon: "images/StorageExplorer/ASX_AutoSum.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Refresh",
                    displayName: "Refresh",
                    id: StorageExplorerConstants.buttonIds.refresh,
                    action: this._refresh,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Refresh.svg"
                }
            ];
            this.blobExplorerContext = new BlobExplorerContext_1.default();
            window.host = this.blobExplorerContext.hostProxy;
            this.blobCommands = new BlobCommands_1.default(this.blobExplorerContext);
            var blobListViewModel = new BlobListViewModel_1.default(this.blobExplorerContext);
            this.blobListViewModel(blobListViewModel);
            var blobAddress = new AddressBarViewModel_1.default(this.blobListViewModel());
            this.addressBarViewModel(blobAddress);
            this.navigationViewModel(new NavigationViewModel(this.blobListViewModel(), this._logTelemetry));
            this.searchText.subscribe(function () { return _this.dataTableSearch(); });
            this.blobListViewModel().currentFolderPath.subscribe(function () { return _this.searchText(""); });
            if (Debug.isDebug()) {
                this._toolbarActionsConfig.push({
                    type: "separator"
                });
                this._toolbarActionsConfig.push({
                    type: "action",
                    title: "Test Error",
                    displayName: "Test Error",
                    id: "test-error",
                    action: function () { _this.blobCommands.testErrorHandling(); },
                    enabled: ko.observable(true)
                });
            }
            // Must be run after all configs are setup and after all Observables are setup.
            this.toolbarViewModel(new Toolbar_1.default(this._toolbarActionsConfig, function (id) {
                _this.blobExplorerContext.telemetry.sendEvent("StorageExplorer.BlobEditor.Toolbar", {
                    "Action": id
                });
            }));
            new ContextMenu_1.default(this._contextMenuActionsConfig, [".dataTable tr td", ".dataTable tr td *"], function (id) {
                _this.blobExplorerContext.telemetry.sendEvent("StorageExplorer.Blob.contextMenu", {
                    "Action": id
                });
            }, ".selected:last");
            // TODO: Is there any way to know when to turn this off?
            // TODO: Or a better solution?  Consider creating an event listener in environment marshaler
            // Poll for clipboard changes
            // Poll to check if theres been a blob upload, refresh if so
            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var host, checkBlobTimeStamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            host = this.blobExplorerContext.hostProxy;
                            this.blobCommands.checkClipboard(blobListViewModel.selected());
                            return [4 /*yield*/, host.executeProviderOperation("StorageExplorer.Blob.checkBlobTimeStamp", { blobContainerRef: this.blobExplorerContext.containerReference })];
                        case 1:
                            checkBlobTimeStamp = _a.sent();
                            if (checkBlobTimeStamp && this.blobUploadTimeMap[this.blobExplorerContext.containerReference.containerName] !== checkBlobTimeStamp) {
                                this._refresh();
                                this.blobUploadTimeMap[this.blobExplorerContext.containerReference.containerName] = checkBlobTimeStamp;
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, 500);
            DaytonaTabMessengerProxy_1.default.on("tab-active", function () {
                _this._setFocus();
            });
            DaytonaTabMessengerProxy_1.default.on("blob-container.blob-uploaded", function (args) {
                var containerReference = _this.blobExplorerContext.containerReference;
                if (args.containerRef.name === containerReference.containerName && args.containerRef.connectionString === containerReference.connectionString) {
                    _this.blobListViewModel().addFlobToCurrentFolder(args.blob).then(function () {
                        _this.blobListViewModel().redrawTableThrottled();
                    });
                }
            });
        }
        BlobExplorerViewModel.prototype.selectAllInCurrentPage = function () {
            this.blobCommands.selectAllInCurrentPage(this.blobListViewModel());
            this.blobListViewModel().focusDataTable();
        };
        ;
        BlobExplorerViewModel.prototype.selectAllInCache = function () {
            this.blobCommands.selectAllInCache(this.blobListViewModel());
            this.blobListViewModel().focusDataTable();
        };
        BlobExplorerViewModel.prototype.folderNavigateBack = function () {
            this.navigationViewModel().navigateBack();
        };
        BlobExplorerViewModel.prototype.folderNavigateForward = function () {
            this.navigationViewModel().navigateForward();
        };
        BlobExplorerViewModel.prototype.navigateToParentFolder = function () {
            this.navigationViewModel().navigateToParentFolder();
        };
        BlobExplorerViewModel.prototype.handleUploadDrop = function (dropArgs) {
            return this._uploadFiles(dropArgs.filePaths, dropArgs.folderPaths, StorageExplorerConstants.BlobTypes.Default, true, this.blobListViewModel().currentFolderPath());
        };
        BlobExplorerViewModel.prototype._sanitizeBlobFolder = function (folder) {
            return folder
                .trim()
                .replace(/\\/g, "/")
                .replace(/^\/+/g, "")
                .replace(/\/+$/g, "");
        };
        return BlobExplorerViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobExplorerViewModel;
});
