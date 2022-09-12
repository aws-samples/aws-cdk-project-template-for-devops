import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cfn_inc from 'aws-cdk-lib/cloudformation-include';

import * as base from '../../lib/template/stack/cfn/cfn-include-stack';
import { Override } from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';
import { StackConfig } from '../../lib/template/app-config'


export class SampleCfnVpcStack extends base.CfnIncludeStack {

    constructor(appContext: AppContext, stackConfig: StackConfig) {
        super(appContext, stackConfig);
    }

    @Override
    onLoadTemplateProps(): base.CfnTemplateProps | undefined {
        return {
            templatePath: this.stackConfig.TemplatePath,
            parameters: this.stackConfig.Parameters
        };
    }

    @Override
    onPostConstructor(cfnTemplate?: cfn_inc.CfnInclude) {
        const cfnVpc = cfnTemplate?.getResource('VPC') as ec2.CfnVPC;

        const vpcName = this.stackConfig.Parameters[0]['Value'];
        this.putVariable('VpcName', vpcName);
    }
}
