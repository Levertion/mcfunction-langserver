import { createConnection, IPCMessageReader, IPCMessageWriter } from "vscode-languageserver";
// Creates the LSP connection
const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

connection.listen();
