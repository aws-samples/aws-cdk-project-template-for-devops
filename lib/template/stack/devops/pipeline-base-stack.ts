
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

import * as iam from 'aws-cdk-lib/aws-iam';

import * as base from '../base/base-stack';
import { AppContext } from '../../app-context';
import * as pipeline from '../../construct/pattern/pipeline-simple-pattern';


export abstract class PipelineBaseStack extends base.BaseStack {

    private simplePipeline: pipeline.PipelineSimplePattern;

    abstract onPipelineName(): string;
    abstract onActionFlow(): pipeline.ActionProps[];
    abstract onPostConstructor(pipeline: pipeline.PipelineSimplePattern): void;
    protected onBuildPolicies(): iam.PolicyStatement[]|undefined {
        return undefined
    }

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const pipelineName = this.onPipelineName();
        const actionFlow = this.onActionFlow();

        this.simplePipeline = new pipeline.PipelineSimplePattern(this, 'SimplePipeline', {
            pipelineName,
            actionFlow,
            stackConfig,
            projectPrefix: this.projectPrefix,
            stackName: this.stackName,
            env: this.commonProps.env!,
            variables: this.commonProps.variables
        });

        this.onPostConstructor(this.simplePipeline);
    }
}
