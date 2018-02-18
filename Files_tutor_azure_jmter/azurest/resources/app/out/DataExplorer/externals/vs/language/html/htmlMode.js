/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * monaco-html version: 1.2.1(f1b96cadd5996161d6caaa3dfdf7c39b381053e8)
 * Released under the MIT license
 * https://github.com/Microsoft/monaco-html/blob/master/LICENSE.md
 *-----------------------------------------------------------------------------*/
!function(e){if("object"==typeof module&&"object"==typeof module.exports){var t=e(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define("vs/language/html/workerManager",["require","exports"],e)}(function(e,t){function n(e){var t,n,i=new r(function(e,r){t=e,n=r},function(){});return e.then(t,n),i}var r=monaco.Promise,i=12e4,o=function(){function e(e){var t=this;this._defaults=e,this._worker=null,this._idleCheckInterval=setInterval(function(){return t._checkIfIdle()},3e4),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(function(){return t._stopWorker()})}return e.prototype._stopWorker=function(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null},e.prototype.dispose=function(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()},e.prototype._checkIfIdle=function(){if(this._worker){var e=Date.now()-this._lastUsedTime;e>i&&this._stopWorker()}},e.prototype._getClient=function(){return this._lastUsedTime=Date.now(),this._client||(this._worker=monaco.editor.createWebWorker({moduleId:"vs/language/html/htmlWorker",createData:{languageSettings:this._defaults.options,languageId:this._defaults.languageId},label:this._defaults.languageId}),this._client=this._worker.getProxy()),this._client},e.prototype.getLanguageServiceWorker=function(){for(var e=this,t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];var i;return n(this._getClient().then(function(e){i=e}).then(function(n){return e._worker.withSyncedResources(t)}).then(function(e){return i}))},e}();t.WorkerManager=o}),function(e){if("object"==typeof module&&"object"==typeof module.exports){var t=e(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define("vscode-languageserver-types/main",["require","exports"],e)}(function(e,t){var n;!function(e){function t(e,t){return{line:e,character:t}}function n(e){var t=e;return K.defined(t)&&K.number(t.line)&&K.number(t.character)}e.create=t,e.is=n}(n=t.Position||(t.Position={}));var r;!function(e){function t(e,t,r,i){if(K.number(e)&&K.number(t)&&K.number(r)&&K.number(i))return{start:n.create(e,t),end:n.create(r,i)};if(n.is(e)&&n.is(t))return{start:e,end:t};throw new Error("Range#create called with invalid arguments["+e+", "+t+", "+r+", "+i+"]")}function r(e){var t=e;return K.defined(t)&&n.is(t.start)&&n.is(t.end)}e.create=t,e.is=r}(r=t.Range||(t.Range={}));var i;!function(e){function t(e,t){return{uri:e,range:t}}function n(e){var t=e;return K.defined(t)&&r.is(t.range)&&(K.string(t.uri)||K.undefined(t.uri))}e.create=t,e.is=n}(i=t.Location||(t.Location={}));var o;!function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4}(o=t.DiagnosticSeverity||(t.DiagnosticSeverity={}));var a;!function(e){function t(e,t,n,r,i){var o={range:e,message:t};return K.defined(n)&&(o.severity=n),K.defined(r)&&(o.code=r),K.defined(i)&&(o.source=i),o}function n(e){var t=e;return K.defined(t)&&r.is(t.range)&&K.string(t.message)&&(K.number(t.severity)||K.undefined(t.severity))&&(K.number(t.code)||K.string(t.code)||K.undefined(t.code))&&(K.string(t.source)||K.undefined(t.source))}e.create=t,e.is=n}(a=t.Diagnostic||(t.Diagnostic={}));var u;!function(e){function t(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var i={title:e,command:t};return K.defined(n)&&n.length>0&&(i.arguments=n),i}function n(e){var t=e;return K.defined(t)&&K.string(t.title)&&K.string(t.title)}e.create=t,e.is=n}(u=t.Command||(t.Command={}));var s;!function(e){function t(e,t){return{range:e,newText:t}}function n(e,t){return{range:{start:e,end:e},newText:t}}function r(e){return{range:e,newText:""}}e.replace=t,e.insert=n,e.del=r}(s=t.TextEdit||(t.TextEdit={}));var c=function(){function e(e){this.edits=e}return e.prototype.insert=function(e,t){this.edits.push(s.insert(e,t))},e.prototype.replace=function(e,t){this.edits.push(s.replace(e,t))},e.prototype["delete"]=function(e){this.edits.push(s.del(e))},e.prototype.add=function(e){this.edits.push(e)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e}(),d=function(){function e(e){var t=this;this._textEditChanges=Object.create(null),e?(this._workspaceEdit=e,e.changes.forEach(function(e){var n=new c(e.edits);t._textEditChanges[e.textDocument.uri]=n})):this._workspaceEdit={changes:[]}}return Object.defineProperty(e.prototype,"edit",{get:function(){return this._workspaceEdit},enumerable:!0,configurable:!0}),e.prototype.getTextEditChange=function(e){if(l.is(e)){var t=e,n=this._textEditChanges[t.uri];if(!n){var r=[],i={textDocument:t,edits:r};this._workspaceEdit.changes.push(i),n=new c(r),this._textEditChanges[t.uri]=n}return n}return this._textEditChanges[e]},e}();t.WorkspaceChange=d;var f;!function(e){function t(e){return{uri:e}}function n(e){var t=e;return K.defined(t)&&K.string(t.uri)}e.create=t,e.is=n}(f=t.TextDocumentIdentifier||(t.TextDocumentIdentifier={}));var l;!function(e){function t(e,t){return{uri:e,version:t}}function n(e){var t=e;return K.defined(t)&&K.string(t.uri)&&K.number(t.version)}e.create=t,e.is=n}(l=t.VersionedTextDocumentIdentifier||(t.VersionedTextDocumentIdentifier={}));var g;!function(e){function t(e,t,n,r){return{uri:e,languageId:t,version:n,text:r}}function n(e){var t=e;return K.defined(t)&&K.string(t.uri)&&K.string(t.languageId)&&K.number(t.version)&&K.string(t.text)}e.create=t,e.is=n}(g=t.TextDocumentItem||(t.TextDocumentItem={}));var m;!function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18}(m=t.CompletionItemKind||(t.CompletionItemKind={}));var p;!function(e){e.PlainText=1,e.Snippet=2}(p=t.InsertTextFormat||(t.InsertTextFormat={}));var h;!function(e){function t(e){return{label:e}}e.create=t}(h=t.CompletionItem||(t.CompletionItem={}));var v;!function(e){function t(e,t){return{items:e?e:[],isIncomplete:!!t}}e.create=t}(v=t.CompletionList||(t.CompletionList={}));var y;!function(e){function t(e){return e.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}e.fromPlainText=t}(y=t.MarkedString||(t.MarkedString={}));var _;!function(e){function t(e,t){return t?{label:e,documentation:t}:{label:e}}e.create=t}(_=t.ParameterInformation||(t.ParameterInformation={}));var b;!function(e){function t(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var i={label:e};return K.defined(t)&&(i.documentation=t),K.defined(n)?i.parameters=n:i.parameters=[],i}e.create=t}(b=t.SignatureInformation||(t.SignatureInformation={}));var x;!function(e){e.Text=1,e.Read=2,e.Write=3}(x=t.DocumentHighlightKind||(t.DocumentHighlightKind={}));var C;!function(e){function t(e,t){var n={range:e};return K.number(t)&&(n.kind=t),n}e.create=t}(C=t.DocumentHighlight||(t.DocumentHighlight={}));var I;!function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18}(I=t.SymbolKind||(t.SymbolKind={}));var k;!function(e){function t(e,t,n,r,i){var o={name:e,kind:t,location:{uri:r,range:n}};return i&&(o.containerName=i),o}e.create=t}(k=t.SymbolInformation||(t.SymbolInformation={}));var D;!function(e){function t(e){return{diagnostics:e}}function n(e){var t=e;return K.defined(t)&&K.typedArray(t.diagnostics,a.is)}e.create=t,e.is=n}(D=t.CodeActionContext||(t.CodeActionContext={}));var w;!function(e){function t(e,t){var n={range:e};return K.defined(t)&&(n.data=t),n}function n(e){var t=e;return K.defined(t)&&r.is(t.range)&&(K.undefined(t.command)||u.is(t.command))}e.create=t,e.is=n}(w=t.CodeLens||(t.CodeLens={}));var S;!function(e){function t(e,t){return{tabSize:e,insertSpaces:t}}function n(e){var t=e;return K.defined(t)&&K.number(t.tabSize)&&K["boolean"](t.insertSpaces)}e.create=t,e.is=n}(S=t.FormattingOptions||(t.FormattingOptions={}));var T=function(){function e(){}return e}();t.DocumentLink=T,function(e){function t(e,t){return{range:e,target:t}}function n(e){var t=e;return K.defined(t)&&r.is(t.range)&&(K.undefined(t.target)||K.string(t.target))}e.create=t,e.is=n}(T=t.DocumentLink||(t.DocumentLink={})),t.DocumentLink=T,t.EOL=["\n","\r\n","\r"];var E;!function(e){function t(e,t,n,r){return new P(e,t,n,r)}function n(e){var t=e;return!!(K.defined(t)&&K.string(t.uri)&&(K.undefined(t.languageId)||K.string(t.languageId))&&K.number(t.lineCount)&&K.func(t.getText)&&K.func(t.positionAt)&&K.func(t.offsetAt))}e.create=t,e.is=n}(E=t.TextDocument||(t.TextDocument={}));var M;!function(e){e.Manual=1,e.AfterDelay=2,e.FocusOut=3}(M=t.TextDocumentSaveReason||(t.TextDocumentSaveReason={}));var K,P=function(){function e(e,t,n,r){this._uri=e,this._languageId=t,this._version=n,this._content=r,this._lineOffsets=null}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!0,configurable:!0}),e.prototype.getText=function(){return this._content},e.prototype.update=function(e,t){this._content=e.text,this._version=t,this._lineOffsets=null},e.prototype.getLineOffsets=function(){if(null===this._lineOffsets){for(var e=[],t=this._content,n=!0,r=0;r<t.length;r++){n&&(e.push(r),n=!1);var i=t.charAt(r);n="\r"===i||"\n"===i,"\r"===i&&r+1<t.length&&"\n"===t.charAt(r+1)&&r++}n&&t.length>0&&e.push(t.length),this._lineOffsets=e}return this._lineOffsets},e.prototype.positionAt=function(e){e=Math.max(Math.min(e,this._content.length),0);var t=this.getLineOffsets(),r=0,i=t.length;if(0===i)return n.create(0,e);for(;r<i;){var o=Math.floor((r+i)/2);t[o]>e?i=o:r=o+1}var a=r-1;return n.create(a,e-t[a])},e.prototype.offsetAt=function(e){var t=this.getLineOffsets();if(e.line>=t.length)return this._content.length;if(e.line<0)return 0;var n=t[e.line],r=e.line+1<t.length?t[e.line+1]:this._content.length;return Math.max(Math.min(n+e.character,r),n)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!0,configurable:!0}),e}();!function(e){function t(e){return"undefined"!=typeof e}function n(e){return"undefined"==typeof e}function r(e){return e===!0||e===!1}function i(e){return"[object String]"===s.call(e)}function o(e){return"[object Number]"===s.call(e)}function a(e){return"[object Function]"===s.call(e)}function u(e,t){return Array.isArray(e)&&e.every(t)}var s=Object.prototype.toString;e.defined=t,e.undefined=n,e["boolean"]=r,e.string=i,e.number=o,e.func=a,e.typedArray=u}(K||(K={}))}),define("vscode-languageserver-types",["vscode-languageserver-types/main"],function(e){return e}),function(e){if("object"==typeof module&&"object"==typeof module.exports){var t=e(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define("vs/language/html/languageFeatures",["require","exports","vscode-languageserver-types"],e)}(function(e,t){function n(e){switch(e){case l.DiagnosticSeverity.Error:return monaco.Severity.Error;case l.DiagnosticSeverity.Warning:return monaco.Severity.Warning;case l.DiagnosticSeverity.Information:case l.DiagnosticSeverity.Hint:default:return monaco.Severity.Info}}function r(e,t){var r="number"==typeof t.code?String(t.code):t.code;return{severity:n(t.severity),startLineNumber:t.range.start.line+1,startColumn:t.range.start.character+1,endLineNumber:t.range.end.line+1,endColumn:t.range.end.character+1,message:t.message,code:r,source:t.source}}function i(e){if(e)return{character:e.column-1,line:e.lineNumber-1}}function o(e){if(e)return{start:i(e.getStartPosition()),end:i(e.getEndPosition())}}function a(e){if(e)return new g(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function u(e){var t=monaco.languages.CompletionItemKind;switch(e){case l.CompletionItemKind.Text:return t.Text;case l.CompletionItemKind.Method:return t.Method;case l.CompletionItemKind.Function:return t.Function;case l.CompletionItemKind.Constructor:return t.Constructor;case l.CompletionItemKind.Field:return t.Field;case l.CompletionItemKind.Variable:return t.Variable;case l.CompletionItemKind.Class:return t.Class;case l.CompletionItemKind.Interface:return t.Interface;case l.CompletionItemKind.Module:return t.Module;case l.CompletionItemKind.Property:return t.Property;case l.CompletionItemKind.Unit:return t.Unit;case l.CompletionItemKind.Value:return t.Value;case l.CompletionItemKind.Enum:return t.Enum;case l.CompletionItemKind.Keyword:return t.Keyword;case l.CompletionItemKind.Snippet:return t.Snippet;case l.CompletionItemKind.Color:return t.Color;case l.CompletionItemKind.File:return t.File;case l.CompletionItemKind.Reference:return t.Reference}return t.Property}function s(e){if(e)return{range:a(e.range),text:e.newText}}function c(e){var t=monaco.languages.DocumentHighlightKind;switch(e){case l.DocumentHighlightKind.Read:return t.Read;case l.DocumentHighlightKind.Write:return t.Write;case l.DocumentHighlightKind.Text:return t.Text}return t.Text}function d(e){return{tabSize:e.tabSize,insertSpaces:e.insertSpaces}}function f(e,t){return t.cancel&&e.onCancellationRequested(function(){return t.cancel()}),t}var l=e("vscode-languageserver-types"),g=(monaco.Uri,monaco.Range),m=function(){function e(e,t){var n=this;this._languageId=e,this._worker=t,this._disposables=[],this._listener=Object.create(null);var r=function(e){var t=e.getModeId();if(t===n._languageId){var r;n._listener[e.uri.toString()]=e.onDidChangeContent(function(){clearTimeout(r),r=setTimeout(function(){return n._doValidate(e.uri,t)},500)}),n._doValidate(e.uri,t)}},i=function(e){monaco.editor.setModelMarkers(e,n._languageId,[]);var t=e.uri.toString(),r=n._listener[t];r&&(r.dispose(),delete n._listener[t])};this._disposables.push(monaco.editor.onDidCreateModel(r)),this._disposables.push(monaco.editor.onWillDisposeModel(function(e){i(e)})),this._disposables.push(monaco.editor.onDidChangeModelLanguage(function(e){i(e.model),r(e.model)})),this._disposables.push({dispose:function(){for(var e in n._listener)n._listener[e].dispose()}}),monaco.editor.getModels().forEach(r)}return e.prototype.dispose=function(){this._disposables.forEach(function(e){return e&&e.dispose()}),this._disposables=[]},e.prototype._doValidate=function(e,t){this._worker(e).then(function(n){return n.doValidation(e.toString()).then(function(n){var i=n.map(function(t){return r(e,t)});monaco.editor.setModelMarkers(monaco.editor.getModel(e),t,i)})}).then(void 0,function(e){console.error(e)})},e}();t.DiagnostcsAdapter=m;var p=function(){function e(e){this._worker=e}return Object.defineProperty(e.prototype,"triggerCharacters",{get:function(){return[".",":","<",'"',"=","/"]},enumerable:!0,configurable:!0}),e.prototype.provideCompletionItems=function(e,t,n){var r=(e.getWordUntilPosition(t),e.uri);return f(n,this._worker(r).then(function(e){return e.doComplete(r.toString(),i(t))}).then(function(e){if(e){var t=e.items.map(function(e){var t={label:e.label,insertText:e.insertText,sortText:e.sortText,filterText:e.filterText,documentation:e.documentation,detail:e.detail,kind:u(e.kind)};return e.textEdit&&(t.range=a(e.textEdit.range),t.insertText=e.textEdit.newText),e.insertTextFormat===l.InsertTextFormat.Snippet&&(t.insertText={value:t.insertText}),t});return{isIncomplete:e.isIncomplete,items:t}}}))},e}();t.CompletionAdapter=p;var h=function(){function e(e){this._worker=e}return e.prototype.provideDocumentHighlights=function(e,t,n){var r=e.uri;return f(n,this._worker(r).then(function(e){return e.findDocumentHighlights(r.toString(),i(t))}).then(function(e){if(e)return e.map(function(e){return{range:a(e.range),kind:c(e.kind)}})}))},e}();t.DocumentHighlightAdapter=h;var v=function(){function e(e){this._worker=e}return e.prototype.provideLinks=function(e,t){var n=e.uri;return f(t,this._worker(n).then(function(e){return e.findDocumentLinks(n.toString())}).then(function(e){if(e)return e.map(function(e){return{range:a(e.range),url:e.target}})}))},e}();t.DocumentLinkAdapter=v;var y=function(){function e(e){this._worker=e}return e.prototype.provideDocumentFormattingEdits=function(e,t,n){var r=e.uri;return f(n,this._worker(r).then(function(e){return e.format(r.toString(),null,d(t)).then(function(e){if(e&&0!==e.length)return e.map(s)})}))},e}();t.DocumentFormattingEditProvider=y;var _=function(){function e(e){this._worker=e}return e.prototype.provideDocumentRangeFormattingEdits=function(e,t,n,r){var i=e.uri;return f(r,this._worker(i).then(function(e){return e.format(i.toString(),o(t),d(n)).then(function(e){if(e&&0!==e.length)return e.map(s)})}))},e}();t.DocumentRangeFormattingEditProvider=_}),function(e){if("object"==typeof module&&"object"==typeof module.exports){var t=e(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define("vs/language/html/htmlMode",["require","exports","./workerManager","./languageFeatures"],e)}(function(e,t){function n(e){var t=[],n=new r.WorkerManager(e);t.push(n);var o=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return n.getLanguageServiceWorker.apply(n,e)},a=e.languageId;t.push(monaco.languages.registerCompletionItemProvider(a,new i.CompletionAdapter(o))),t.push(monaco.languages.registerDocumentHighlightProvider(a,new i.DocumentHighlightAdapter(o))),t.push(monaco.languages.registerLinkProvider(a,new i.DocumentLinkAdapter(o))),"html"===a&&(t.push(monaco.languages.registerDocumentFormattingEditProvider(a,new i.DocumentFormattingEditProvider(o))),t.push(monaco.languages.registerDocumentRangeFormattingEditProvider(a,new i.DocumentRangeFormattingEditProvider(o))),t.push(new i.DiagnostcsAdapter(a,o)))}var r=e("./workerManager"),i=e("./languageFeatures");t.setupMode=n});