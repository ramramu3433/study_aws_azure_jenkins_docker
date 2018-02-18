/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Providers/CloudExplorer/Actions/CloudExplorerActions"], function (require, exports, rsvp, CloudExplorerActions) {
    "use strict";
    var Promise = rsvp.Promise;
    var ErrorsManager = (function () {
        function ErrorsManager(host) {
            var _this = this;
            /**
             * Handles the given actionable error showing an actionable notification about
             * it and executing the configured action if user agrees so. Returns a promise
             * that notifies if the action was executed.
             */
            this.handleActionableError = function (err, actionLoadingCallBack) {
                if (_this._pendingActionableError &&
                    _this.areActionableErrorEqual(_this._pendingActionableError.error, err)) {
                    // If there was a pending promise for the same actionable error with the same action and arguments,
                    // return it instead of notifying for the same error again.
                    return _this._pendingActionableError.promise;
                }
                // Prepare the promise that represents the actionable error execution
                var resolveFunction;
                var rejectFunction;
                var pendingPromise = new Promise(function (resolve, reject) {
                    resolveFunction = resolve;
                    rejectFunction = reject;
                });
                _this._host.executeOperation(CloudExplorerActions.showInfobarMessageNamespace, [{ message: err.message, link: err.link }])
                    .then(function (accepted) {
                    if (accepted) {
                        // Notify the caller we are loading the action.
                        if (actionLoadingCallBack) {
                            actionLoadingCallBack();
                        }
                        // The user accepted the execution of the action,
                        // execute it.
                        return _this._host.executeOperation(err.actionNamespace, [err.args])
                            .then(function () {
                            // Return that the issue was fixed
                            return Promise.resolve(true);
                        }, function (err) {
                            if (err && err.message) {
                                // Action failed, show error to understand why
                                _this._host.executeOperation(CloudExplorerActions.showErrorMessageBox, [{ message: err.message }]);
                            }
                            // The action couldn't be completed.
                            return Promise.resolve(false);
                        });
                    }
                    // The user didn't want to execute the action,
                    // return that the issue wasn't fixed.
                    return Promise.resolve(false);
                }).then(function (result) {
                    // Check if the error is still pending
                    if (_this._pendingActionableError &&
                        _this.areActionableErrorEqual(_this._pendingActionableError.error, err)) {
                        resolveFunction(result);
                        // Refresh the saved reference to the actionable error promise
                        // so it will be re-executed next time it happends.
                        _this._pendingActionableError = null;
                    }
                }).then(null, rejectFunction);
                // Save the reference of the actionable error to avoid a rexecution of it
                // the user while decide to fix it or not.
                _this._pendingActionableError = {
                    error: err,
                    resolve: resolveFunction,
                    promise: pendingPromise
                };
                return pendingPromise;
            };
            /**
             * Resolves the pending actionable error with the given name.
             */
            this.resolveActionableError = function (fixed, errorName) {
                if (errorName && _this._pendingActionableError && _this._pendingActionableError.error.innerError.name === errorName) {
                    _this._pendingActionableError.resolve(fixed);
                    _this._pendingActionableError = null;
                    _this._host.executeOperation(CloudExplorerActions.closeInfoBarNamespace);
                }
            };
            /**
             * Dismisses pending actionable errors.
             */
            this.dismissActionableErrors = function () {
                if (_this._pendingActionableError) {
                    _this._pendingActionableError.resolve(false);
                    _this._pendingActionableError = null;
                    _this._host.executeOperation(CloudExplorerActions.closeInfoBarNamespace);
                }
            };
            /**
             * Compares two actionable errors and returns true if they are equal, false otherwise.
             */
            this.areActionableErrorEqual = function (e1, e2) {
                // We identify actionable errors by a composition of its name, action and arguments.
                return !!e1 && !!e2 &&
                    e1.name === e2.name &&
                    e1.actionNamespace === e2.actionNamespace &&
                    JSON.stringify(e1.args) === JSON.stringify(e2.args);
            };
            this._host = host;
        }
        return ErrorsManager;
    }());
    return ErrorsManager;
});
