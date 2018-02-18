"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var Host_1 = require("../Common/Host");
var fs = require("fs");
var path = require("path");
/**
 * We define a custom html-esque binding which will apply the view model to whatever html
 * the editor renders. Normally we might use a knockout templating for this, but since we want to be
 * able to render any html on demand (not just predefined templates), we use this method.
 */
ko.bindingHandlers.htmlTemplate = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // remove old bindings
        ko.cleanNode(element);
        // update the inner html, unrwap to support observables and/or normal properties
        element.innerHTML = ko.unwrap(valueAccessor());
        // apply the view model to the content of the element
        ko.applyBindingsToDescendants(viewModel, element);
    }
};
/**
 * View model for HtmlEditor
 */
var HtmlEditorViewModel = (function () {
    function HtmlEditorViewModel(parameters) {
        var _this = this;
        /* Observables */
        this.htmlContent = ko.observable();
        if (!!parameters.htmlFile) {
            fs.readFile(path.resolve(__dirname, "../../", parameters.htmlFile), function (err, data) {
                _this.htmlContent(data.toString());
            });
        }
        else {
            this.htmlContent(parameters.htmlData);
        }
    }
    HtmlEditorViewModel.prototype.openInBrowser = function (url) {
        Host_1.default.executeOperation("Environment.Browser.openUrl", { url: url });
    };
    return HtmlEditorViewModel;
}());
exports.default = HtmlEditorViewModel;
