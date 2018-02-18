/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Azure/Producers/AzureStorageProducer", "Providers/Common/AzureConnection", "Providers/Azure/Actions/AzureFabricActions", "Providers/Azure/Actions/AzureActions", "Providers/Common/BaseProvider", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Actions/AzureSQLActions", "Providers/Azure/Actions/AzureApplicationInsightsActions", "Providers/Azure/Loaders/AzureApplicationInsightsAttributeLoader", "Providers/Azure/Actions/AzureStorageActions", "Providers/Azure/Loaders/AzureApiAppAttributeLoader", "Providers/Azure/Actions/AzureDataFactoryActions", "Providers/Azure/Actions/AzureLogicAppsActions", "Providers/Azure/Producers/AzureDataFactoryProducer", "Providers/Azure/Producers/AzureDocumentDBProducer", "Providers/Azure/Loaders/AzureGatewayAttributeLoader", "Providers/Azure/Loaders/AzureLogicAppsAttributeLoader", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Loaders/AzureRedisAttributeLoader", "Providers/Azure/Loaders/AzureSQLAttributeLoader", "Providers/Azure/Producers/AzureResourceGroupProducer", "Providers/Azure/Producers/AzureResourceProducer", "Providers/Azure/Producers/AzureSubscriptionProducer", "Providers/Azure/Loaders/AzureSubscriptionAttributeLoader", "Providers/Azure/Producers/ExternalResourceNodeProducer", "Providers/Azure/Producers/AzureResourceTypeProducer", "Providers/Azure/Loaders/AzureSearchServiceAttributeLoader", "Providers/Azure/Producers/AzureDataLakeAnalyticsProducer", "Providers/Azure/Loaders/AzureStorageAccountAttributeLoader", "Providers/Azure/Loaders/AzureStorageAttributeLoader", "Providers/Azure/Loaders/AzureFabricAttributeLoader", "Providers/Azure/Producers/AzureFabricProducer", "Providers/Azure/Resources/AzureResources", "Common/TelemetryActions"], function (require, exports, AzureStorageProducer_1, AzureConnection, AzureFabricActions, AzureActions, BaseProvider, AzureGeneralActions, AzureSQLActions, AzureApplicationInsightsActions, AzureApplicationInsightsAttributeLoader, AzureStorageActions_1, AzureApiAppAttributeLoader, AzureDataFactoryActions, AzureLogicAppsActions, AzureDataFactoryProducer, AzureDocumentDBProducer, AzureGatewayAttributeLoader, AzureLogicAppsAttributeLoader, AzurePermissionsAttributeLoader, AzureRedisAttributeLoader, AzureSQLAttributeLoader, AzureResourceGroupProducer, AzureResourceProducer, AzureSubscriptionProducer, AzureSubscriptionAttributeLoader, ExternalResourceNodeProducer, AzureResourceTypeProducer, AzureSearchServiceAttributeLoader, AzureDataLakeAnalyticsProducer, AzureStorageAccountAttributeLoader, AzureStorageAttributeLoader, AzureFabricAttributeLoader, AzureFabricProducer, AzureResources, TelemetryActions) {
    "use strict";
    var AzureProvider = (function (_super) {
        __extends(AzureProvider, _super);
        function AzureProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer") || this;
            var telemetry = new TelemetryActions(_this.host);
            _this._azureConnection = new AzureConnection(_this.host);
            var azureResourceProducer = new AzureResourceProducer(_this._azureConnection, _this.host, telemetry);
            azureResourceProducer.registerBindings(_this);
            var externalResourceProducer = new ExternalResourceNodeProducer(_this._azureConnection, _this.host);
            externalResourceProducer.registerBindings(_this);
            new AzureResourceTypeProducer(_this._azureConnection, azureResourceProducer, externalResourceProducer, telemetry)
                .registerBindings(_this);
            new AzureResourceGroupProducer(_this._azureConnection, telemetry)
                .registerBindings(_this);
            new AzureSubscriptionProducer(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureSubscriptionAttributeLoader(_this.host).registerBindings(_this);
            new AzureApiAppAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureApplicationInsightsAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureGatewayAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureLogicAppsAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzurePermissionsAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureRedisAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureSearchServiceAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureStorageAccountAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureStorageAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureFabricAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureSQLAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureDataFactoryProducer(_this._azureConnection).registerBindings(_this);
            new AzureFabricProducer(_this.host).registerBindings(_this);
            var azureStorageProducer = new AzureStorageProducer_1.default(_this.host, _this._azureConnection);
            azureStorageProducer.registerBindings(_this);
            externalResourceProducer.registerStorageProducer(azureStorageProducer);
            var azureDataLakeAnalyticsProducer = new AzureDataLakeAnalyticsProducer(_this.host);
            azureDataLakeAnalyticsProducer.registerBindings(_this);
            externalResourceProducer.registerDataLakeAnalyticsProducer(azureDataLakeAnalyticsProducer);
            externalResourceProducer.registerDocumentDBProducer(new AzureDocumentDBProducer(_this.host, _this._azureConnection));
            new AzureActions(_this.host).registerBindings(_this);
            new AzureDataFactoryActions(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureLogicAppsActions(_this.host).registerBindings(_this);
            new AzureFabricActions(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureGeneralActions(_this._azureConnection).registerBindings(_this);
            new AzureSQLActions(_this.host).registerBindings(_this);
            new AzureStorageActions_1.default(_this._azureConnection, _this.host, telemetry).registerBindings(_this);
            new AzureApplicationInsightsActions(_this.host).registerBindings(_this);
            // Azure resources
            var azureResources = new AzureResources(_this.host);
            azureResources.registerBindings(_this);
            return _this;
        }
        return AzureProvider;
    }(BaseProvider));
    return AzureProvider;
});
