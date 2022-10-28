/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext, Uri, window } from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";

import { LanguageClient } from "vscode-languageclient/browser";

import * as shared from "../shared";

// this method is called when vs code is activated
export function activate(context: ExtensionContext) {
  console.log("AshLang server activated!");

  const out = window.createOutputChannel("AshLang Console");
  const client = createWorkerLanguageClient(context, shared.clientOptions);

  const disposable = client.start();

  context.subscriptions.push(shared.web_run_command(client, out));
  context.subscriptions.push(disposable);

  client.onReady().then(() => {
    console.log("AshLang server is ready");
  });
}

function createWorkerLanguageClient(
  context: ExtensionContext,
  clientOptions: LanguageClientOptions,
) {
  // Create a worker. The worker main file implements the language server.
  const serverMain = Uri.joinPath(
    context.extensionUri,
    "server/dist/web_server.js",
  );
  const worker = new Worker(serverMain.toString(true));

  // create the language server client to communicate with the server running in the worker
  return new LanguageClient(
    "ashlangServer",
    "AshLang Server",
    clientOptions,
    worker,
  );
}
