import { AshLangServerSettings, SharedLSP } from "./../shared";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { createConnection, ProposedFeatures } from "vscode-languageserver/node";

const connection = createConnection(ProposedFeatures.all);

import fs = require("fs");
import tmp = require("tmp");

import util = require("node:util");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = util.promisify(require("node:child_process").exec);
const tmpFile = tmp.fileSync();
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.

async function runCompiler(
  text: string,
  flags: string,
  settings: AshLangServerSettings,
): Promise<string> {
  try {
    fs.writeFileSync(tmpFile.name, text);
  } catch (e: any) {
    connection.console.log(e);
  }

  let stdout: string;
  try {
    const output = await exec(
      `${settings.executablePath} ${flags} ${tmpFile.name}`,
      {
        timeout: settings.maxCompilerInvocationTime,
      },
    );
    stdout = output.stdout;
  } catch (e: any) {
    stdout = e.stderr;
  }
  stdout = stdout.slice(0, stdout.length - 2);
  console.log(stdout);
  return stdout;
}

new SharedLSP(connection, () => {}, (text: any, settings: any) => {
  return runCompiler(text, "analyze", settings);
});
