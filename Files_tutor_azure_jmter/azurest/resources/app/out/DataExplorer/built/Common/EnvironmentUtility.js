define(["require", "exports", "../Common/Constants"], function (require, exports, Constants) {
    "use strict";
    var EnvironmentUtility = (function () {
        function EnvironmentUtility() {
        }
        EnvironmentUtility.getMongoBackendEndpoint = function (explorer, location) {
            var defaultEnvironment = "default";
            var defaultLocation = "default";
            var environment = explorer.serverId && explorer.serverId();
            var endpointType = Constants.MongoBackend.endpointsByEnvironment[environment] || Constants.MongoBackend.endpointsByEnvironment[defaultEnvironment];
            if (endpointType === Constants.MongoBackendEndpointType.local) {
                return Constants.MongoBackend.localhostEndpoint;
            }
            var normalizedLocation = EnvironmentUtility.normalizeRegionName(location);
            return Constants.MongoBackend.endpointsByRegion[normalizedLocation] || Constants.MongoBackend.endpointsByRegion[defaultLocation];
        };
        EnvironmentUtility.getGraphEndpointByLocation = function (location) {
            var defaultLocation = "default";
            var normalizedLocation = EnvironmentUtility.normalizeRegionName(location);
            return Constants.GremlinBackend.endpointsByRegion[normalizedLocation] || Constants.GremlinBackend.endpointsByRegion[defaultLocation];
        };
        EnvironmentUtility.normalizeRegionName = function (region) {
            return region.toLocaleLowerCase().replace(/ /g, '');
        };
        return EnvironmentUtility;
    }());
    return EnvironmentUtility;
});
