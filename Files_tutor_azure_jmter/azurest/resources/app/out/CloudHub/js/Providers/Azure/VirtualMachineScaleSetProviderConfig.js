/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var VirtualMachineScaleSetProviderConfig = (function () {
        function VirtualMachineScaleSetProviderConfig() {
            this.namespace = "Azure.CloudExplorer.VirtualMachineScaleSet";
            this.requirePath = "Providers/Azure/VirtualMachineScaleSetProvider";
            this.exports = [
                "Azure.Actions.VirtualMachineScaleSet.enableDiagnostics",
                "Azure.Actions.VirtualMachineScaleSet.viewDiagnostics",
                "Azure.Actions.VirtualMachineScaleSet.disableDiagnostics",
                "Azure.Actions.VirtualMachineScaleSet.updateDiagnostics",
                "Azure.Actions.VirtualMachineScaleSet.enableEtwListener",
                "Azure.Actions.VirtualMachineScaleSet.disableEtwListener",
                "Azure.Actions.VirtualMachineScaleSet.createEtwListenerWindow",
                "Azure.Attributes.VirtualMachineScaleSet.GetAllAttributes",
                "Azure.Attributes.VirtualMachineScaleSet.GetStateAttributes",
                "Azure.Attributes.VirtualMachineScaleSet.GetVirtualMachineAttributes",
                "Azure.Attributes.VirtualMachineScaleSet.GetIsRemoteActionInProgress",
                "Azure.Attributes.VirtualMachineScaleSet.GetEtwStateAttributes",
                "Azure.Producers.VirtualMachineScaleSet.GetVirtualMachines",
                "Azure.Attributes.ScaleSetInstance.GetInstanceViewAttributes",
                "Azure.Attributes.ScaleSetInstance.GetPrivateIpAttribute"
            ];
        }
        return VirtualMachineScaleSetProviderConfig;
    }());
    return VirtualMachineScaleSetProviderConfig;
});
