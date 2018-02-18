/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConnection", "Providers/Common/BaseProvider", "Providers/Azure/Actions/AzureVirtualMachineScaleSetActions", "Providers/Azure/Loaders/AzureVirtualMachineScaleSetAttributeLoader", "Providers/Azure/Producers/AzureVirtualMachineScaleSetProducer", "Providers/Azure/Loaders/AzureScaleSetInstanceAttributeLoader"], function (require, exports, AzureConnection, BaseProvider, AzureVirtualMachineScaleSetActions, AzureVirtualMachineScaleSetAttributeLoader, AzureVirutalMachineScaleSetProducer, AzureScaleSetInstanceAttributeLoader) {
    "use strict";
    var VirtualMachineScaleSetProvider = (function (_super) {
        __extends(VirtualMachineScaleSetProvider, _super);
        function VirtualMachineScaleSetProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.VirtualMachineScaleSet") || this;
            _this._azureConnection = new AzureConnection(_this.host);
            new AzureVirtualMachineScaleSetAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureVirtualMachineScaleSetActions(_this._azureConnection, _this.host).registerBindings(_this);
            new AzureVirutalMachineScaleSetProducer(_this._azureConnection).registerBindings(_this);
            new AzureScaleSetInstanceAttributeLoader(_this._azureConnection).registerBindings(_this);
            return _this;
        }
        return VirtualMachineScaleSetProvider;
    }(BaseProvider));
    return VirtualMachineScaleSetProvider;
});
