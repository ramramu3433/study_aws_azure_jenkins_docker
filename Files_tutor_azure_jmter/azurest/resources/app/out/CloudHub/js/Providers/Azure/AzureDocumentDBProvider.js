/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/BaseProvider", "Providers/Common/AzureConnection", "Common/TelemetryActions", "Providers/Azure/Actions/AzureDocumentDBActions", "Providers/Azure/Loaders/AzureDocumentDBAttributeLoader", "Providers/Azure/Producers/AzureDocumentDBProducer"], function (require, exports, BaseProvider, AzureConnection, TelemetryActions, AzureDocumentDBActions, AzureDocumentDBAttributeLoader, AzureDocumentDBProducer) {
    "use strict";
    var AzureProvider = (function (_super) {
        __extends(AzureProvider, _super);
        function AzureProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer") || this;
            var telemetry = new TelemetryActions(_this.host);
            _this._azureConnection = new AzureConnection(_this.host);
            new AzureDocumentDBAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureDocumentDBProducer(_this.host, _this._azureConnection).registerBindings(_this);
            new AzureDocumentDBActions(_this.host, telemetry).registerBindings(_this);
            return _this;
        }
        return AzureProvider;
    }(BaseProvider));
    return AzureProvider;
});
