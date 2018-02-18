/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConnection", "Providers/Azure/Loaders/AzureWebjobAttributeLoader", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/Azure/Producers/AzureWebsiteProducer", "Providers/Common/BaseProvider"], function (require, exports, AzureConnection, AzureWebJobAttributeLoader, AzureWebsiteAttributeLoader, AzureWebsiteProducer, BaseProvider) {
    "use strict";
    var WebsiteProvider = (function (_super) {
        __extends(WebsiteProvider, _super);
        function WebsiteProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.Website") || this;
            _this._azureConnection = new AzureConnection(_this.host);
            new AzureWebsiteAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureWebJobAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureWebsiteProducer(_this._azureConnection, _this.host).registerBindings(_this);
            return _this;
            // Resources
            // 'WebsiteProvider' currently leverages AzureResources registered resources
        }
        return WebsiteProvider;
    }(BaseProvider));
    return WebsiteProvider;
});
