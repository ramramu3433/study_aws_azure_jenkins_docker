/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var SubscriptionViewModel = (function () {
        function SubscriptionViewModel(model) {
            this.selected = ko.observable(true);
            this.model = model;
            this.name = this.model.name;
        }
        return SubscriptionViewModel;
    }());
    return SubscriptionViewModel;
});
