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

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';


export interface ICommonGuardian {
    createS3BucketName(baseName: string, suffix?: boolean): string;
    createS3Bucket(baseName: string, suffix?: boolean, encryption?: s3.BucketEncryption, versioned?: boolean): s3.Bucket;
}

export interface CommonGuardianProps {
    stackName: string;
    projectPrefix: string;
    construct: Construct;
    env: cdk.Environment;
    variables: any;
}

export class CommonGuardian implements ICommonGuardian {
    protected stackName: string;
    protected projectPrefix: string;
    protected props: CommonGuardianProps;

    constructor(props: CommonGuardianProps) {
        this.stackName = props.stackName;
        this.props = props;
        this.projectPrefix = props.projectPrefix;
    }

    createS3BucketName(baseName: string, suffix=true): string {
        if (suffix === undefined || suffix === true) {
            const finalSuffix = `${this.props.env?.region}-${this.props.env?.account?.substr(0, 5)}`
            return `${this.stackName}-${baseName}-${finalSuffix}`.toLowerCase().replace('_', '-');
        } else {
            return `${this.stackName}-${baseName}`.toLowerCase().replace('_', '-');
        }
    }

    createS3Bucket(baseName: string, suffix=true, encryption?: s3.BucketEncryption, versioned?: boolean): s3.Bucket {
        const bucketName = this.createS3BucketName(baseName, suffix);

        const s3Bucket = new s3.Bucket(this.props.construct, `${baseName}-bucket`, {
            bucketName: bucketName,
            encryption: encryption == undefined ? s3.BucketEncryption.S3_MANAGED : encryption,
            versioned: versioned == undefined ? false : versioned,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });

        return s3Bucket;
    }
}
