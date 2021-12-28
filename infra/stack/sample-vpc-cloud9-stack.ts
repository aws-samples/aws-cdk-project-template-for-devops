
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
        
        new cloud9.Ec2Environment(this, 'Cloud9Env2', {
            vpc: baseVpc!,
            ec2EnvironmentName: `${this.projectPrefix}-DatabaseConnection`,
            instanceType: new ec2.InstanceType('t3.large'),
            subnetSelection: {
                subnets: [subnet!]
            }
        });

        const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DatabaseSecurityGroup', this.getParameter('DatabaseSecurityGroup'));
        databaseSecurityGroup.addIngressRule(ec2.Peer.ipv4(subnet?.ipv4CidrBlock!), ec2.Port.tcp(3306), 'from cloud9 subnet');
    }
}
