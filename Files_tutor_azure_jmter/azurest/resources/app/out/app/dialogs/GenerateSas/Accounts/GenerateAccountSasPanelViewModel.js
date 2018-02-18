"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var SasUtilities = require("../SasUtilities");
var Errors_1 = require("../../../common/Errors");
var GenerateSasPanelViewModel_1 = require("../GenerateSasPanelViewModel");
var ResourceKinds_1 = require("../ResourceKinds");
var SwitchValueViewModel_1 = require("../../Common/SwitchValueViewModel");
/**
 * View model for Generate Shared Access Signature dialog used for tables.
 */
var GenerateAccountSasPanelViewModel = (function (_super) {
    tslib_1.__extends(GenerateAccountSasPanelViewModel, _super);
    function GenerateAccountSasPanelViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        // Localize
        _this.readLabel = "Read";
        _this.writeLabel = "Write";
        _this.deleteLabel = "Delete";
        _this.listLabel = "List";
        _this.addLabel = "Add";
        _this.createLabel = "Create";
        _this.updateLabel = "Update";
        _this.processLabel = "Process";
        // Localize
        _this.supportedServicesLabel = "Services:";
        _this.blobServiceLabel = "Blobs";
        _this.fileServiceLabel = "Files";
        _this.queueServiceLabel = "Queues";
        _this.tableServiceLabel = "Tables";
        _this.supportedTypesLabel = "Resource Types:";
        _this.serviceLabel = "Service";
        _this.containerLabel = "Container";
        _this.objectLabel = "Object";
        /* Observables */
        _this.supportedServices = ko.observableArray([]);
        _this.supportedTypes = ko.observableArray();
        var isBlobOrPremiumStorage = parameters.accountKind === ResourceKinds_1.default.PremiumStorage ||
            parameters.accountKind === ResourceKinds_1.default.BlobStorage;
        _this.accountName = parameters.accountName;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", _this.readLabel),
            new SwitchValueViewModel_1.default("w", _this.writeLabel),
            new SwitchValueViewModel_1.default("d", _this.deleteLabel),
            new SwitchValueViewModel_1.default("l", _this.listLabel),
            new SwitchValueViewModel_1.default("a", _this.addLabel),
            new SwitchValueViewModel_1.default("c", _this.createLabel),
            new SwitchValueViewModel_1.default("u", _this.updateLabel),
            new SwitchValueViewModel_1.default("p", _this.processLabel)
        ]);
        _this.supportedServices([
            new SwitchValueViewModel_1.default("b", _this.blobServiceLabel),
            new SwitchValueViewModel_1.default("f", _this.fileServiceLabel, false, isBlobOrPremiumStorage),
            new SwitchValueViewModel_1.default("q", _this.queueServiceLabel, false, isBlobOrPremiumStorage),
            new SwitchValueViewModel_1.default("t", _this.tableServiceLabel, false, isBlobOrPremiumStorage)
            // Future support for files.
            // new SwitchValueViewModel("f", this.fileServiceLabel)
        ]);
        _this.supportedTypes([
            new SwitchValueViewModel_1.default("s", _this.serviceLabel),
            new SwitchValueViewModel_1.default("c", _this.containerLabel),
            new SwitchValueViewModel_1.default("o", _this.objectLabel)
        ]);
        _this.loadSettingsOrDefault()
            .then(function (settings) {
            settings.services = settings.services || "";
            settings.resourceTypes = settings.resourceTypes || "";
            _this.supportedServices().forEach(function (service) {
                if (!service.isDisabled()) {
                    service.isSelected(settings.services.indexOf(service.value) >= 0);
                }
            });
            _this.supportedTypes().forEach(function (resourceType) {
                return resourceType.isSelected(settings.resourceTypes.indexOf(resourceType.value) >= 0);
            });
        });
        _this.initialize();
        return _this;
    }
    GenerateAccountSasPanelViewModel.prototype.getAclOperation = function () {
        // This function should not be called.
        throw new Errors_1.NotSupportedError("Storage accounts do not yet support shared access policies.");
    };
    GenerateAccountSasPanelViewModel.prototype.getAclOperationParameters = function () {
        // This function should not be called.
        throw new Errors_1.NotSupportedError("Storage accounts do not yet support shared access policies.");
    };
    GenerateAccountSasPanelViewModel.prototype.appendParameters = function (baseParameters) {
        var services = this.supportedServices()
            .filter(function (service) { return service.isSelected(); })
            .map(function (service) { return service.value; });
        baseParameters.services = SasUtilities.getServicesString(services);
        var resourceTypes = this.supportedTypes()
            .filter(function (resourceType) { return resourceType.isSelected(); })
            .map(function (resourceType) { return resourceType.value; });
        baseParameters.resourceTypes = SasUtilities.getResourceTypesString(resourceTypes);
        return baseParameters;
    };
    GenerateAccountSasPanelViewModel.prototype.appendSettings = function (baseSettings) {
        var services = this.supportedServices()
            .filter(function (service) { return service.isSelected(); })
            .map(function (service) { return service.value; });
        baseSettings.services = SasUtilities.getServicesString(services);
        var resourceTypes = this.supportedTypes()
            .filter(function (resourceType) { return resourceType.isSelected(); })
            .map(function (resourceType) { return resourceType.value; });
        baseSettings.resourceTypes = SasUtilities.getResourceTypesString(resourceTypes);
        return baseSettings;
    };
    return GenerateAccountSasPanelViewModel;
}(GenerateSasPanelViewModel_1.default));
exports.default = GenerateAccountSasPanelViewModel;
