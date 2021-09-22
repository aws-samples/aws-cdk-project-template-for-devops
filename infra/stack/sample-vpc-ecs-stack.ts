
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';

import * as base from '../../lib/template/stack/vpc/vpc-base-stack';
import { AppContext } from '../../lib/template/app-context';
import { Override } from '../../lib/template/stack/base/base-stack';


export class SampleVpcEcsStack extends base.VpcBaseStack {

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
        const databaseHostName = this.getParameter('DatabaseHostName');
        const databaseName = this.getParameter('DatabaseName');
        const databaseSecreteArn = this.getParameter('DatabaseSecreteArn');
        const databaseSecrete = sm.Secret.fromSecretCompleteArn(this, 'secrete', databaseSecreteArn);

        const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef');
        taskDef.addContainer('DefaultContainer', {
            image: ecs.ContainerImage.fromAsset(this.stackConfig.FilePath),
            logging: new ecs.AwsLogDriver({
                streamPrefix: `${this.projectPrefix}-backend-fastapi`
            }),
            environment: {
                HOST_NAME: databaseHostName,
                DATABASE_NAME: databaseName,
                SECRETE_ARN: databaseSecreteArn,
            },
            portMappings: [{
                containerPort: 80,
                protocol: ecs.Protocol.TCP
            }]
        });
        databaseSecrete.grantRead(taskDef.taskRole);

        const albEcsService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
            cluster: new ecs.Cluster(this, 'cluster', {
                vpc: baseVpc,
                clusterName: `${this.projectPrefix}-${this.stackConfig.ClusterName}`
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
