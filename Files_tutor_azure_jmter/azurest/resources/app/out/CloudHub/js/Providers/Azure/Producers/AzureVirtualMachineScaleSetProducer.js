/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Producers/AzureResourceProducer", "URIjs/URITemplate", "Providers/Azure/Nodes/AzureResourceNodeFactory"], function (require, exports, AzureResourceProducer, URITemplate, AzureResourceNodeFactory) {
    "use strict";
    // import rsvp = require("es6-promise");
    // var Promise = rsvp.Promise;
    var AzureVirtualMachineScaleSetProducer = (function () {
        function AzureVirtualMachineScaleSetProducer(azureConnection) {
            var _this = this;
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureVirtualMachineScaleSetProducer.getVirutalMachineNamespace, _this.getVirutalMachines);
            };
            this.getVirutalMachines = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var subscription = JSON.parse(args.subscription);
                var url = AzureVirtualMachineScaleSetProducer.getVirtualMachinesUriTemplate.expand({
                    apiVersion: args.apiVersion,
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id
                });
                return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                    .then(function (response) {
                    var parsedResponse = AzureResourceProducer.parseResourceWebResponse(response, subscription);
                    var resources = parsedResponse.resources;
                    var results = AzureResourceNodeFactory.convertToNodeCollection2(resources);
                    results.forEach(function (node) {
                        node.attributes.push({
                            name: "scaleSetName",
                            value: args.name
                        });
                    });
                    return {
                        results: results,
                        continuationToken: parsedResponse.nextLink
                    };
                });
            };
            this._azureConnection = azureConnection;
        }
        return AzureVirtualMachineScaleSetProducer;
    }());
    AzureVirtualMachineScaleSetProducer.getVirutalMachineNamespace = "Azure.Producers.VirtualMachineScaleSet.GetVirtualMachines";
    AzureVirtualMachineScaleSetProducer.getVirtualMachinesUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/virtualMachines/?api-version={+apiVersion}");
    return AzureVirtualMachineScaleSetProducer;
});
