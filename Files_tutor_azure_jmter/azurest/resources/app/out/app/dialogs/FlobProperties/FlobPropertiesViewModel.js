"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _ = require("underscore");
var _string = require("underscore.string");
var ko = require("knockout");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var FlobPropertyViewModel_1 = require("./FlobPropertyViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
// Localize
var duplicateNameMessage = "The item already contains metadata with the name \"%s\".\n" +
    "Either update the existing metadata value or choose a different name.\n" +
    "Metadata names are case-insensitive.";
var emptyNameMessage = "Metadata names must not be empty.";
var editablePropertiesNames = [
    "contentType",
    "contentEncoding",
    "contentLanguage",
    "contentMD5",
    "cacheControl",
    "contentDisposition"
];
/**
 * View model for File/Blob Properties dialog
 */
var FlobPropertiesViewModel = (function (_super) {
    tslib_1.__extends(FlobPropertiesViewModel, _super);
    function FlobPropertiesViewModel(parameters) {
        var _this = _super.call(this) || this;
        // Localize
        _this.propertiesLabel = "Properties";
        _this.metadataLabel = "Metadata";
        _this.addLabel = "Add metadata";
        _this.saveButtonLabel = "Save";
        _this.cancelButtonLabel = "Cancel";
        _this.properties = ko.observableArray();
        _this.editableProperties = ko.observableArray();
        _this.metadata = ko.observableArray();
        _this.readOnly = ko.observable(false);
        _this.isEditablePropertiesValid = ko.pureComputed(function () { return _this.editableProperties().every(function (value) { return value.isValid(); }); });
        _this.isMetadataValid = ko.pureComputed(function () { return _this.metadata().every(function (value) { return value.isValid(); }); });
        _this.canSubmitChanges = ko.pureComputed(function () { return _this.isEditablePropertiesValid() && _this.isMetadataValid(); });
        _this.readOnly(parameters.readOnly || false);
        for (var property in parameters.response) {
            if (parameters.response.hasOwnProperty(property)) {
                if (property === "MetaData") {
                    var metadata = parameters.response[property].metadata;
                    for (var metadataProperty in metadata) {
                        _this.metadata.push(_this.createPropertyViewModel(metadataProperty, metadataProperty, metadata[metadataProperty], true /*isMetadata*/));
                    }
                }
                else {
                    var item = _this.createPropertyViewModel(property, _this.capitalize(property), parameters.response[property], false /*isMetadata*/);
                    if (!parameters.readOnly && _.contains(editablePropertiesNames, property)) {
                        _this.editableProperties.push(item);
                    }
                    else {
                        _this.properties.push(item);
                    }
                }
            }
        }
        if (_this.readOnly()) {
            _this.addAcceptButton();
        }
        else {
            _this.addAcceptButton(_this.saveButtonLabel, _this.canSubmitChanges);
            _this.addCancelButton();
        }
        return _this;
    }
    /**
     * Converts first letter of the string to uppercase.
     */
    FlobPropertiesViewModel.prototype.capitalize = function (propName) {
        return propName.charAt(0).toUpperCase() + propName.substr(1);
    };
    FlobPropertiesViewModel.prototype.getResults = function () {
        // If there are any issues with the data entered, we need to inform the user and keep the dialog open.
        for (var i = 0; i < this.metadata().length; i++) {
            var value = this.metadata()[i];
            if (!value.isValid()) {
                DialogOperationRouterProxy_1.default.executeOperation("Environment.Dialogs.showMessageBox", {
                    title: "Storage Explorer",
                    message: value.nameError(),
                    type: "warning"
                });
                return;
            }
        }
        var newMetadata = {};
        this.metadata().forEach(function (element) {
            newMetadata[element.displayName()] = element.actualValue;
        });
        var newEditableProperties = {};
        this.editableProperties().forEach(function (element) {
            newEditableProperties[element.originalName] = element.actualValue;
        });
        var data = {
            properties: newEditableProperties,
            metadata: newMetadata
        };
        return data;
    };
    FlobPropertiesViewModel.prototype.addMetadata = function () {
        var count = 1;
        var newMetadataName = "metadata" + count;
        while (this.metadataNameExists(newMetadataName)) {
            count++;
            newMetadataName = "metadata" + count;
        }
        this.metadata.push(this.createPropertyViewModel(newMetadataName, newMetadataName, "", true /*isMetadata*/));
    };
    FlobPropertiesViewModel.prototype.removeMetadata = function (index) {
        this.metadata.splice(index, 1);
        var previousbutton = (index === 0) ? 0 : (index - 1);
        this.metadata()[previousbutton].isRemoveButtonFocused(true);
    };
    /**
     * Determines whether the specified name is already a name used in the collection of metadata.
     * Although Azure preserves the case, metadata names are functionally case-insensitive.
     */
    FlobPropertiesViewModel.prototype.metadataNameExists = function (name) {
        return this.metadata().some(function (metadata) { return metadata.displayName().toLowerCase() === name.toLowerCase(); });
    };
    /**
     * Determines whether the specified name is used at most once in the collection of metadata.
     */
    FlobPropertiesViewModel.prototype.isMetadataNameUnique = function (name) {
        return this.metadata().filter(function (metadata) { return metadata.displayName().toLowerCase() === name.toLowerCase(); }).length <= 1;
    };
    FlobPropertiesViewModel.prototype.getNameError = function (name) {
        if (_string.isBlank(name)) {
            return emptyNameMessage;
        }
        else if (!this.isMetadataNameUnique(name)) {
            return _string.sprintf(duplicateNameMessage, name);
        }
        return "";
    };
    FlobPropertiesViewModel.prototype.validate = function (metadataViewModel) {
        metadataViewModel.nameError(this.getNameError(metadataViewModel.displayName()));
        metadataViewModel.valueError(metadataViewModel.getValueValidationError());
    };
    FlobPropertiesViewModel.prototype.createPropertyViewModel = function (originalName, displayName, value, isMetadata) {
        var _this = this;
        // Allow encoding for (user-defined) metadata, but not standard properties
        var allowNonAsciiCharacters = isMetadata;
        var viewModel = new FlobPropertyViewModel_1.default(originalName, displayName, value, allowNonAsciiCharacters);
        viewModel.displayName.subscribe(function (displayName) { return _this.validate(viewModel); });
        viewModel.displayValue.subscribe(function (value) { return _this.validate(viewModel); });
        // Manual validation needed to set the initial error state
        this.validate(viewModel);
        return viewModel;
    };
    return FlobPropertiesViewModel;
}(DialogViewModel_1.default));
exports.default = FlobPropertiesViewModel;
