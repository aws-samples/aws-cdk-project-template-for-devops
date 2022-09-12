
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

import * as base from '../../lib/template/stack/vpc/vpc-base-stack';
import { Override } from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';
import { StackConfig } from '../../lib/template/app-config'


export class SampleVpcEcsStack extends base.VpcBaseStack {

    constructor(appContext: AppContext, stackConfig: StackConfig) {
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
        const databaseHostName = this.getParameter('DatabaseHostName');
        const databaseName = this.getParameter('DatabaseName');
        const databaseSecretArn = this.getParameter('DatabaseSecretArn');
        const databaseSecret = sm.Secret.fromSecretCompleteArn(this, 'secret', databaseSecretArn);

        const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef');
        taskDef.addContainer('DefaultContainer', {
            image: ecs.ContainerImage.fromAsset(this.stackConfig.FilePath),
            logging: new ecs.AwsLogDriver({
                streamPrefix: this.withProjectPrefix('backend-fastapi')
            }),
            environment: {
                HOST_NAME: databaseHostName,
                DATABASE_NAME: databaseName,
                SECRET_ARN: databaseSecretArn,
            },
            portMappings: [{
                containerPort: 80,
                protocol: ecs.Protocol.TCP
            }]
        });
        databaseSecret.grantRead(taskDef.taskRole);

        const albEcsService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
            cluster: new ecs.Cluster(this, 'cluster', {
                vpc: baseVpc,
                clusterName: this.withProjectPrefix(this.stackConfig.ClusterName)
            }),
            memoryLimitMiB: this.stackConfig.Memory,
            cpu: this.stackConfig.Cpu,
            taskDefinition: taskDef,
            publicLoadBalancer: false,
            desiredCount: parseInt(this.stackConfig.DesiredCount)
        });

        const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DatabaseSecurityGroup', this.getParameter('DatabaseSecurityGroup'));
        databaseSecurityGroup.addIngressRule(albEcsService.service.connections.securityGroups[0], ec2.Port.tcp(3306), 'from backend sg');
    }
}
