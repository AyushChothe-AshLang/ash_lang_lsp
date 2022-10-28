import {
  Connection,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  Position,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

export interface AshLangServerSettings {
  maxNumberOfProblems: number;
  executablePath: string;
  maxCompilerInvocationTime: number;
}

const defaultSettings: AshLangServerSettings = {
  maxNumberOfProblems: 1000,
  executablePath: "ash_lang_cli",
  maxCompilerInvocationTime: 5000,
};
let globalSettings: AshLangServerSettings = defaultSettings;

// Cache the settings of all open documents

export class SharedLSP {
  connection: Connection;
  documents: TextDocuments<TextDocument>;
  documentSettings: Map<string, Thenable<AshLangServerSettings>> = new Map();
  runAnalyze: Function;

  hasConfigurationCapability = true;
  hasWorkspaceFolderCapability = false;
  hasDiagnosticRelatedInformationCapability = false;

  constructor(connection: Connection, init: Function, runAnalyze: Function) {
    this.connection = connection;
    this.documents = new TextDocuments(TextDocument);
    this.documentSettings == new Map();
    this.runAnalyze = runAnalyze;

    this.connection.onInitialize(
      async (params: InitializeParams): Promise<InitializeResult> => {
        // Load Wasm Module
        await init();

        const result: InitializeResult = {
          capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
              resolveProvider: false,
            },
            workspace: {
              workspaceFolders: {
                supported: true,
              },
            },
            documentFormattingProvider: false,
          },
        };

        return result;
      },
    );

    this.connection.onInitialized(() => {
      this.connection.console.log("AshLang Server Initialized");
      if (this.hasConfigurationCapability) {
        this.connection.client.register(
          DidChangeConfigurationNotification.type,
          undefined,
        );
      }
    });

    this.documents.onDidOpen((e) => {
      this.connection.console.log("Document Open");
    });

    // Only keep settings for open documents
    this.documents.onDidClose((e) => {
      this.documentSettings.delete(e.document.uri);
    });

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    this.documents.onDidChangeContent((change) => {
      this.validateTextDocument(change.document);
    });

    this.connection.onDidChangeConfiguration((change) => {
      if (this.hasConfigurationCapability) {
        // Reset all cached document settings
        this.documentSettings.clear();
      } else {
        globalSettings = <AshLangServerSettings> (
          change.settings.ashlangServer || defaultSettings
        );
      }
      // Revalidate all open text documents
      this.documents.all().forEach(this.validateTextDocument);
    });

    this.documents.listen(this.connection);
    this.connection.listen();
  }

  getDocumentSettings(resource: string): Thenable<AshLangServerSettings> {
    if (!this.hasConfigurationCapability) {
      return Promise.resolve(globalSettings);
    }
    let result = this.documentSettings.get(resource);
    if (!result) {
      result = this.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: "ashlangServer",
      });
      this.documentSettings.set(resource, result);
    }
    return result;
  }

  getRange(stdout: string): [Position, Position] {
    const se = (stdout.match(/\[\d+:\d+\]/g))?.map((e) =>
      e.replace(/[[\]]/g, "")
    );
    let start: Position = <Position> { line: 0, character: 0 };
    let end: (Position | null) = null;
    if (!se) {
      return [start, end ?? start];
    }
    if (se) {
      start = <Position> {
        line: parseInt(se![0].split(":")[0]) - 1,
        character: parseInt(se![0].split(":")[1]) - 1,
      };
    }
    if (se?.length == 2) {
      end = <Position> {
        line: parseInt(se![1].split(":")[0]) - 1,
        character: parseInt(se![1].split(":")[1]) - 1,
      };
    }
    //   console.log(start, end);
    return [start, end ?? start];
  }

  async validateTextDocument(
    textDocument: TextDocument,
  ): Promise<void> {
    // In this simple example we get the settings for every validate run.
    const settings = await this.getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();
    const stdout = await this.runAnalyze(text, settings);
    const diagnostics: Diagnostic[] = [];

    if (stdout.trim() !== "") {
      const parts = stdout.split(":");
      const range = this.getRange(stdout);
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: range[0],
          end: range[1],
        },
        message: parts[parts.length - 1],
        source: "ashlang",
      };
      diagnostics.push(diagnostic);
    }

    // Send the computed diagnostics to VSCode.
    this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
