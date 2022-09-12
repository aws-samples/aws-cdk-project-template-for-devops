
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';

import * as base from '../../lib/template/stack/vpc/vpc-base-stack';
import { AppContext } from '../../lib/template/app-context';
import { Override } from '../../lib/template/stack/base/base-stack';


export class SampleVpcCloud9Stack extends base.VpcBaseStack {

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);
    }

    @Override
    onLookupLegacyVpc(): base.VpcLegacyLookupProps | undefined {
        return {
            vpcNameLegacy: this.getVariable('VpcName')
        };
    }

    @Override
    onPostConstructor(baseVpc?: ec2.IVpc) {
        const subnet = baseVpc?.publicSubnets[0];

        new cloud9.CfnEnvironmentEC2(this, 'Cloud9Env2', {
            name: this.withProjectPrefix('DatabaseConnection'),
            instanceType: new ec2.InstanceType(this.stackConfig.InstanceType).toString(),
            subnetId: subnet?.subnetId,
            ownerArn: `arn:aws:iam::${this.commonProps.env?.account}:user/${this.stackConfig.IamUser}`
        });

        const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DatabaseSecurityGroup', this.getParameter('DatabaseSecurityGroup'));
        databaseSecurityGroup.addIngressRule(ec2.Peer.ipv4(subnet?.ipv4CidrBlock!), ec2.Port.tcp(3306), 'from cloud9 subnet');
    }
}
