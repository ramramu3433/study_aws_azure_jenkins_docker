define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OfferPricing = (function () {
        function OfferPricing() {
        }
        return OfferPricing;
    }());
    OfferPricing._hourInAMonth = 744;
    OfferPricing.HourlyPricing = {
        "default": {
            Currency: "USD",
            S1Price: 0.0336,
            S2Price: 0.0672,
            S3Price: 0.1344,
            Standard: {
                StartingPrice: 24 / OfferPricing._hourInAMonth,
                PricePerRU: 0.00008,
                PricePerRUPM: 10 * 2 / 1000 / OfferPricing._hourInAMonth,
                PricePerGB: 0.25 / OfferPricing._hourInAMonth
            }
        },
        "mooncake": {
            Currency: "RMB",
            S1Price: 0.15,
            S2Price: 0.30,
            S3Price: 0.60,
            Standard: {
                StartingPrice: 245 / OfferPricing._hourInAMonth,
                PricePerRU: 0.00082,
                PricePerRUPM: 10 * 20 / 1000 / OfferPricing._hourInAMonth,
                PricePerGB: 2.576 / OfferPricing._hourInAMonth
            }
        }
    };
    exports.OfferPricing = OfferPricing;
    var GeneralResources = (function () {
        function GeneralResources() {
        }
        return GeneralResources;
    }());
    GeneralResources.loadingText = "Loading...";
    exports.GeneralResources = GeneralResources;
    var CollectionCreation = (function () {
        function CollectionCreation() {
        }
        return CollectionCreation;
    }());
    // TODO generate these values based on Product\Services\Documents\ImageStore\GatewayApplication\Settings.xml
    CollectionCreation.MinRUPerPartitionBelow7Partitions = 400;
    CollectionCreation.MinRU7PartitionsTo25Partitions = 2500;
    CollectionCreation.MinRUPerPartitionAbove25Partitions = 100;
    CollectionCreation.MaxRUPerPartition = 10000;
    CollectionCreation.MaxRUPMPerPartition = 5000;
    CollectionCreation.NumberOfPartitionsInFixedCollection = 1;
    CollectionCreation.NumberOfPartitionsInUnlimitedCollection = 10;
    exports.CollectionCreation = CollectionCreation;
});
