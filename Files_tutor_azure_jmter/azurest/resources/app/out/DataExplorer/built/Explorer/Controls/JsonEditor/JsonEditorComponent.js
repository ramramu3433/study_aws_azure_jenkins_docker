define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var JsonEditorComponent = (function () {
        function JsonEditorComponent() {
            return {
                viewModel: JsonEditorViewModel,
                template: { require: "text!json-editor-component.html" }
            };
        }
        return JsonEditorComponent;
    }());
    exports.JsonEditorComponent = JsonEditorComponent;
    /**
     * JSON Editor:
     *  A ko wrapper for the Monaco editor
     *
     * How to use in your markup:
     * <json-editor params="{ isReadOnly:true, content:myJsonString }"></json-editor>
     *
     * In writable mode, if you want to get changes to the content pass updatedContent and subscribe to it.
     * content and updateContent are different to prevent circular updates.
     */
    var JsonEditorViewModel = (function () {
        function JsonEditorViewModel(params) {
            var _this = this;
            this.instanceNumber = JsonEditorViewModel.instanceCount++;
            this.params = params;
            this.params.content.subscribe(function (newValue) {
                _this.createEditor(newValue, _this.configureEditor.bind(_this));
            });
        }
        JsonEditorViewModel.prototype.getEditorId = function () {
            return "jsoneditor" + this.instanceNumber;
        };
        /**
        * Create the monaco editor and attach to DOM
        */
        JsonEditorViewModel.prototype.createEditor = function (content, createCallback) {
            var _this = this;
            require(['vs/editor/editor.main'], function () {
                var container = document.getElementById(_this.getEditorId());
                var options = {
                    value: content,
                    language: 'json',
                    readOnly: _this.params.isReadOnly,
                    lineNumbers: "off",
                    fontSize: 12
                    // wrappingColumn:0
                };
                container.innerHTML = "";
                createCallback(monaco.editor.create(container, options));
            });
        };
        JsonEditorViewModel.prototype.configureEditor = function (editor) {
            var _this = this;
            this.editor = editor;
            var queryEditorModel = this.editor.getModel();
            if (!this.params.isReadOnly && this.params.updatedContent) {
                queryEditorModel.onDidChangeContent(function (e) {
                    var queryEditorModel = _this.editor.getModel();
                    _this.params.updatedContent(queryEditorModel.getValue());
                });
            }
        };
        return JsonEditorViewModel;
    }());
    JsonEditorViewModel.instanceCount = 0; // Generate unique id to get different monaco editor
});
