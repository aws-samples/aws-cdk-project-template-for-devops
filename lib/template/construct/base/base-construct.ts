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
import * as s3 from '@aws-cdk/aws-s3'
import * as ssm from '@aws-cdk/aws-ssm'


export interface ConstructCommonProps {
    projectPrefix: string;
    stackConfig: any;
    region: string;
    account: string;
    variable?: any;
}

export class BaseConstruct extends cdk.Construct {
    protected projectPrefix: string;
    protected commonProps: ConstructCommonProps;
    protected stackConfig: any;

    constructor(scope: cdk.Construct, id: string, props: ConstructCommonProps) {
        super(scope, id);

        this.projectPrefix = props.projectPrefix;
        this.commonProps = props;
        this.stackConfig = props.stackConfig;

    }

    protected exportOutput(key: string, value: string) {
        new cdk.CfnOutput(this, `Output-${key}`, {
            exportName: `${this.projectPrefix}-${key}`,
            value: value
        });
    }

    protected createS3Bucket(baseName: string): s3.Bucket {
        const suffix: string = `${this.commonProps.region}-${this.commonProps.account.substr(0, 5)}`

        const s3Bucket = new s3.Bucket(this, baseName, {
            bucketName: `${this.projectPrefix}-${baseName}-${suffix}`.toLowerCase().replace('_', '-'),
            versioned: false,
            removalPolicy: cdk.RemovalPolicy.RETAIN // for prod, RETAIN is safe
        });

        return s3Bucket;
    }

    protected putParameter(paramKey: string, paramValue: string): string {
        const paramKeyWithPrefix = `${this.projectPrefix}-${paramKey}`;

        new ssm.StringParameter(this, paramKey, {
            parameterName: paramKeyWithPrefix,
            stringValue: paramValue,
        });

        return paramKey;
    }

    protected getParameter(paramKey: string): string {
        const paramKeyWithPrefix = `${this.projectPrefix}-${paramKey}`;
        
        return ssm.StringParameter.valueForStringParameter(
            this,
            paramKeyWithPrefix
        );
    }

    protected putVariable(variableKey: string, variableValue: string) {
        this.commonProps.variable[variableKey] = variableValue;
    }

    protected getVariable(variableKey: string): string {
        return this.commonProps.variable[variableKey];
    }
} 