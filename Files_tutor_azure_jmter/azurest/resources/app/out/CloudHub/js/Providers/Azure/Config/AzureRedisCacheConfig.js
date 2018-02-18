/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Loaders/AzureRedisAttributeLoader", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureRedisAttributeLoader, AzureResources) {
    "use strict";
    var AzureRedisCacheConfig = (function () {
        function AzureRedisCacheConfig() {
        }
        return AzureRedisCacheConfig;
    }());
    AzureRedisCacheConfig.Config = {
        aliases: [AzureConstants.resourceTypes.RedisCaches],
        parentType: AzureConstants.resourceTypes.RedisCachesResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.RedisCacheIcon,
        themeSrc: AzureConstants.imageThemeSrc.RedisCacheIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.RedisCaches.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.RedisCaches.SslPort", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "sslPort"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.RedisCaches.NonSslPort", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "nonSslPort"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.RedisCaches.Version", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "redisVersion"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureRedisAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-04-01"
                    }
                },
                provides: ["url", "sslPort", "nonSslPort", "redisVersion"]
            }
        ]
    };
    return AzureRedisCacheConfig;
});
