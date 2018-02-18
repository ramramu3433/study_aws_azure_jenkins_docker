define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     * This component displays an error as designed in:
     * https://microsoft.sharepoint.com/teams/DPX/Modern/DocDB/_layouts/15/WopiFrame.aspx?sourcedoc={66864d4a-f925-4cbe-9eb4-79f8d191a115}&action=edit&wd=target%28DocumentDB%20emulator%2Eone%7CE617D0A7-F77C-4968-B75A-1451049F4FEA%2FError%20notification%7CAA1E4BC9-4D72-472C-B40C-2437FA217226%2F%29
     * TODO: support "More details"
     */
    var ErrorDisplayComponent = (function () {
        function ErrorDisplayComponent() {
            return {
                viewModel: ErrorDisplayViewModel,
                template: { require: "text!error-display-component.html" }
            };
        }
        return ErrorDisplayComponent;
    }());
    exports.ErrorDisplayComponent = ErrorDisplayComponent;
    var ErrorDisplayViewModel = (function () {
        function ErrorDisplayViewModel(params) {
            this.params = params;
        }
        return ErrorDisplayViewModel;
    }());
});
