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
    locateSchemaFile(): void;
}

export class SchemaAssociationService implements ISchemaAssociationService {

    extensionPath: string;
    schemaFilePath: string;

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
        this.locateSchemaFile();
    }
    
    public locateSchemaFile() {
        let schemaPath = path.join(this.extensionPath, './service-schema.json');
        const alternateSchema: string = vscode.workspace.getConfiguration('[azure-pipelines]', null).get<string>('customSchemaFile');

        if (alternateSchema) {
            let files: string[];
            if (!path.isAbsolute(alternateSchema)) {
                files = vscode.workspace.workspaceFolders.map((ws) =>
                    path.join(ws.uri.fsPath, alternateSchema)
                );
            } else {
                files = [alternateSchema];
            }
            
            const foundSchema = files.find((f) => fs.existsSync(f));
            if (foundSchema) { 
                log(`using cusom schema from '${foundSchema}'`);
                schemaPath = foundSchema; 
            } else {
                log(`schema file '${alternateSchema}' not found in any of paths: ${files}`, "error");
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
