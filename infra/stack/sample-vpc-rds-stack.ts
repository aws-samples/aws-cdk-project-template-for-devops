
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

import * as base from '../../lib/template/stack/vpc/vpc-base-stack';
import { AppContext } from '../../lib/template/app-context';
import { Override } from '../../lib/template/stack/base/base-stack';


export class SampleVpcRdsStack extends base.VpcBaseStack {

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
        const cluster = new rds.ServerlessCluster(this, 'serverless-rds', {
            vpc: baseVpc!,
            clusterIdentifier: `${this.projectPrefix}-${this.stackConfig.ClusterIdentifier}`,
            defaultDatabaseName: this.stackConfig.DatabaseName,
            engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
            scaling: {
                autoPause: cdk.Duration.minutes(10),
                minCapacity: rds.AuroraCapacityUnit.ACU_8,
                maxCapacity: rds.AuroraCapacityUnit.ACU_32,
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        
        this.putParameter('DatabaseHostName', cluster.clusterEndpoint.hostname);
        this.putParameter('DatabaseAddress', cluster.clusterEndpoint.socketAddress);
        this.putParameter('DatabaseName', this.stackConfig.DatabaseName);
        this.putParameter('DatabaseSecretArn', cluster.secret?.secretArn!);
        this.putParameter('DatabaseSecurityGroup', cluster.connections.securityGroups[0].securityGroupId);
    }
}
