/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var VirtualMachineProviderConfig = (function () {
        function VirtualMachineProviderConfig() {
            this.namespace = "Azure.CloudExplorer.VirtualMachine";
            this.requirePath = "Providers/Azure/VirtualMachineProvider";
            this.exports = [
                "Azure.Actions.VirtualMachineV2.enableDiagnostics",
                "Azure.Actions.VirtualMachineV2.updateDiagnostics",
                "Azure.Actions.VirtualMachineV2.attatchDebugger",
                "Azure.Actions.VirtualMachineV2.viewDiagnostics",
                "Azure.Actions.VirtualMachineV2.openApplicationInsights",
                "Azure.Actions.VirtualMachineV2.enableDebugging",
                "Azure.Actions.VirtualMachineV2.disableDebugging",
                "Azure.Actions.VirtualMachineV2.enableEtwListener",
                "Azure.Actions.VirtualMachineV2.disableEtwListener",
                "Azure.Actions.VirtualMachineV2.createEtwListenerWindow",
                "Azure.Attributes.VirtualMachineV2.GetIsEtwFeatureOnAttribute",
                "Azure.Attributes.VirtualMachineV2.GetEtwListenerPort",
                "Azure.Attributes.VirtualMachine.GetAttributes",
                "Azure.Attributes.VirtualMachineV2.GetAttributes",
                "Azure.Attributes.VirtualMachineV2.GetApplicationInsightsAttributes",
                "Azure.Attributes.VirtualMachineV2.GetIpAddressAttribute",
                "Azure.Attributes.VirtualMachineV2.GetStateAttributes",
                "Azure.Attributes.VirtualMachineV2.GetNetworkInterfaceAttribute",
                "Azure.Attributes.VirtualMachineV2.GetLoadBalancerAttribute",
                "Azure.Attributes.VirtualMachineV2.GetNetworkSecurityGroupAttribute"
            ];
        }
        return VirtualMachineProviderConfig;
    }());
    return VirtualMachineProviderConfig;
});
