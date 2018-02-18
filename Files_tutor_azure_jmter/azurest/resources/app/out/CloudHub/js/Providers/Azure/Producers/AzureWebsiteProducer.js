/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "URIjs/URI", "URIjs/URITemplate", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/Resources/AzureResources", "Common/LazyProperty", "Providers/Common/ResourceTypesService"], function (require, exports, rsvp, URI, URITemplate, AzureResourceNodeFactory, AzureResources, LazyProperty, ResourceTypesService) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource Groups.
     */
    var AzureWebsiteProducer = (function () {
        function AzureWebsiteProducer(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureWebsiteProducer.getFileSystemObjectsNamespace, _this.getFileSystemObjects);
                queryBindingManager.addProducerBinding(AzureWebsiteProducer.getGroupNodesNamespace, _this.getGroupNodes);
                queryBindingManager.addProducerBinding(AzureWebsiteProducer.getSlotsNamespace, _this.getSlots);
                queryBindingManager.addProducerBinding(AzureWebsiteProducer.getWebJobsNamespace, _this.getWebJobs);
            };
            /**
             * Enumerate child nodes for a website
             */
            this.getGroupNodes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var supportsSlots = !!args.supportsSlots;
                var supportsWebJobs = !!args.supportsWebJobs;
                var groupNodeAttributes = [
                    {
                        name: "id",
                        value: args.id
                    }, {
                        name: "websiteName",
                        value: args.name
                    },
                    {
                        name: "websiteUrl",
                        value: args.url
                    },
                    {
                        name: "resourceGroup",
                        value: args.resourceGroup
                    },
                    {
                        name: "subscription",
                        value: args.subscription
                    }
                ];
                var fileGroupNodeAttributes = groupNodeAttributes.concat({
                    name: "relativeUrl",
                    value: ""
                });
                return _this._resources.getValue().then(function (resources) {
                    // Create "Files", "Log Files" virtual entities
                    var groupNodeData = [
                        {
                            type: "Azure.Website.Directory",
                            name: resources["Nodes.Website.Files"] || "Files",
                            attributes: fileGroupNodeAttributes.concat({
                                name: "name",
                                value: "Files"
                            })
                        },
                        {
                            type: "Azure.Website.LogDirectory",
                            name: resources["Nodes.Website.LogFiles"] || "Log Files",
                            attributes: fileGroupNodeAttributes.concat({
                                name: "name",
                                value: "LogFiles"
                            })
                        }
                    ];
                    if (supportsSlots) {
                        // Create "Deployment Slots" virtual entity
                        groupNodeData.push({
                            type: "Azure.Website.SlotsGroup",
                            name: resources["Nodes.Website.DeploymentSlots"] || "Deployment Slots",
                            attributes: groupNodeAttributes
                        });
                    }
                    if (supportsWebJobs) {
                        // Create "Web Jobs" virtual entity
                        groupNodeData.push({
                            type: "Azure.Website.WebJobsGroup",
                            name: resources["Nodes.Website.WebJobs"] || "WebJobs",
                            attributes: groupNodeAttributes
                        });
                    }
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(groupNodeData)
                    };
                });
            };
            /**
             * Enumerates files/directories under "relativeUrl"
             */
            this.getFileSystemObjects = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var subscription = JSON.parse(args.subscription);
                var directoryResourceType = args.directoryResourceType;
                var fileResourceType = args.fileResourceType;
                return _this._host.executeOperation("Azure.Actions.Website.getWebsiteFileSystemObjects", [args])
                    .then(function (fileSystemObjects) {
                    var resources = _this._convertFileObjectsToResources(args, subscription, fileSystemObjects, fileResourceType, directoryResourceType);
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection2(resources),
                        continuationToken: continuationToken
                    };
                });
            };
            this._convertFileObjectsToResources = function (args, subscription, fileSystemObjects, fileResourceType, directoryResourceType) {
                var resourceGroup = args.resourceGroup;
                var websiteUrl = URI(args.websiteUrl);
                var commonAttributes = [
                    {
                        name: "id",
                        value: args.id
                    },
                    {
                        name: "websiteName",
                        value: args.websiteName
                    },
                    {
                        name: "websiteUrl",
                        value: args.websiteUrl
                    },
                    {
                        name: "subscription",
                        value: args.subscription
                    }
                ];
                var resources = [];
                fileSystemObjects.forEach(function (fso) {
                    var resourceType;
                    var fsoAttributes = commonAttributes.concat({
                        name: "relativeUrl",
                        value: fso.relativeUrl
                    }, {
                        name: "scmUrl",
                        value: args.scmUrl
                    });
                    switch (fso.kind.toLowerCase()) {
                        case "file":
                            resourceType = fileResourceType;
                            fsoAttributes.push({
                                name: "lastModified",
                                value: fso.lastModified
                            }, {
                                name: "size",
                                value: fso.size
                            }, {
                                name: "url",
                                value: websiteUrl.path(fso.relativeUrl).toString()
                            });
                            break;
                        case "directory":
                            resourceType = directoryResourceType;
                            break;
                        default:
                            // Unsupported, nothing to do
                            return;
                    }
                    resources.push({
                        attributes: fsoAttributes,
                        id: args.id,
                        name: fso.name,
                        kind: fso.kind,
                        location: args.location,
                        subscription: subscription,
                        type: resourceType,
                        resourceGroup: resourceGroup
                    });
                });
                return resources;
            };
            /**
             * Gets slots groups
             */
            this.getSlots = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var id = args.id;
                var subscription = JSON.parse(args.subscription);
                var url = AzureWebsiteProducer._slotUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id
                });
                return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                    .then(function (response) {
                    var parsedSlotGroups = [];
                    var parsedResponse = JSON.parse(response);
                    if (!!parsedResponse && !!parsedResponse.value && parsedResponse.value.length) {
                        parsedSlotGroups = parsedResponse.value;
                        parsedSlotGroups.forEach(function (resource) {
                            // Extract the Resource Group from the id and add it as a property
                            resource.resourceGroup = ResourceTypesService.parseResourceDescriptor(resource.id).resourceGroup;
                            // We save the subscription id in every resource to avoid having to parse
                            // it from the resource id every time we need it.
                            resource.subscription = subscription;
                            // TODO: This is a workaround for AzureResourceProducer.getHighlightLocations logic not being public/reusable.
                            resource.attributes = [
                                {
                                    name: "id",
                                    value: id
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ];
                        });
                    }
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection2(parsedSlotGroups),
                        continuationToken: continuationToken
                    };
                });
            };
            /**
             * Get webjob nodes
             */
            this.getWebJobs = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var id = args.id;
                var websiteName = args.websiteName;
                var resourceGroup = args.resourceGroup;
                var subscription = JSON.parse(args.subscription);
                var url = AzureWebsiteProducer._webJobUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id
                });
                return Promise.all([_this._resources.getValue(), _this._azureConnection.webRequest(url.toString(), subscription, "GET")])
                    .then(function (values) {
                    var resources = values[0];
                    var response = values[1];
                    var parsedResponse = JSON.parse(response);
                    var attributes = [
                        {
                            name: "id",
                            value: id
                        },
                        {
                            name: "websiteName",
                            value: websiteName
                        },
                        {
                            name: "subscription",
                            value: subscription
                        }
                    ];
                    // Continuous
                    var continuousJobsNode = AzureResourceNodeFactory.convertAzureResource({
                        type: "Azure.Website.WebJobsGroup.Continuous",
                        name: resources["Nodes.WebJob.ContinuousWebJobs"] || "Continuous",
                        attributes: []
                    });
                    var continuousJobsNodeChildren = AzureResourceNodeFactory.convertToNodeCollection2(_this._convertContinuousWebJobsToResources(parsedResponse, "Azure.WebJob.Continuous", resourceGroup, subscription, attributes));
                    continuousJobsNode.children = (continuousJobsNodeChildren.length > 0) ? continuousJobsNodeChildren : null;
                    // Triggered
                    var triggeredJobsNode = AzureResourceNodeFactory.convertAzureResource({
                        type: "Azure.Website.WebJobsGroup.Triggered",
                        name: resources["Nodes.WebJob.TriggeredWebJobs"] || "On Demand & Scheduled",
                        attributes: []
                    });
                    var triggeredJobsNodeChildren = AzureResourceNodeFactory.convertToNodeCollection2(_this._convertTriggeredWebJobsToResources(parsedResponse, "Azure.WebJob.Triggered", resourceGroup, subscription, attributes));
                    triggeredJobsNode.children = (triggeredJobsNodeChildren.length > 0) ? triggeredJobsNodeChildren : null;
                    return {
                        results: [continuousJobsNode, triggeredJobsNode],
                        continuationToken: continuationToken
                    };
                });
            };
            this._convertContinuousWebJobsToResources = function (jobs, resourceType, resourceGroup, subscription, attributes) {
                var resources = [];
                var webjobType = "continuous";
                attributes = attributes.concat([{
                        name: "webjobType",
                        value: webjobType
                    }]);
                jobs.value.forEach(function (job) {
                    if (job.properties.type === webjobType) {
                        var jobName;
                        var jobExtraInfoUrl;
                        var jobRunCommand;
                        if (job.properties != null) {
                            jobName = job.properties.name;
                            jobExtraInfoUrl = job.properties.extra_info_url;
                            jobRunCommand = job.properties.run_command;
                        }
                        resources.push({
                            attributes: attributes.concat([{
                                    name: "resourceUid",
                                    value: job.id
                                },
                                {
                                    name: "location",
                                    value: job.location
                                },
                                {
                                    name: "extraInfoUrl",
                                    value: jobExtraInfoUrl
                                },
                                {
                                    name: "runCommand",
                                    value: jobRunCommand
                                }]),
                            id: job.id,
                            name: jobName,
                            kind: job.kind,
                            location: job.location,
                            subscription: subscription,
                            type: resourceType,
                            resourceGroup: resourceGroup,
                            uidAttribute: "resourceUid"
                        });
                    }
                });
                return resources;
            };
            this._convertTriggeredWebJobsToResources = function (jobs, resourceType, resourceGroup, subscription, attributes) {
                var resources = [];
                var webjobType = "triggered";
                attributes = attributes.concat([{
                        name: "webjobType",
                        value: webjobType
                    }]);
                jobs.value.forEach(function (job) {
                    if (job.properties.type === webjobType) {
                        var jobName;
                        var jobExtraInfoUrl;
                        var jobRunCommand;
                        var jobCronExpression;
                        var jobLatestRunStartTime;
                        var jobLatestRunEndTime;
                        var jobLatestRunDuration;
                        var jobLatestRunStatus;
                        if (job.properties != null) {
                            jobName = job.properties.name;
                            jobExtraInfoUrl = job.properties.extra_info_url;
                            jobRunCommand = job.properties.run_command;
                            if (job.properties.settings != null) {
                                jobCronExpression = job.properties.settings.schedule;
                            }
                            if (job.properties.latest_run != null) {
                                jobLatestRunStartTime = job.properties.latest_run.start_time;
                                jobLatestRunEndTime = job.properties.latest_run.end_time;
                                jobLatestRunDuration = job.properties.latest_run.duration;
                                jobLatestRunStatus = job.properties.latest_run.status;
                            }
                        }
                        resources.push({
                            attributes: attributes.concat([{
                                    name: "resourceUid",
                                    value: job.id
                                },
                                {
                                    name: "location",
                                    value: job.location
                                },
                                {
                                    name: "extraInfoUrl",
                                    value: jobExtraInfoUrl
                                },
                                {
                                    name: "runCommand",
                                    value: jobRunCommand
                                },
                                {
                                    name: "cronExpression",
                                    value: jobCronExpression
                                },
                                {
                                    name: "latestRunStartTime",
                                    value: jobLatestRunStartTime
                                },
                                {
                                    name: "latestRunEndTime",
                                    value: jobLatestRunEndTime
                                },
                                {
                                    name: "latestRunDuration",
                                    value: jobLatestRunDuration
                                },
                                {
                                    name: "latestRunStatus",
                                    value: jobLatestRunStatus
                                }]),
                            id: job.id,
                            name: jobName,
                            kind: job.kind,
                            location: job.location,
                            subscription: subscription,
                            type: resourceType,
                            resourceGroup: resourceGroup,
                            uidAttribute: "resourceUid"
                        });
                    }
                });
                return resources;
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._resources = new LazyProperty(function () {
                return _this._host.resolveResources(AzureResources.commonNamespace, [
                    "Nodes.WebJob.ContinuousWebJobs",
                    "Nodes.WebJob.TriggeredWebJobs",
                    "Nodes.Website.DeploymentSlots",
                    "Nodes.Website.Files",
                    "Nodes.Website.LogFiles",
                    "Nodes.Website.WebJobs"
                ]);
            });
        }
        return AzureWebsiteProducer;
    }());
    AzureWebsiteProducer.getFileSystemObjectsNamespace = "Azure.Producers.Website.GetFileSystemObjects";
    AzureWebsiteProducer.getGroupNodesNamespace = "Azure.Producers.Website.GetGroupNodes";
    AzureWebsiteProducer.getSlotsNamespace = "Azure.Producers.Website.GetSlots";
    AzureWebsiteProducer.getWebJobsNamespace = "Azure.Producers.Website.GetWebJobs";
    AzureWebsiteProducer._slotUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/slots?api-version=2014-06-01");
    AzureWebsiteProducer._webJobUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/webjobs?api-version=2016-08-01");
    return AzureWebsiteProducer;
});
