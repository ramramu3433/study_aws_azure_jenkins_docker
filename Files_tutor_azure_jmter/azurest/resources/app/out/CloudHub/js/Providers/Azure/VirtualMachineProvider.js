/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConnection", "Providers/Common/BaseProvider", "Providers/Azure/Actions/AzureVirtualMachineV2Actions", "Providers/Azure/Loaders/AzureVirtualMachineAttributeLoader", "Providers/Azure/Loaders/AzureVirtualMachineV2AttributeLoader"], function (require, exports, AzureConnection, BaseProvider, AzureVirtualMachineV2Actions, AzureVirtualMachineAttributeLoader, AzureVirtualMachineV2AttributeLoader) {
    "use strict";
    var VirtualMachineProvider = (function (_super) {
        __extends(VirtualMachineProvider, _super);
        function VirtualMachineProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.VirtualMachine") || this;
            _this._azureConnection = new AzureConnection(_this.host);
            new AzureVirtualMachineAttributeLoader(_this._azureConnection).registerBindings(_this);
            new AzureVirtualMachineV2AttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureVirtualMachineV2Actions(_this._azureConnection, _this.host).registerBindings(_this);
            return _this;
            // Resources
            // 'VirtualMachineProvider' currently leverages AzureResources registered resources
        }
        return VirtualMachineProvider;
    }(BaseProvider));
    return VirtualMachineProvider;
});
