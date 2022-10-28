import { commands, OutputChannel, Terminal, window, workspace } from "vscode";
import {
  ExecuteCommandRequest,
  LanguageClientOptions,
} from "vscode-languageclient";

export const clientOptions: LanguageClientOptions = {
  documentSelector: [{ scheme: "file", language: "ashlang" }],
  synchronize: {},
  initializationOptions: {},
};

export const node_run_command = () =>
  commands.registerCommand("ashlang.run", () => {
    let c_name = "AshLang Console";
    let doc = window.activeTextEditor.document;
    let settings = workspace.getConfiguration("ashlangServer");
    let term: Terminal;

    window.terminals.forEach((t) => {
      if (t.name == c_name) {
        term = t;
      }
    });

    if (term != null) {
      term.show();
      term.sendText(`${settings.executablePath} run ${doc.fileName}`);
    } else {
      let term = window.createTerminal(c_name);
      term.show();
      term.sendText(`${settings.executablePath} run ${doc.fileName}`);
    }
  });

export const web_run_command = (client: any, out: OutputChannel) =>
  commands.registerCommand(
    "ashlang.run",
    async () => {
      out.clear();
      out.show();
      const code = window.activeTextEditor?.document?.getText();
      const res = await client.sendRequest(ExecuteCommandRequest.type, {
        command: "ashlang.run",
        arguments: [code],
      });
      out.append(res);
    },
  );
