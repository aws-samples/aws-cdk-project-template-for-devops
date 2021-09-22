
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import * as rds from '@aws-cdk/aws-rds';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as cloud9 from '@aws-cdk/aws-cloud9';

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
        
        const cloud9Ec2 = new cloud9.Ec2Environment(this, 'Cloud9Env2', {
            vpc: baseVpc!,
            ec2EnvironmentName: `${this.projectPrefix}-DatabaseConnection`,
            instanceType: new ec2.InstanceType('t3.large'),
            subnetSelection: {
                subnets: [subnet!]
            }
        });


        // const databaseCluster = rds.ServerlessCluster.fromServerlessClusterAttributes(this, 'ss', {
        //     clusterIdentifier: this.getParameter('DatabaseClusterId')

        // });
        
        // const sub = cloud9Ec2.vpc.publicSubnets[0];
        // databaseCluster.connections.allowFrom(, ec2.Port.tcp(5432), 'allow from ecs');


        const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DatabaseSecurityGroup', this.getParameter('DatabaseSecurityGroup'));
        // const cloud9SecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'Cloud9SecurityGroup', 'sg-0a271c67a6889b17c');
        // databaseSecurityGroup.addIngressRule(cloud9SecurityGroup, ec2.Port.tcp(3306), 'from cloud9 sg');
        databaseSecurityGroup.addIngressRule(ec2.Peer.ipv4(subnet?.ipv4CidrBlock!), ec2.Port.tcp(3306), 'from cloud9 subnet');
    }
}
