/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebjobAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureWebJobAttributeLoader) {
    "use strict";
    var AzureWebJobConfig = (function () {
        function AzureWebJobConfig() {
        }
        return AzureWebJobConfig;
    }());
    AzureWebJobConfig._webJobsCommonLoaders = [];
    AzureWebJobConfig._webJobsCommonProperties = [
        {
            displayName: {
                resource: { resourceId: "Properties.WebJob.Name", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "name"
            }
        },
        {
            displayName: {
                resource: { resourceId: "Properties.Resources.Location", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "location"
            }
        },
        {
            displayName: {
                resource: { resourceId: "Properties.WebJob.RunCommand", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "runCommand"
            }
        },
        {
            displayName: {
                resource: { resourceId: "Properties.WebJob.ExtraInfoUrl", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "extraInfoUrl"
            }
        }
    ];
    AzureWebJobConfig.WebJobContinuousConfig = {
        aliases: ["Azure.WebJob.Continuous"],
        displayName: { value: "Web Jobs (continuous)" },
        icon: AzureConstants.imagePaths.WebjobIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebjobIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.Start", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartIcon,
                namespace: "Azure.Actions.WebJob.startContinuousWebJob",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status"],
                        expression: "status.toLowerCase() !== 'running'"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status"],
                        expression: "status.toLowerCase() !== 'running'"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.Stop", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopIcon,
                namespace: "Azure.Actions.WebJob.stopContinuousWebJob",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                visible: {
                    expression: {
                        requires: ["status"],
                        expression: "status.toLowerCase() === 'running'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.AttachDebugger", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: "Azure.Actions.WebJob.startContinuousWebJobRemoteDebugSession",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachDebugger", "canAttachRemoteDebuggerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachDebugger && canAttachRemoteDebuggerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachDebugger", "canAttachRemoteDebuggerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachDebugger && canAttachRemoteDebuggerInAzureStack"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.StartProfiling", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: "Azure.Actions.WebJob.startContinuousWebJobRemoteProfilingSession",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachRemoteProfiler", "isContinuousWebJobRunningRemoteProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachRemoteProfiler && !isContinuousWebJobRunningRemoteProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachRemoteProfiler", "isContinuousWebJobRunningRemoteProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachRemoteProfiler && !isContinuousWebJobRunningRemoteProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.StopProfiling", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopIcon,
                namespace: "Azure.Actions.WebJob.stopContinuousWebJobRemoteProfilingSession",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachRemoteProfiler", "isContinuousWebJobRunningRemoteProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachRemoteProfiler && isContinuousWebJobRunningRemoteProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status", "canContinuousWebJobAttachRemoteProfiler", "isContinuousWebJobRunningRemoteProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "status.toLowerCase() === 'running' && canContinuousWebJobAttachRemoteProfiler && isContinuousWebJobRunningRemoteProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.ViewExecutionHistory", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenWebsiteIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenWebsiteIcon,
                namespace: "CloudExplorer.Actions.openUrl",
                boundArguments: {
                    url: {
                        attribute: "extraInfoUrl"
                    }
                }
            }
        ],
        loaders: AzureWebJobConfig._webJobsCommonLoaders.concat({
            namespace: AzureWebJobAttributeLoader.getStatusAttributeNamespace,
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                type: {
                    attribute: "webjobType"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            provides: ["status"]
        }, {
            namespace: AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteDebugger,
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                type: {
                    attribute: "webjobType"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            provides: ["canContinuousWebJobAttachDebugger"]
        }, {
            namespace: AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteProfiler,
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                type: {
                    attribute: "webjobType"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            provides: ["canContinuousWebJobAttachRemoteProfiler"]
        }, {
            namespace: AzureWebJobAttributeLoader.isContinuousWebJobRunningRemoteProfiling,
            boundArguments: {
                name: {
                    attribute: "name"
                }
            },
            provides: ["isContinuousWebJobRunningRemoteProfiling"]
        }, {
            namespace: AzureWebJobAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace,
            boundArguments: {
                id: {
                    attribute: "id"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            provides: ["canAttachRemoteDebuggerInAzureStack", "canAttachRemoteProfilerInAzureStack"]
        }),
        properties: AzureWebJobConfig._webJobsCommonProperties.concat({
            displayName: {
                resource: { resourceId: "Properties.WebJob.Status", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "status"
            }
        }, {
            displayName: {
                resource: { resourceId: "Properties.WebJob.isContinuousWebJobRunningRemoteProfiling", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "isContinuousWebJobRunningRemoteProfiling"
            }
        })
    };
    AzureWebJobConfig.WebJobTriggeredConfig = {
        aliases: ["Azure.WebJob.Triggered"],
        displayName: { value: "Web Jobs (triggered)" },
        icon: AzureConstants.imagePaths.WebjobIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebjobIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.Start", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartIcon,
                namespace: "Azure.Actions.WebJob.runTriggeredWebJob",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.WebJob.ViewExecutionHistory", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenWebsiteIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenWebsiteIcon,
                namespace: "CloudExplorer.Actions.openUrl",
                boundArguments: {
                    url: {
                        attribute: "extraInfoUrl"
                    }
                }
            }
        ],
        loaders: AzureWebJobConfig._webJobsCommonLoaders,
        properties: AzureWebJobConfig._webJobsCommonProperties.concat({
            displayName: {
                resource: { resourceId: "Properties.WebJob.Schedule", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "cronExpression"
            }
        }, {
            displayName: {
                resource: { resourceId: "Properties.WebJob.LatestRunStartTime", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "latestRunStartTime"
            }
        }, {
            displayName: {
                resource: { resourceId: "Properties.WebJob.LatestRunEndTime", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "latestRunEndTime"
            }
        }, {
            displayName: {
                resource: { resourceId: "Properties.WebJob.LatestRunDuration", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "latestRunDuration"
            }
        }, {
            displayName: {
                resource: { resourceId: "Properties.WebJob.LatestRunStatus", namespace: AzureResources.commonNamespace }
            },
            binding: {
                attribute: "latestRunStatus"
            }
        })
    };
    return AzureWebJobConfig;
});
