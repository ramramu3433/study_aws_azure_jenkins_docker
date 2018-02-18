define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var EditableUtility = (function () {
        function EditableUtility() {
        }
        EditableUtility.observable = function (initialValue) {
            var observable = ko.observable(initialValue);
            observable.edits = ko.observableArray([initialValue]);
            observable.validations = ko.observableArray([]);
            observable.setBaseline = function (baseline) {
                observable(baseline);
                observable.edits([baseline]);
            };
            observable.getEditableCurrentValue = ko.computed(function () {
                var edits = observable.edits && observable.edits() || [];
                if (edits.length === 0) {
                    return undefined;
                }
                return edits[edits.length - 1];
            });
            observable.getEditableOriginalValue = ko.computed(function () {
                var edits = observable.edits && observable.edits() || [];
                if (edits.length === 0) {
                    return undefined;
                }
                return edits[0];
            });
            observable.editableIsDirty = ko.computed(function () {
                var edits = observable.edits && observable.edits() || [];
                if (edits.length <= 1) {
                    return false;
                }
                var current = observable.getEditableCurrentValue();
                var original = observable.getEditableOriginalValue();
                switch (typeof current) {
                    case "string":
                    case "undefined":
                    case "number":
                    case "boolean":
                        current = current && current.toString();
                        break;
                    default:
                        current = JSON.stringify(current);
                        break;
                }
                switch (typeof original) {
                    case "string":
                    case "undefined":
                    case "number":
                    case "boolean":
                        original = original && original.toString();
                        break;
                    default:
                        original = JSON.stringify(original);
                        break;
                }
                if (current !== original) {
                    return true;
                }
                return false;
            });
            observable.subscribe(function (edit) {
                var edits = observable.edits && observable.edits();
                if (!edits) {
                    return;
                }
                edits.push(edit);
                observable.edits(edits);
            });
            observable.editableIsValid = ko.observable(true);
            observable.subscribe(function (value) {
                var validations = observable.validations && observable.validations() || [];
                var isValid = validations.every(function (validate) { return validate(value); });
                observable.editableIsValid(isValid);
            });
            return observable;
        };
        return EditableUtility;
    }());
    return EditableUtility;
});
