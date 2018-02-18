"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("../Common/KnockoutBindings");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var $ = require("jquery");
var ko = require("knockout");
// Localize
var itemNote = "Renaming works by copying to the new name, then deleting the source item. Renaming does not currently preserve snapshot data; renaming a large item or a folder with lots of items may take a while.";
var resourceStrings = {
    blob: {
        title: "Rename Blob",
        note: itemNote
    },
    blobFolder: {
        title: "Rename Blob Folder",
        note: itemNote
    },
    blobContainer: {
        title: "",
        note: "Renaming works by copying to the new name, then deleting the source item. This may take a while if there are lots of blobs."
    },
    file: {
        title: "Rename File",
        note: itemNote
    },
    fileDirectory: {
        title: "Rename Directory",
        note: itemNote
    },
    fileShare: {
        title: "Rename File Share",
        note: "Renaming works by copying to the new name, then deleting the source item. This may take a while if there are lots of files."
    },
    table: {
        title: "Rename Table",
        note: "Renaming works by copying to the new name, then deleting the source item. Renaming a table currently loses the table's properties and metadata, and may take a while if there are lots of entities."
    }
};
/**
 * View model for Rename dialog
 */
var RenameViewModel = (function (_super) {
    tslib_1.__extends(RenameViewModel, _super);
    function RenameViewModel(args) {
        var _this = _super.call(this) || this;
        _this.newName = ko.observable();
        _this.title = resourceStrings[args.resourceType].title;
        _this.renameNote = resourceStrings[args.resourceType].note;
        _this.newNameLabel = "Please specify the new name"; // Localize
        _this.newName(args.originalName);
        _this._originalName = args.originalName;
        _this._isCaseSensitive = args.isCaseSensitive;
        // Passing undefined will select all the text in the input
        // CONSIDER: Better way to handle simply selecting all text
        _this.selectedInputText = ko.observable(undefined);
        _this.addAcceptButton("Rename", ko.pureComputed(function () { return _this._isValid(); }));
        _this.addCancelButton();
        $("#newName").focus();
        return _this;
    }
    /**
     * Called when user hits "Enter" when the rename input box has focus.
     */
    RenameViewModel.prototype.submit = function () {
        if (this._isValid()) {
            this.dialogResult(this.getResults());
        }
    };
    /**
     * @override
     */
    RenameViewModel.prototype.getResults = function () {
        return {
            newName: this.newName()
        };
    };
    ;
    RenameViewModel.prototype._isValid = function () {
        if (!this.newName().length) {
            return false;
        }
        // Do not allow user to enter / and \.
        if (this.newName().match("\\\\|\/")) {
            return false;
        }
        if (this._isCaseSensitive) {
            return this.newName() !== this._originalName;
        }
        else {
            return this.newName().toLowerCase() !== this._originalName.toLowerCase();
        }
    };
    return RenameViewModel;
}(DialogViewModel_1.default));
exports.default = RenameViewModel;
