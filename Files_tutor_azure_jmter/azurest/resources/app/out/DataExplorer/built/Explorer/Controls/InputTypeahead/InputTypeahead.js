/**
 * How to use this component:
 *
 * In your html markup, use:
 * <input-typeahead params="{
                                    choices:choices,
                                    selection:selection,
                                    inputValue:inputValue,
                                    placeholder:'Enter source',
                                    typeaheadOverrideOptions:typeaheadOverrideOptions
                                }"></input-typeahead>
 * The parameters are documented below.
 *
 * Notes:
 * - dynamic:true by default, this allows choices to change after initialization.
 *   To turn it off, use:
 *   typeaheadOverrideOptions: { dynamic:false }
 *
 */
define(["require", "exports", "jquery-typeahead"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var InputTypeaheadComponent = (function () {
        function InputTypeaheadComponent() {
            return {
                viewModel: InputTypeaheadViewModel,
                template: { require: "text!input-typeahead.html" }
            };
        }
        return InputTypeaheadComponent;
    }());
    exports.InputTypeaheadComponent = InputTypeaheadComponent;
    var InputTypeaheadViewModel = (function () {
        function InputTypeaheadViewModel(params) {
            this.instanceNumber = InputTypeaheadViewModel.instanceCount++;
            this.params = params;
            this.cache = {
                inputValue: null,
                selection: null
            };
        }
        /**
         * Must execute once ko is rendered, so that it can find the input element by id
         */
        InputTypeaheadViewModel.prototype.initializeTypeahead = function () {
            var _this = this;
            var params = this.params;
            var cache = this.cache;
            var options = {
                input: "#" + this.getComponentId(),
                order: 'asc',
                minLength: 0,
                searchOnFocus: true,
                source: {
                    display: "caption",
                    data: function () {
                        return _this.params.choices();
                    }
                },
                callback: {
                    onClick: function (node, a, item, event) {
                        cache.selection = item;
                        if (params.selection) {
                            params.selection(item);
                        }
                    },
                    onResult: function (node, query, result, resultCount, resultCountPerGroup) {
                        cache.inputValue = query;
                        if (params.inputValue) {
                            params.inputValue(query);
                        }
                    }
                },
                template: function (query, item) {
                    // Don't display id if caption *IS* the id
                    return item.caption === item.value ?
                        '<span>{{caption}}</span>' :
                        '<span><div>{{caption}}</div><div><small>{{value}}</small></div></span>';
                },
                dynamic: true
            };
            // Override options
            if (params.typeaheadOverrideOptions) {
                for (var p in params.typeaheadOverrideOptions) {
                    options[p] = params.typeaheadOverrideOptions[p];
                }
            }
            $.typeahead(options);
        };
        /**
         * Get this component id
         * @return unique id per instance
         */
        InputTypeaheadViewModel.prototype.getComponentId = function () {
            return "input-typeahead" + this.instanceNumber;
        };
        /**
         * Executed once ko is done rendering bindings
         * Use ko's "template: afterRender" callback to do that without actually using any template.
         * Another way is to call it within setTimeout() in constructor.
         */
        InputTypeaheadViewModel.prototype.afterRender = function () {
            this.initializeTypeahead();
        };
        InputTypeaheadViewModel.prototype.submit = function () {
            if (this.params.submitFct) {
                this.params.submitFct(this.cache.inputValue, this.cache.selection);
            }
        };
        return InputTypeaheadViewModel;
    }());
    InputTypeaheadViewModel.instanceCount = 0; // Generate unique id for each component's typeahead instance
});
