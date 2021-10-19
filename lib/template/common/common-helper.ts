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

import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm'


export interface ICommonHelper {
    findEnumType<T>(enumType: T, target: string): T[keyof T];
    exportOutput(key: string, value: string): void;
    putParameter(paramKey: string, paramValue: string): string;
    getParameter(paramKey: string): string;
    putVariable(variableKey: string, variableValue: string): void;
    getVariable(variableKey: string): string;
}

export interface CommonHelperProps {
    stackName: string;
    projectPrefix: string;
    construct: cdk.Construct;
    env: cdk.Environment;
    variables: any;
}

export class CommonHelper implements ICommonHelper {
    protected stackName: string;
    protected projectPrefix: string;
    protected props: CommonHelperProps;

    constructor(props: CommonHelperProps) {
        this.stackName = props.stackName;
        this.props = props;
        this.projectPrefix = props.projectPrefix;
    }

    public findEnumType<T>(enumType: T, target: string): T[keyof T] {
        type keyType = keyof typeof enumType;

        const keyInString = Object.keys(enumType).find(key =>
            // console.log(`${key} = ${enumType[key as keyof typeof enumType]}`);
            // (<any>EnumType)['StringKeyofEnumType']
            target == `${enumType[key as keyof typeof enumType]}` as string
        );

        const key = keyInString as keyType;
        return enumType[key];
    }

    public exportOutput(key: string, value: string) {
        new cdk.CfnOutput(this.props.construct, `Output-${key}`, {
            exportName: `${this.projectPrefix}-${key}`,
            value: value
        });
    }

    public putParameter(paramKey: string, paramValue: string): string {
        const paramKeyWithPrefix = `${this.projectPrefix}-${paramKey}`;

        new ssm.StringParameter(this.props.construct, paramKey, {
            parameterName: paramKeyWithPrefix,
            stringValue: paramValue,
        });

        return paramKey;
    }

    public getParameter(paramKey: string): string {
        const paramKeyWithPrefix = `${this.projectPrefix}-${paramKey}`;

        return ssm.StringParameter.valueForStringParameter(
            this.props.construct,
            paramKeyWithPrefix
        );
    }

    public putVariable(variableKey: string, variableValue: string) {
        this.props.variables[variableKey] = variableValue;
    }

    public getVariable(variableKey: string): string {
        return this.props.variables[variableKey];
    }
}
