import { SharedLSP } from "./../shared";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
} from "vscode-languageserver/browser";

import init, { run } from "ash_lang";

/* browser specific setup code */

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

/* from here on, all code is non-browser specific and could be shared with a regular extension */

// Execute in Web
connection.onExecuteCommand(async (req) => {
  const code = req.arguments?.[0] ?? "";

  try {
    const start = performance.now();
    let res = await run(code);
    const end = performance.now();
    res += `\nExecuted in ${(end - start).toFixed(2)} ms`;
    return res;
  } catch (e) {
    return e;
  }
});

async function analyze(code: any) {
  try {
    let res = await run(code);
    console.log("Diagnostic");
    return "";
  } catch (e) {
    return e;
  }
}

new SharedLSP(connection, init, (text: any, settings: any) => {
  return analyze(text);
});
