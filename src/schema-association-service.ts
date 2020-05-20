/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as languageclient from 'vscode-languageclient';
import { log } from './logger';

export interface ISchemaAssociationService {
    getSchemaAssociation(): ISchemaAssociations;
}

// TODO: I think we can remove this class. Make it simpler?
export class SchemaAssociationService implements ISchemaAssociationService {

    /* Where the schema file is on disk. This is packaged with the extension, in the root, at service-schema.json. */
    schemaFilePath: string;

    constructor(extensionPath: string) {
        let schemaPath = path.join(extensionPath, './service-schema.json');

        let customPath: string = vscode.workspace
            .getConfiguration()
            .get('[azure-pipelines].schemaPath') as string;

        if (customPath) {
            if (!path.isAbsolute(customPath)) {
                const files = vscode.workspace.workspaceFolders.map((ws) =>
                    path.join(ws.uri.fsPath, customPath)
                );
                const foundSchema = files.find((f) => fs.existsSync(f));
                if (foundSchema) customPath = foundSchema;
            }

            if (fs.existsSync(customPath)) {
                log(`using cusom schema from '${customPath}'`);
                schemaPath = customPath;
            } else {
                log(`schema file '${customPath}' not found`, "error");
            }
        }

        this.schemaFilePath = vscode.Uri.file(schemaPath).toString();
    }

    public getSchemaAssociation(): ISchemaAssociations {
        return { '*': [this.schemaFilePath] };
    }
}

// TODO: Do we need this?
export interface ISchemaAssociations {
    [pattern: string]: string[];
}

// TODO: Do we need this?
export namespace SchemaAssociationNotification {
    export const type: languageclient.NotificationType<ISchemaAssociations, any> = new languageclient.NotificationType('json/schemaAssociations');
}
