"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var ko = require("knockout");
var path = require("path");
/**
 * View model for Upload Files/Folder dialog
 */
var UploadAzureFilesDialogViewModel = (function (_super) {
    tslib_1.__extends(UploadAzureFilesDialogViewModel, _super);
    function UploadAzureFilesDialogViewModel(args) {
        var _this = _super.call(this) || this;
        _this.browseFilesLabel = "Browse files"; // Localize
        /* Observables */
        _this.uploadFolder = ko.observable();
        _this.title = ko.observable();
        _this.filesOrFolderCaption = ko.observable();
        _this.filePaths = ko.observable();
        _this.filesText = ko.observable();
        // The virtual folder in the storage account to upload to (created if doesn't exist)
        _this.destinationDirectory = ko.observable();
        _this.defaultDestinationDirectory = args.defaultDestinationDirectory;
        _this.addAcceptButton("Upload", // localize
        ko.pureComputed(function () { return _this.filePaths() && !!_this.filePaths().length; }));
        _this.addCancelButton();
        _this.title(args.uploadFolder ? "Upload folder" : "Upload files"); // localize
        _this.filesOrFolderCaption(args.uploadFolder ? "Folder" : "Files"); // localize
        _this.uploadFolder(args.uploadFolder);
        _this.destinationDirectory(args.defaultDestinationDirectory);
        _this.filesText(args.uploadFolder ? "No folder selected" : "No files selected"); // localize
        return _this;
    }
    UploadAzureFilesDialogViewModel.prototype.getResults = function () {
        return {
            filePaths: this.filePaths(),
            destinationDirectory: this.destinationDirectory()
        };
    };
    ;
    UploadAzureFilesDialogViewModel.prototype.browseFiles = function () {
        var _this = this;
        // localize
        var openOperationArgs = {
            message: "Select folder to upload",
            browseForFolder: this.uploadFolder(),
            allowMultiSelect: !this.uploadFolder()
        };
        if (this.uploadFolder()) {
            return DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.getOpenFileDialogResult", openOperationArgs)
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
            return DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.getOpenFileDialogResult", openOperationArgs)
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
    return UploadAzureFilesDialogViewModel;
}(DialogViewModel_1.default));
UploadAzureFilesDialogViewModel.uploadKey = "upload";
exports.default = UploadAzureFilesDialogViewModel;
