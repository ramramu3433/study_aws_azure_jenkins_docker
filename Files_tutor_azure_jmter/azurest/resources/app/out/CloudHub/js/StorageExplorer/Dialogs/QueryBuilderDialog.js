// // /*!---------------------------------------------------------
// //  * Copyright (C) Microsoft Corporation. All rights reserved.
// //  *----------------------------------------------------------*/
// //
// // /// <reference path="../../../../Scripts/global.d.ts" />
// // /// <amd-dependency path="StorageExplorer/Dialogs/StorageExplorerKnockoutBindings">// // import $ = require("jquery");
// // import ko = require("knockout");
// //
// // import AzureConstants = require("Azure/Common/AzureConstants");
// // import DialogViewModel = require("StorageExplorer/Dialogs/DialogViewModel");
// // import DaytonaHostProxy = require("Common/DaytonaHostProxy");
// // import EnvironmentActions = require("Common/EnvironmentActions");
// // import StorageExplorerConstants = require("Azure/StorageExplorer/StorageExplorerConstants");
// // import TelemetryActions = require("Common/TelemetryActions");
// // import Utilities = require("Common/Utilities");
// //
// // class QueryClause {
// //     public clauseRule = ko.observable<string>();
// //     public propertyName = ko.observable<string>();
// //     public operator = ko.observable<string>();
// //     public conditionValue = ko.observable<string>("");
// //
// //     private _parentViewModel: QueryBuilderDialogViewModel;
// //
// //     constructor(queryBulderViewModel: QueryBuilderDialogViewModel) {
// //         this.clauseRule(queryBulderViewModel.clauseRules()[0]);
// //         this.propertyName(queryBulderViewModel.propertyNames[0]);
// //         this.operator(queryBulderViewModel.operators()[0]);
// //
// //         this._parentViewModel = queryBulderViewModel;
// //     }
// //
// //     public removeClause = (): void => {
// //         this._parentViewModel.queryClauses.remove(this);
// //     }
// // }
// //
// // /**
// //  * View model for query builder dialog
// //  */
// // class QueryBuilderDialogViewModel extends DialogViewModel {
// //     /* Labels */
// //     public titleLabel = "Query Builder";            // localize
// //     public topLabel = "Top";                        // localize
// //     public clauseRuleLabel = "And/Or";              // localize
// //     public propertyNameLabel = "Property Name";     // localize
// //     public operatorLabel = "Operator";              // localize
// //     public conditionValueLabel = "Value";           // localize
// //
// //     /* Controls */
// //     public addClauseLabel = "Add Clause";                  // localize
// //
// //     public clauseRules = ko.observableArray([
// //         StorageExplorerConstants.ClauseRule.And,
// //         StorageExplorerConstants.ClauseRule.Or
// //     ]);
// //
// //     public operators = ko.observableArray<string>([
// //         StorageExplorerConstants.Operator.EqualTo,
// //         StorageExplorerConstants.Operator.GreaterThan,
// //         StorageExplorerConstants.Operator.GreaterThanOrEqualTo,
// //         StorageExplorerConstants.Operator.LessThan,
// //         StorageExplorerConstants.Operator.LessThanOrEqualTo,
// //         StorageExplorerConstants.Operator.NotEqualTo
// //     ]);
// //
// //     public propertyNames: Array<string>;
// //     public queryClauses = ko.observableArray<QueryClause>();
// //     public selectedProperties = ko.observableArray<string>();
// //     public topValue = ko.observable<number>();
// //     public selectClicked = ko.observable<boolean>();
// //
// //     private _originalPropertyNamesLength: number;
// //
// //     constructor(parameters: any, environmentActions: EnvironmentActions) {
// //         super(AzureConstants.registeredDialogs.queryBuilderDialog, environmentActions);
// //
// //         this.propertyNames = parameters.propertyNames;
// //         this.selectedProperties(this.propertyNames);
// //         this._originalPropertyNamesLength = this.propertyNames.length;
// //
// //         // A placeholder clause
// //         this.addClause();
// //         this.selectClicked(false);
// //
// //         this.addCustomButton(
// //             DialogViewModel.okKey,
// //             DialogViewModel.okCaption,
// //             () => this.environmentActions.dismissDialog(this.getParameters()),
// //             ko.pureComputed(() => true)
// //         );
// //         this.addCancelButton();
// //     }
// //
// //     public showSelections = (): void => {
// //         this.selectClicked(!this.selectClicked());
// //     }
// //
// //     private getParameters = (): CloudHub.Azure.ITableQuery => {
// //         return <CloudHub.Azure.ITableQuery>{
// //             select: this.getSelectResults(),
// //             top: this.topValue(),
// //             filter: this.getFilterFromClauses()
// //         };
// //     }
// //
// //     private getSelectResults = (): Array<string> => {
// //         if (this.selectedProperties().length === this._originalPropertyNamesLength) {
// //             return null;
// //         }
// //         return this.selectedProperties();
// //     }
// //
// //     private getFilterFromClauses = (): string => {
// //         var filterString: string = "";
// //         this.queryClauses().forEach((clause: QueryClause, index: number) => {
// //             if (clause.conditionValue()) {
// //                 filterString = filterString.concat(this.contructClause(
// //                     index === 0 ? "" : clause.clauseRule(),
// //                     clause.propertyName(),
// //                     clause.operator(),
// //                     clause.conditionValue()
// //                 ));
// //             }
// //         });
// //         return filterString;
// //     }
// //
// //     private contructClause = (clauseRule: string, propertyName: string, operator: string, value: string): string => {
// //         return ` ${clauseRule.toLowerCase()} ${propertyName} ${this.operatorConverter(operator)} \'${value}\'`;
// //     }
// //
// //     private operatorConverter = (operator: string): string => {
// //         switch (operator) {
// //             case StorageExplorerConstants.Operator.EqualTo:
// //                 return StorageExplorerConstants.ODataOperator.EqualTo;
// //             case StorageExplorerConstants.Operator.GreaterThan:
// //                 return StorageExplorerConstants.ODataOperator.GreaterThan;
// //             case StorageExplorerConstants.Operator.GreaterThanOrEqualTo:
// //                 return StorageExplorerConstants.ODataOperator.GreaterThanOrEqualTo;
// //             case StorageExplorerConstants.Operator.LessThan:
// //                 return StorageExplorerConstants.ODataOperator.LessThan;
// //             case StorageExplorerConstants.Operator.LessThanOrEqualTo:
// //                 return StorageExplorerConstants.ODataOperator.LessThanOrEqualTo;
// //             case StorageExplorerConstants.Operator.NotEqualTo:
// //                 return StorageExplorerConstants.ODataOperator.NotEqualTo;
// //         }
// //     }
// //
// //     public addClause = (): void => {
// //         this.queryClauses.push(new QueryClause(this));
// //     }
// // }
// //
// // $(document).ready(() => {
// //     window.pluginReady(() => {
// //         var hostProxy = new DaytonaHostProxy();
// //         var telemetryActions = new TelemetryActions(hostProxy);
// //         var environmentActions = new EnvironmentActions(hostProxy, telemetryActions);
// //         var parameters = Utilities.getPluginParameters();
// //         var viewModel = new QueryBuilderDialogViewModel(parameters, environmentActions);
// //         ko.applyBindings(viewModel);
// //     });
// // });
