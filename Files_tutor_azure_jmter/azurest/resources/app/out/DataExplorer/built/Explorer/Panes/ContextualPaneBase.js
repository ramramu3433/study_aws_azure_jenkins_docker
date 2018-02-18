define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextualPaneBase = (function () {
        function ContextualPaneBase(options) {
            this.id = options.id;
            this.daytonaContext = options.daytonaContext;
            this.documentClientUtility = options.documentClientUtility;
            this.isRunningOnDaytona = options.isRunningOnDaytona;
            this.visible = options.visible || ko.observable(false);
            this.firstFieldHasFocus = ko.observable(false);
            this.errorDetailsVisible = ko.observable(false);
            this.formErrors = ko.observable();
            this.title = ko.observable();
            this.formErrorsDetails = ko.observable();
        }
        ContextualPaneBase.prototype.cancel = function () {
            this.close();
        };
        ContextualPaneBase.prototype.close = function () {
            if (this.isRunningOnDaytona) {
                this.daytonaContext.hostProxy.executeOperation("Environment.dismissDialog", [null]);
            }
            else {
                this.visible(false);
                this.resetData();
            }
        };
        ContextualPaneBase.prototype.hideErrorDetails = function () {
            this.errorDetailsVisible(false);
        };
        ContextualPaneBase.prototype.open = function () {
            this.visible(true);
            this.firstFieldHasFocus(true);
        };
        ContextualPaneBase.prototype.resetData = function () {
            this.firstFieldHasFocus(false);
            this.errorDetailsVisible(false);
            this.formErrors(null);
            this.formErrorsDetails(null);
        };
        ContextualPaneBase.prototype.showErrorDetails = function () {
            this.errorDetailsVisible(true);
        };
        ContextualPaneBase.prototype.submit = function () {
            this.close();
        };
        ContextualPaneBase.prototype.onCloseKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.close();
            }
        };
        ContextualPaneBase.prototype.onPaneKeyDown = function (source, event) {
            if (event.key === "Escape") {
                this.close();
                return false;
            }
            return true;
        };
        return ContextualPaneBase;
    }());
    exports.ContextualPaneBase = ContextualPaneBase;
});
