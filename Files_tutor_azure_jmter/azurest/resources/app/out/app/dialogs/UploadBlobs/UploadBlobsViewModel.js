"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var BlobType_1 = require("../../renderer/JobHandlers/Blob/BlobType");
var ko = require("knockout");
var path = require("path");
/**
 * View model for Upload Files/Folder dialog
 */
var UploadBlobsDialogViewModel = (function (_super) {
    tslib_1.__extends(UploadBlobsDialogViewModel, _super);
    function UploadBlobsDialogViewModel(args) {
        var _this = _super.call(this) || this;
        _this.uploadAsPageLabel = "Upload .vhd/vhdx files as page blobs (recommended)"; // Localize
        _this.browseFilesLabel = "Browse Files"; // Localize
        _this.availableBlobTypes = [
            { display: "Block Blob", value: BlobType_1.default.Block },
            { display: "Page Blob", value: BlobType_1.default.Page },
            { display: "Append Blob", value: BlobType_1.default.Append }
        ];
        /* Observables */
        _this.uploadFolder = ko.observable();
        _this.title = ko.observable();
        _this.filesOrFolderCaption = ko.observable();
        _this.filePaths = ko.observable();
        _this.filesText = ko.observable();
        // Default to block blobs
        _this.blobType = ko.observable(_this.availableBlobTypes[0]);
        // The virtual folder in the storage account to upload to (created if doesn't exist)
        _this.destinationBlobFolder = ko.observable();
        _this._uploadVhdsAsPageBlobsUserChecked = ko.observable(true);
        _this.defaultDestinationBlobFolder = args.defaultDestinationBlobFolder;
        _this.addAcceptButton("Upload", // localize
        ko.pureComputed(function () { return _this.filePaths() && !!_this.filePaths().length; }));
        _this.addCancelButton();
        _this.uploadFolder(args.uploadFolder);
        _this.destinationBlobFolder(args.defaultDestinationBlobFolder);
        if (args.uploadFolder) {
            _this.title("Upload folder"); // localize
            _this.filesOrFolderCaption("Folder"); // localize
            _this.filesText("No folder selected"); // localize
        }
        else {
            _this.title("Upload files"); // localize
            _this.filesOrFolderCaption("Files"); // localize
            _this.filesText("No files selected"); // localize
        }
        _this.uploadVhdsAsPageBlobs = ko.computed({
            read: function () { return _this.blobType().value === BlobType_1.default.Page ? true : _this._uploadVhdsAsPageBlobsUserChecked(); },
            write: function (value) { return _this._uploadVhdsAsPageBlobsUserChecked(value); }
        });
        _this.uploadVhdsAsPageBlobsEnabled = ko.computed(function () { return _this.blobType().value !== BlobType_1.default.Page; });
        return _this;
    }
    UploadBlobsDialogViewModel.prototype.getResults = function () {
        return {
            filePaths: this.filePaths(),
            defaultBlobType: this.blobType().value,
            destinationBlobFolder: this.destinationBlobFolder(),
            autoDetectPageBlobs: this.uploadVhdsAsPageBlobs()
        };
    };
    UploadBlobsDialogViewModel.prototype.browseFiles = function () {
        var _this = this;
        var operationArgs = {
            message: "Select folder to upload",
            browseForFolder: this.uploadFolder(),
            allowMultiSelect: !this.uploadFolder()
        };
        if (this.uploadFolder()) {
            return DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.getOpenFileDialogResult", operationArgs)
                .then(function (folderPaths) {
                if (folderPaths && folderPaths.length) {
                    var folderPath = folderPaths[0];
                    _this.filePaths(folderPaths);
                    // Show folder in the textbox
                    _this.filesText(folderPath);
                }
            });
        }
        else {
            return DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.getOpenFileDialogResult", operationArgs)
                .then(function (filePaths) {
                if (filePaths && filePaths.length) {
                    _this.filePaths(filePaths);
                    // Show files in the textbox
                    var fileNames = _this.filePaths().map(function (filepath) { return path.basename(filepath); });
                    _this.filesText(fileNames.join(", "));
                }
            });
        }
    };
    return UploadBlobsDialogViewModel;
}(DialogViewModel_1.default));
UploadBlobsDialogViewModel.uploadKey = "upload";
exports.default = UploadBlobsDialogViewModel;
