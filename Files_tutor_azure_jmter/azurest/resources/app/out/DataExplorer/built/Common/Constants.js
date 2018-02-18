define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO: define this list per environment in CSCFG
    var Referrers = (function () {
        function Referrers() {
        }
        return Referrers;
    }());
    Referrers.productionPortal = "https://portal.azure.com/";
    Referrers.fairfaxPortal = "https://portal.azure.us/";
    Referrers.mooncakePortal = "https://portal.azure.cn/";
    Referrers.blackforestPortal = "https://portal.microsoftazure.de/";
    Referrers.inTunePortal = "https://intuneeducation.portal.azure.com/";
    Referrers.mpacPortal = "https://ms.portal.azure.com";
    Referrers.previewPortal = "https://preview.portal.azure.com";
    Referrers.rcPortal = "https://rc.portal.azure.com";
    Referrers.s2Portal = "https://s2.portal.azure.com";
    Referrers.dogfoodPortal = "https://df.onecloud.azure-test.net/";
    Referrers.emulatorLocalhost = "https://localhost:";
    Referrers.developmentLocalhost = "?dev";
    exports.Referrers = Referrers;
    var BackendDefaults = (function () {
        function BackendDefaults() {
        }
        return BackendDefaults;
    }());
    BackendDefaults.partitionKeyKind = "Hash";
    BackendDefaults.singlePartitionStorageInGb = "10";
    BackendDefaults.singlePartitionMinThroughput = 400;
    BackendDefaults.multiplePartitionMinThroughput = 10000;
    exports.BackendDefaults = BackendDefaults;
    var ClientDefaults = (function () {
        function ClientDefaults() {
        }
        return ClientDefaults;
    }());
    ClientDefaults.requestTimeoutMs = 60000;
    ClientDefaults.errorNotificationTimeoutMs = 3000;
    exports.ClientDefaults = ClientDefaults;
    var AccountKind = (function () {
        function AccountKind() {
        }
        return AccountKind;
    }());
    AccountKind.DocumentDB = "DocumentDB";
    AccountKind.MongoDB = "MongoDB";
    AccountKind.Parse = "Parse";
    AccountKind.GlobalDocumentDB = "GlobalDocumentDB";
    AccountKind.Default = AccountKind.DocumentDB;
    exports.AccountKind = AccountKind;
    var CorrelationBackend = (function () {
        function CorrelationBackend() {
        }
        return CorrelationBackend;
    }());
    CorrelationBackend.Url = "https://aka.ms/cosmosdbanalytics";
    exports.CorrelationBackend = CorrelationBackend;
    var DefaultAccountExperience = (function () {
        function DefaultAccountExperience() {
        }
        return DefaultAccountExperience;
    }());
    DefaultAccountExperience.DocumentDB = "DocumentDB";
    DefaultAccountExperience.Graph = "Graph";
    DefaultAccountExperience.MongoDB = "MongoDB";
    DefaultAccountExperience.Table = "Table";
    DefaultAccountExperience.Default = DefaultAccountExperience.DocumentDB;
    exports.DefaultAccountExperience = DefaultAccountExperience;
    var Features = (function () {
        function Features() {
        }
        return Features;
    }());
    Features.graphs = "graphs";
    Features.cosmosdb = "cosmosdb";
    exports.Features = Features;
    var TagNames = (function () {
        function TagNames() {
        }
        return TagNames;
    }());
    TagNames.defaultExperience = "defaultExperience";
    exports.TagNames = TagNames;
    var MongoDBAccounts = (function () {
        function MongoDBAccounts() {
        }
        return MongoDBAccounts;
    }());
    MongoDBAccounts.protocol = "https";
    MongoDBAccounts.defaultPort = "10250";
    exports.MongoDBAccounts = MongoDBAccounts;
    var GremlinBackend = (function () {
        function GremlinBackend() {
        }
        return GremlinBackend;
    }());
    GremlinBackend.centralUsEndpoint = "https://portal-prod-centralus-graph.portal-prod-centralus.p.azurewebsites.net/api/graphs/";
    GremlinBackend.northEuropeEndpoint = "https://portal-prod-northeurope-graph.portal-prod-northeurope.p.azurewebsites.net/api/graphs/";
    GremlinBackend.southEastAsiaEndpoint = "https://portal-prod-seasia-graph.portal-prod-seasia.p.azurewebsites.net/api/graphs/";
    GremlinBackend.endpointsByRegion = {
        "default": GremlinBackend.centralUsEndpoint,
        "northeurope": GremlinBackend.northEuropeEndpoint,
        "ukwest": GremlinBackend.northEuropeEndpoint,
        "uksouth": GremlinBackend.northEuropeEndpoint,
        "westeurope": GremlinBackend.northEuropeEndpoint,
        "australiaeast": GremlinBackend.southEastAsiaEndpoint,
        "australiasoutheast": GremlinBackend.southEastAsiaEndpoint,
        "centralindia": GremlinBackend.southEastAsiaEndpoint,
        "eastasia": GremlinBackend.southEastAsiaEndpoint,
        "japaneast": GremlinBackend.southEastAsiaEndpoint,
        "japanwest": GremlinBackend.southEastAsiaEndpoint,
        "koreacentral": GremlinBackend.southEastAsiaEndpoint,
        "koreasouth": GremlinBackend.southEastAsiaEndpoint,
        "southeastasia": GremlinBackend.southEastAsiaEndpoint,
        "southindia": GremlinBackend.southEastAsiaEndpoint,
        "westindia": GremlinBackend.southEastAsiaEndpoint
    };
    exports.GremlinBackend = GremlinBackend;
    var MongoBackendEndpointType;
    (function (MongoBackendEndpointType) {
        MongoBackendEndpointType[MongoBackendEndpointType["local"] = 0] = "local";
        MongoBackendEndpointType[MongoBackendEndpointType["remote"] = 1] = "remote";
    })(MongoBackendEndpointType = exports.MongoBackendEndpointType || (exports.MongoBackendEndpointType = {}));
    ;
    var MongoBackend = (function () {
        function MongoBackend() {
        }
        return MongoBackend;
    }());
    MongoBackend.localhostEndpoint = "/api/mongo/explorer";
    MongoBackend.centralUsEndpoint = "https://portal-prod-centralus-mongo.portal-prod-centralus.p.azurewebsites.net/api/mongo/explorer";
    MongoBackend.northEuropeEndpoint = "https://portal-prod-northeurope-mongo.portal-prod-northeurope.p.azurewebsites.net/api/mongo/explorer";
    MongoBackend.southEastAsiaEndpoint = "https://portal-prod-seasia-mongo.portal-prod-seasia.p.azurewebsites.net/api/mongo/explorer";
    MongoBackend.endpointsByRegion = {
        "default": MongoBackend.centralUsEndpoint,
        "northeurope": MongoBackend.northEuropeEndpoint,
        "ukwest": MongoBackend.northEuropeEndpoint,
        "uksouth": MongoBackend.northEuropeEndpoint,
        "westeurope": MongoBackend.northEuropeEndpoint,
        "australiaeast": MongoBackend.southEastAsiaEndpoint,
        "australiasoutheast": MongoBackend.southEastAsiaEndpoint,
        "centralindia": MongoBackend.southEastAsiaEndpoint,
        "eastasia": MongoBackend.southEastAsiaEndpoint,
        "japaneast": MongoBackend.southEastAsiaEndpoint,
        "japanwest": MongoBackend.southEastAsiaEndpoint,
        "koreacentral": MongoBackend.southEastAsiaEndpoint,
        "koreasouth": MongoBackend.southEastAsiaEndpoint,
        "southeastasia": MongoBackend.southEastAsiaEndpoint,
        "southindia": MongoBackend.southEastAsiaEndpoint,
        "westindia": MongoBackend.southEastAsiaEndpoint
    };
    MongoBackend.endpointsByEnvironment = {
        "default": MongoBackendEndpointType.local,
        "localhost": MongoBackendEndpointType.local,
        "prod1": MongoBackendEndpointType.remote,
        "prod2": MongoBackendEndpointType.remote
    };
    exports.MongoBackend = MongoBackend;
    var RUPMStates = (function () {
        function RUPMStates() {
        }
        return RUPMStates;
    }());
    RUPMStates.on = "on";
    RUPMStates.off = "off";
    exports.RUPMStates = RUPMStates;
    var Queries = (function () {
        function Queries() {
        }
        return Queries;
    }());
    Queries.itemsPerPage = 100;
    exports.Queries = Queries;
    var HttpHeaders = (function () {
        function HttpHeaders() {
        }
        return HttpHeaders;
    }());
    HttpHeaders.activityId = "x-ms-activity-id";
    HttpHeaders.collectionIndexTransformationProgress = "x-ms-documentdb-collection-index-transformation-progress";
    HttpHeaders.continuation = "x-ms-continuation";
    HttpHeaders.correlationRequestId = "x-ms-correlation-request-id";
    HttpHeaders.msDate = "x-ms-date";
    HttpHeaders.location = "Location";
    HttpHeaders.user = "x-ms-user";
    HttpHeaders.populatePartitionStatistics = "x-ms-documentdb-populatepartitionstatistics";
    HttpHeaders.requestCharge = "x-ms-request-charge";
    HttpHeaders.resourceQuota = "x-ms-resource-quota";
    HttpHeaders.resourceUsage = "x-ms-resource-usage";
    HttpHeaders.retryAfterMs = "x-ms-retry-after-ms";
    exports.HttpHeaders = HttpHeaders;
    var Urls = (function () {
        function Urls() {
        }
        return Urls;
    }());
    Urls.feedbackEmail = "mailto:askdocdb@microsoft.com?subject=Cosmos%20DB%20Data%20Explorer%20Feedback";
    exports.Urls = Urls;
});
