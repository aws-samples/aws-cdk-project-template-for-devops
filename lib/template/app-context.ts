/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const fs = require('fs');
const env = require('env-var');
import * as cdk from '@aws-cdk/core';

import { AppConfig } from './app-config';
import { StackCommonProps } from './stack/base/base-stack';


export class AppContextError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AppConfigFileFailError";
    }
}

export interface AppContextProps {
    appConfigFileKey: string;
    contextArgs?: string[];
}

export class AppContext {
    public readonly cdkApp: cdk.App;
    public readonly appConfig: AppConfig;
    public readonly stackCommonProps: StackCommonProps;

    constructor(props: AppContextProps) {
        this.cdkApp = new cdk.App();

        try {
            const appConfigFile = this.findAppConfigFile(props.appConfigFileKey);

            this.appConfig = this.loadAppConfigFile(appConfigFile, props.contextArgs);

            if (this.appConfig != undefined) {
                this.stackCommonProps = this.createStackCommonProps(appConfigFile);
            }

        } catch (e) {
            console.error(`==> CDK App-Config File is empty, 
            set up your environment variable(Usage: export ${props.appConfigFileKey}=config/app-config-xxx.json) 
            or append inline-argurment(Usage: cdk list --context ${props.appConfigFileKey}=config/app-config-xxx.json)`);
            throw new AppContextError('Fail to find App-Config json file');
        }
    }

    public ready(): boolean {
        return this.stackCommonProps ? true : false;
    }

    private createStackCommonProps(appConfigFile: string): StackCommonProps {
        const stackProps: StackCommonProps = {
            projectPrefix: this.getProjectPrefix(this.appConfig.Project.Name, this.appConfig.Project.Stage),
            appConfig: this.appConfig,
            appConfigPath: appConfigFile,
            env: {
                account: this.appConfig.Project.Account,
                region: this.appConfig.Project.Region
            },
            variables: {}
        }

        return stackProps;
    }

    private findAppConfigFile(appConfigKey: string): string {
        let fromType = 'InLine-Argument';
        let configFilePath = this.cdkApp.node.tryGetContext(appConfigKey);

        if (configFilePath == undefined) {
            configFilePath = env.get(appConfigKey).asString();

            if (configFilePath != undefined && configFilePath.length > 0) {
                fromType = 'Environment-Variable';
            } else {
                configFilePath = undefined;
            }
        }

        if (configFilePath == undefined) {
            throw new Error('Fail to find App-Config json file')
        } else {
            console.info(`==> CDK App-Config File is ${configFilePath}, which is from ${fromType}.`);
        }

        return configFilePath;
    }

    private getProjectPrefix(projectName: string, projectStage: string): string {
        return `${projectName}${projectStage}`;
    }

    private loadAppConfigFile(filePath: string, contextArgs?: string[]): any {
        let appConfig = JSON.parse(fs.readFileSync(filePath).toString());
        let projectPrefix = this.getProjectPrefix(appConfig.Project.Name, appConfig.Project.Stage);

        if (contextArgs != undefined) {
            this.updateContextArgs(appConfig, contextArgs);
        }

        this.addPrefixIntoStackName(appConfig, projectPrefix);

        return appConfig;
    }

    private updateContextArgs(appConfig: any, contextArgs: string[]) {
        for (let key of contextArgs) {
            const jsonKeys = key.split('.');
            let oldValue = '';
            const newValue: string = this.cdkApp.node.tryGetContext(key);

            if (newValue != undefined) {
                if (jsonKeys.length == 1) {
                    oldValue = appConfig[jsonKeys[0]];
                    appConfig[jsonKeys[0]] = newValue;
                } else if (jsonKeys.length == 2) {
                    oldValue = appConfig[jsonKeys[0]][jsonKeys[1]]
                    appConfig[jsonKeys[0]][jsonKeys[1]] = newValue;
                } else if (jsonKeys.length == 3) {
                    oldValue = appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]];
                    appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]] = newValue;
                } else if (jsonKeys.length == 4) {
                    oldValue = appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]][jsonKeys[3]];
                    appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]][jsonKeys[3]] = newValue;
                } else if (jsonKeys.length == 5) {
                    oldValue = appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]][jsonKeys[3]][jsonKeys[4]];
                    appConfig[jsonKeys[0]][jsonKeys[1]][jsonKeys[2]][jsonKeys[3]][jsonKeys[4]] = newValue;
                }

                console.info(`updateContextArgs: ${key} = ${oldValue}-->${newValue}`);
            }
        }
    }

    private addPrefixIntoStackName(appConfig: any, projectPrefix: string) {
        for (const key in appConfig.Stack) {
            const stackOriginalName = appConfig.Stack[key].Name;
            appConfig.Stack[key].ShortStackName = stackOriginalName;
            appConfig.Stack[key].Name = `${projectPrefix}-${stackOriginalName}`;
        }
    }
}
