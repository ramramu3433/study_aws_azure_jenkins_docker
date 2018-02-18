define(["require", "exports", "./Constants"], function (require, exports, Constants) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function computeRUUsagePrice(serverId, rupmEnabled, requestUnits) {
        if (serverId === "mooncake") {
            var ruCharge_1 = requestUnits * Constants.OfferPricing.HourlyPricing.mooncake.Standard.PricePerRU, rupmCharge_1 = rupmEnabled ? requestUnits * Constants.OfferPricing.HourlyPricing.mooncake.Standard.PricePerRUPM : 0;
            return calculateEstimateNumber(ruCharge_1 + rupmCharge_1) + " " + Constants.OfferPricing.HourlyPricing.mooncake.Currency;
        }
        var ruCharge = requestUnits * Constants.OfferPricing.HourlyPricing.default.Standard.PricePerRU, rupmCharge = rupmEnabled ? requestUnits * Constants.OfferPricing.HourlyPricing.default.Standard.PricePerRUPM : 0;
        return calculateEstimateNumber(ruCharge + rupmCharge) + " " + Constants.OfferPricing.HourlyPricing.default.Currency;
    }
    exports.computeRUUsagePrice = computeRUUsagePrice;
    function computeStorageUsagePrice(serverId, storageUsedRoundUpToGB) {
        if (serverId === "mooncake") {
            var storageCharge_1 = storageUsedRoundUpToGB * Constants.OfferPricing.HourlyPricing.mooncake.Standard.PricePerGB;
            return calculateEstimateNumber(storageCharge_1) + " " + Constants.OfferPricing.HourlyPricing.mooncake.Currency;
        }
        var storageCharge = storageUsedRoundUpToGB * Constants.OfferPricing.HourlyPricing.default.Standard.PricePerGB;
        return calculateEstimateNumber(storageCharge) + " " + Constants.OfferPricing.HourlyPricing.default.Currency;
    }
    exports.computeStorageUsagePrice = computeStorageUsagePrice;
    function computeDisplayUsageString(usageInKB) {
        var usageInMB = usageInKB / 1024, usageInGB = usageInMB / 1024, displayUsageString = usageInGB > 0.1 ? usageInGB.toFixed(2) + " GB" :
            usageInMB > 0.1 ? usageInMB.toFixed(2) + " MB" :
                usageInKB.toFixed(2) + " KB";
        return displayUsageString;
    }
    exports.computeDisplayUsageString = computeDisplayUsageString;
    function usageInGB(usageInKB) {
        var usageInMB = usageInKB / 1024, usageInGB = usageInMB / 1024;
        return Math.ceil(usageInGB);
    }
    exports.usageInGB = usageInGB;
    function calculateEstimateNumber(n) {
        return n >= 1 ? n.toFixed(2) : n.toPrecision(2);
    }
});
