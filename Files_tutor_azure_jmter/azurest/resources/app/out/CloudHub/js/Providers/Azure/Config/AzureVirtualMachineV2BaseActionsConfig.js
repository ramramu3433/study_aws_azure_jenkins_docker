/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureGeneralActions, AzureResources) {
    "use strict";
    var AzureVirtualMachineV2BaseActionsConfig = (function () {
        function AzureVirtualMachineV2BaseActionsConfig() {
        }
        return AzureVirtualMachineV2BaseActionsConfig;
    }());
    AzureVirtualMachineV2BaseActionsConfig.Config = {
        aliases: ["Vm2BaseActions"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.Start", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    resourceAction: {
                        value: "start"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Starting virtual machine",
                            statusType: "VirtualMachine",
                            timeOutInSeconds: 300
                        }
                    }
                },
                enabled: {
                    expression: {
                        requires: ["stopped"],
                        expression: "stopped"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["stopped", "stopping"],
                        expression: "stopped || stopping"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.Stop", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    resourceAction: {
                        value: "powerOff"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Stopping virtual machine",
                            statusType: "VirtualMachine",
                            timeOutInSeconds: 300
                        }
                    }
                },
                enabled: {
                    expression: {
                        requires: ["running"],
                        expression: "running"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["running", "starting"],
                        expression: "running || starting"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.Restart", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.RestartIcon,
                themeSrc: AzureConstants.imageThemeSrc.RestartIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    resourceAction: {
                        value: "restart"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Restarting virtual machine",
                            statusType: "VirtualMachine",
                            timeOutInSeconds: 300
                        }
                    }
                },
                enabled: {
                    expression: {
                        requires: ["running"],
                        expression: "running"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["running", "starting"],
                        expression: "running || starting"
                    },
                    value: true
                }
            }
        ]
    };
    return AzureVirtualMachineV2BaseActionsConfig;
});
