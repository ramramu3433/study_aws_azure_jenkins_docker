"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var ko = require("knockout");
/**
 * View model for adding a new directory dialog
 */
var AddDirectoryViewModel = (function (_super) {
    tslib_1.__extends(AddDirectoryViewModel, _super);
    function AddDirectoryViewModel(parameters) {
        var _this = _super.call(this) || this;
        // Localize
        _this.titleLabel = "Create New Directory";
        _this.directoryNameLabel = "Name:";
        _this.invalidDirectoryNameWarning = "Not a valid directory name.";
        _this.virtualDirectoryWarning = "This will create a virtual folder." +
            " A virtual folder does not actually exist in Azure until you paste, drag or upload blobs into it." +
            " To paste a blob into a virtual folder, copy the blob before creating the folder.";
        _this.isVirtualDirectoryWarningVisible = false;
        if (parameters.isVirtual) {
            _this.titleLabel = "Create New Virtual Directory";
            _this.isVirtualDirectoryWarningVisible = true;
        }
        _this.directoryName = ko.observable("New Directory");
        // Passing undefined will select all the text in the input
        _this.selectedInputText = ko.observable(undefined);
        _this.isNameValid = ko.pureComputed(function () {
            return _this.validateName(_this.directoryName());
        });
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isNameValid);
        _this.addCancelButton();
        return _this;
    }
    AddDirectoryViewModel.prototype.getResults = function () {
        return this.directoryName().trim();
    };
    AddDirectoryViewModel.prototype.validateName = function (directoryName) {
        return directoryName.length > 0;
    };
    return AddDirectoryViewModel;
}(DialogViewModel_1.default));
exports.default = AddDirectoryViewModel;
