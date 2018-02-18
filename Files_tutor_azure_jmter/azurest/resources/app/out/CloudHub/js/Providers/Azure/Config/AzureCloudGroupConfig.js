/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureCloudGroupConfig = (function () {
        function AzureCloudGroupConfig() {
        }
        return AzureCloudGroupConfig;
    }());
    AzureCloudGroupConfig.Config = {
        aliases: ["Azure.CloudGroup"],
        displayName: {
            expression: {
                requires: ["name"],
                expression: "(name === 'management.azure.com') ? 'Azure' : name"
            }
        },
        icon: AzureConstants.imagePaths.OpenInPortalIcon,
        themeSrc: AzureConstants.imageThemeSrc.OpenInPortalIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        childrenQuery: {
            namespace: "Azure.Producers.Resources.GetFromResourceGroup",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                subscription: {
                    attribute: "subscription"
                },
                name: {
                    attribute: "name"
                },
                // TODO figure out why a childrenQuery would need highlightLocations ... that doesn't make sense.
                highlightLocations: {
                    attribute: "highlightLocations"
                }
            }
        }
    };
    return AzureCloudGroupConfig;
});
