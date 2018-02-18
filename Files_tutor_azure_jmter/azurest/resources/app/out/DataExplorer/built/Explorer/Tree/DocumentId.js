define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DocumentId = (function () {
        function DocumentId(container, data, partitionKeyValue) {
            this.container = container;
            this.self = data._self;
            this.rid = data._rid;
            this.ts = data._ts;
            this.partitionKeyValue = partitionKeyValue;
            this.partitionKeyProperty = container.partitionKeyProperty;
            this.partitionKey = container.partitionKey;
            this.stringPartitionKeyValue = this.getPartitionKeyValueAsString();
            this.id = ko.observable(data.id);
            this.isDirty = ko.observable(false);
        }
        DocumentId.prototype.click = function () {
            if (!this.container.isRunningOnDaytona) {
                if (!this.container.isEditorDirty() || window.confirm("Your unsaved changes will be lost.")) {
                    this.loadDocument();
                }
                return;
            }
            this.clickInDaytona();
        };
        DocumentId.prototype.loadDocument = function () {
            var _this = this;
            var documentsTab = this.container;
            this.container.selectedDocumentId(this);
            return documentsTab.documentClientUtility.readDocument(this, null /*options*/)
                .then(function (content) {
                _this.container.selectedDocumentContent.setBaseline(content);
                _this.container.createDocumentEditor(_this);
            });
        };
        DocumentId.prototype.clickInDaytona = function () {
            var _this = this;
            if (!this.container.isEditorDirty()) {
                this.loadDocument();
                return;
            }
            this.container.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptYesNo", {
                iconType: "question",
                message: "Your unsaved changes will be lost. Do you want to continue?"
            }).then(function (response) {
                if (response) {
                    _this.loadDocument();
                }
            });
        };
        DocumentId.prototype.getPartitionKeyValueAsString = function () {
            var partitionKeyValue = this.partitionKeyValue;
            var typeOfPartitionKeyValue = typeof partitionKeyValue;
            if (typeOfPartitionKeyValue === "undefined" ||
                typeOfPartitionKeyValue === "null" ||
                typeOfPartitionKeyValue === "object") {
                return "";
            }
            if (typeOfPartitionKeyValue === "string") {
                return partitionKeyValue;
            }
            return JSON.stringify(partitionKeyValue);
        };
        return DocumentId;
    }());
    return DocumentId;
});
