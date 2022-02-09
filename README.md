# AWS CDK Project Template for DevOps

This repository provides best practices and template framework for developing AWS Cloud Development Kit(CDK)-based applications effectively, quickly and collaboratively. In detail, practical approaches such as how to deploy to multi-environment, how to organize directories and how to manage dependencies between stacks will be introduced, and template codes are provided to support them. Gradually, these template codes will be further expanded to support various DevOps scenario.

This template framework suports both CDK Ver1 and CDK Ver2.

- AWS CDK Version1 branch: [release_cdk_v1](https://github.com/aws-samples/aws-cdk-project-template-for-devops/tree/release_cdk_v1)
- AWS CDK Version2 branch: [release_cdk_v2](https://github.com/aws-samples/aws-cdk-project-template-for-devops/tree/release_cdk_v2)

## Agenda

1. [AWS CDK Introduction](#1-aws-cdk-introduction)

2. [Prerequisites](#2-prerequisites)

3. [Basic Principles](#3-basic-principles)

    3-a. [DevOps Collaboration: How to organize directory for collaboration](#3-a-devops-collaboration-how-to-organize-directory-for-collaboration)

    3-b. [Multi-Target Deployment: How to separate configuration from codes](#3-b-multi-target-deployment-how-to-separate-configuration-from-codes)

    3-c. [Stack Independence: How to manage dependency between stacks](#3-c-stack-independence-how-to-manage-dependency-between-stacks)

    3-d. [Code Reuse: How to make it a framework](#3-d-code-reuse-how-to-make-it-a-framework)

4. [Sample Stacks](#4-sample-stacks)

5. [Projects based on this framework](#5-projects-based-on-this-framework)

6. [Security](#6-security)

7. [License](#7-license)

## 1. AWS CDK Introduction

 [AWS Cloud Development Kit(CDK)](https://aws.amazon.com/cdk) is an open source software development framework to define your cloud application resources using familiar programming languages. After coding using CDK Construct and Stack, if you run it through CDK CLI, it is finally compiled and deployed through AWS CloudFormation.

![1. AWSCDKIntro](docs/asset/aws_cdk_intro.png)

 AWS CDK supports TypeScript, JavaScript, Python, Java, C#/.Net, and (in developer preview) Go. The template codes of this repository are implemented in **TypeScript**, because it clearly defines restrictions on types. Restrictions on types provide automated/powerful guide within IDE.

 Because AWS CDK is provided in a language that supports OOP(Object-Oriented Programming), it is possible to configure and deploy cloud resources in the most abstract and modern way. This repository provides a template framework by maximizing these characteristics.

### CDK Useful commands

- `npm install`     install dependencies only for Typescript
- `cdk list`        list up all stacks
- `cdk deploy`      deploy this stack to your default or specific AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
- `cdk destroy`     destroy this stack to your default or specific AWS account/region
  
### CDK Project Entry-point

 `cdk.json` in the root directory describes a entry-point file, in this repository we use **infra/app-main.ts** as the entry-point.

### CDK Useful Links

- CDK Intro: [https://docs.aws.amazon.com/cdk/latest/guide/home.html](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- CDK Getting Started: [https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html)
- API Reference: [https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)
- CDK Workshop: [https://cdkworkshop.com/](https://cdkworkshop.com/)
- CDK Examples: [https://github.com/aws-samples/aws-cdk-examples](https://github.com/aws-samples/aws-cdk-examples)

## 2. Prerequisites

### AWS Account & IAM User

First of all, AWS Account and IAM User is required. IAM user's credential keys also are requried.

### Dependencies

To execute this template codes, the following modules must be installed.

- AWS CLI: aws --version
- Node.js: node --version
- AWS CDK: cdk --version
- [jq](https://stedolan.github.io/jq/): jq --version

Please refer to the kind guide in [CDK Workshop](https://cdkworkshop.com/15-prerequisites.html).

### AWS Credential

Configure your AWS credential keys using AWS CLI.

```bash
aws configure --profile [your-profile] 
AWS Access Key ID [None]: xxxxxx
AWS Secret Access Key [None]:yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
Default region name [None]: us-east-2 
Default output format [None]: json
```

If you don't konw your account number, execute the following command:

```bash
aws sts get-caller-identity --profile [optional: your-profile]
...
...
{
    "UserId": ".............",
    "Account": "75157*******",
    "Arn": "arn:aws:iam::75157*******:user/[your IAM User ID]"
}
```

## 3. Basic Principles

Several principles were selected to improve DevOps efficiency through AWS CDK. Conversely, if you are considering using AWS CDK as an IaC template for a one-time deployment, there is no need to apply these principles.

### 3-a. **DevOps Collaboration**: How to organize directory for collaboration

- **Purpose**: As an IaC tool for DevOps, it is very important to organize the directory of the project so that you can collaborate by role.
- **Approach**: I recommend having a separate directory for each role within a project so that each member interacts within a fence. The following figure shows the directory structure intuitively.

 <img src = "docs/asset/refactoring-directories.png" width="70%">

  Although it is not an mandatory guide, it is necessary to configure this way so that development without boundaries between each other is possible. In particular, as the development paradigm shifts to serverless, the boundary between infrastructure(infra, config, lib) and business codes(app, codes, models) is disappearing.

### 3-b. **Multi-Target Deployment**: How to separate configuration from codes

- **Purpose**: Code and configuration should be separated so that they can be freely deployed to various AWS account/region without modifying the code.
- **Approach**: Prepare a json file for each distribution in `config` directory in order to isolate the configuration from the code as much as possible. The following figure shows the configuration files in `config` directory.

<img src = "docs/asset/app-config-demo.png" width="70%">

Because we need to ensure that a single source code is maintained, all configurations are managed in `config/app-config-[your-suffix].json`. And several files are made according to the environment you want to deploy to, and you have to choose one of them when deploying.

Each `config/app-config-[your-suffix].json file` consists of two main parts in json format.

```json
{
    "Project": {
        
    },

    "Stack": {
        
    }
}
```

#### Project Part

**Project** part describes project name and stage, and where to deploy.

The project name and stage are combined to create a unique project prefix, which is used as a prefix of all stacks.

Specifying AWS account number and region name in CDK source code causes us to modify the code per release. As a result, such information must be managed outside of the source code.

The final project part consists of:

```json
{
    "Project": {
        "Name": "HelloWorld", <----- Essential: your project name, all stacks will be prefixed with [Project.Name+Project.Stage]
        "Stage": "Demo",      <----- Essential: your project stage, all stacks will be prefixed with [Project.Name+Project.Stage]
        "Account": "75157*******", <----- Essential: update according to your AWS Account
        "Region": "us-east-2",     <----- Essential: update according to your target resion
        "Profile": "cdk-demo"      <----- Essential: AWS Profile, keep empty string if no profile configured
    },

    "Stack": {
    }
}
```

The above 5 items are mandatory, and if there is no profile name, you can leave it empty string.

In this example configuration, all stack names start with `HelloWorldDemo`. By setting this prefix, it is possible to deploy multiple stages to the same AWS account/region.

#### **Stack Part**

Usually a CDK project is implemented in several stacks, which have some degree of dependency on each other. **Stack** part describes detailed configuration of each stack. There is no need to define a standardized format because each stack requires different resource configurations, but the `Name` item must be declared because it is common.

A sample stack configuration consists of:

```json
{
    "Project": {
    },

    "Stack": {
        "RealtimeProcessing": {
            "Name": "DataProcessingStack",

            "BucektName": "my-data",

            "LambdaName": "my-function1",
            "LambdaMemory": 256,
            "LambdaPath": "codes/lambda/function-a/src",
        }
        "BatchJob": {
            "Name": "BatchJobStack",

            "VpcId": "vpc-yyyyyyyy",

            "ECSClusterName": "main-cluster",
            "ECSServiceName": "main-service",
        }
    }
}
```

#### How to select a target deployment

 Set the path of this json configuration file through an environment variable. The key name of environment variable is `APP_CONFIG`, which can be modified in `infra/app-main.ts` file.

```bash
export APP_CONFIG=config/app-config-demo.json
```

 Or you can select this configuration file in command line like this:

 ```bash
 cdk deploy *DataProcessingStack --context APP_CONFIG=config/app-config-demo.json
 ```

 Through this external configuration injection, multiple deployments(multiple account, multiple region, multiple stage) are possible without code modification.

### 3-c. **Stack Independence**: How to manage dependency between stacks

- **Purpose**: It should be possible to independently deploy each stack by removing the strong coupling between each stack.
- **Approach**: If `Output` of CloudFormation is directly referenced between stacks, a strong dependency occurs and deployment becomes difficult when there are many stacks. To solve this problem, I recommend placing a key-value registry between them and referencing each other. Of course, this method does not change that the deployment order of each stack must be respected, but once stored in the parameter store, independent deployment is possible afterwards. Luckily, AWS provides **Parameter Store** in **System Manager**, which is the best solution for this.

![stack-dependency](docs/asset/stack-dependency.png)

 For frequently used parameter store access, we provide methods to help with this in our base class.

For parameter provider: putParameter()

 ```typescript
import * as base from '../../../lib/template/stack/base/base-stack';
import { AppContext } from '../../../lib/template/app-context';

export class DataStoreStack extends base.BaseStack {

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const ddbTable = this.createDdbTable();
        this.putParameter('TableName', ddbTable.tableName)
    }

    ...
}
 ```

For parameter user: getParameter()

 ```typescript
import * as base from '../../../lib/template/stack/base/base-stack';
import { AppContext } from '../../../lib/template/app-context';

export class DataProcessStack extends base.BaseStack {

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const tableName = this.getParameter('TableName')
        
    }
}
 ```

### 3-d. **Code Reuse**: How to make it a framework

- **Purpose**: Frequently reused workloads should be abstracted and easily reused without duplication of code.
- **Approach**: Frequently used patterns and resources are provided using OOP's [template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern). That is, frequently used things will be provided through the parent class, and the child class will inherit and reuse it. This is an essential approach used in the process of creating a framework.

![custom-framework](docs/asset/custom-framework.png)

As shown in the figure above, we can now use the framework to focus on more core business logic and reliably speed up development.

The stack and construct corresponding to the parent class are planned to be gradually expanded based on the workload or pattern that is essential. All contributors are welcome on this, so please contact me.

![classdiagram-core](docs/asset/classdiagram-core.png)

## 4. Sample Stacks

This section explains how to use each base class with example codes. This sample implements a typical backend service, which has a private ALB, ECS Cluster/Service/Task(python container), Aurora RDS and Cloud9(RDS bastion host) in a VPC. Based on CDK best practices, all of this has been implemented in four stacks.

![sample-backend-service-architecture1](docs/asset/sample-backend-service-architecture1.png)

You can see what parent class each stack inherits from through the following full diagram.

![classdiagram-overall](docs/asset/classdiagram-overall.png)

### SampleCfnVpcStack

This stack creates a VPC using CloudFormation yaml file. For that reason, it inherits from CfnIncludeStack which can automatically load yaml file instead of us. Write the information about CloudFormation template in the config. If you pass yaml path and parameters to `onLoadTemplateProps` method, Cfn object is passed to `onPostConstructor`.

- Stack Configuration

```json
{
    "Project": {
        ...
    },

    "Stack": {
        "SampleCfnVpc": {
            "Name": "SampleCfnVpcStack",

            "TemplatePath": "infra/stack/template/sample-cfn-vpc.yaml",
            "Parameters": [
                {
                    "Key": "VpcName",
                    "Value": "HelloWorldDemo-Vpc"
                }
            ]
        },
        "SampleVpcRds": {
            ...
        },      
        "SampleVpcCloud9": {
            ...
        },      
        "SampleVpcEcs": {
            ...
        }   
    }
}
```

- Stack Implementation

```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cfn_inc from 'aws-cdk-lib/cloudformation-include';

import * as base from '../../lib/template/stack/cfn/cfn-include-stack';
import { AppContext } from '../../lib/template/app-context';
import { Override } from '../../lib/template/stack/base/base-stack';


export class SampleCfnVpcStack extends base.CfnIncludeStack {

    constructor(appContext: AppContext, stackConfig: any) {
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

        this.putVariable('VpcName', this.stackConfig.Parameters[0]['Value']);
    }
}
```

VPC name is stored in memory via `putVariable` method and will be used to retrieve VPC object from other stacks.

### SampleVpcRdsStack

This stack creates Aurora serverless database in VPC which was created in `SampleCfnVpcStack`. Since it inherits from VpcBastStack, if you pass VPC name to `onLookupLegacyVpc` method, VPC object is passed to `onPostConstructor`.

And database parameters are saved through `putParateter` method, which will save those into `Parameter store` in `Secrets Manager` instead of us.

- Stack Configuration

```json
{
    "Project": {
        ...
    },

    "Stack": {
        "SampleCfnVpc": {
            ...
        },
        "SampleVpcRds": {
            "Name": "SampleVpcRdsStack",

            "ClusterIdentifier": "SampeDatabase",
            "DatabaseName": "helloworld"
        },
        "SampleVpcCloud9": {
            ...
        },
        "SampleVpcEcs": {
            ...
        },
    }
}
```

- Stack Implementation
  
```typescript
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
```

### SampleVpcCloud9Stack

This stack just creates a Cloud9 EC2 instance in the first publict subent of VPC, so there is no special configuration in the config file. Since it inherits from VpcBastStack, if you pass VPC name to `onLookupLegacyVpc` method, VPC object is passed to `onPostConstructor`.

- Stack Configuration

```json
{
    "Project": {
        ...
    },

    "Stack": {
        "SampleCfnVpc": {
            ...
        },
        "SampleVpcRds": {
            ...
        },
        "SampleVpcCloud9": {
            "Name": "SampleVpcCloud9Stack"

        },  
        "SampleVpcEcs": {
            ...
        },
    }
}
```

- Stack Implementation

```typescript
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
```

### SampleVpcEcsStack

This stack creates ECS Cluster/Serice/Task. Since it inherits from VpcBastStack, if you pass VPC name to `onLookupLegacyVpc` method, VPC object is passed to `onPostConstructor`.

- Stack Configuration

```json
{
    "Project": {
        ...
    },

    "Stack": {
        "SampleCfnVpc": {
            ...
        },
        "SampleVpcRds": {
            ...
        },     
        "SampleVpcEcs": {
            "Name": "SampleVpcEcsStack",

            "ClusterName": "SampleCluster",
            "FilePath": "codes/sample-backend-fastapi",
            "Memory": 1024,
            "Cpu": 512,
            "DesiredCount": 1
        },
    }
}
```

- Stack Implementation

```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

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
        const databaseSecretArn = this.getParameter('DatabaseSecretArn');
        const databaseSecret = sm.Secret.fromSecretCompleteArn(this, 'secret', databaseSecretArn);

        const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef');
        taskDef.addContainer('DefaultContainer', {
            image: ecs.ContainerImage.fromAsset(this.stackConfig.FilePath),
            logging: new ecs.AwsLogDriver({
                streamPrefix: `${this.projectPrefix}-backend-fastapi`
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
```

### Install dependecies & Bootstrap

Execute the following command:

```bash
sh scripts/setup_initial.sh config/app-config-demo.json
```

For more details, open `scripts/setup_initial.sh` file.

### Deploy stacks

***Caution***: This solution contains not-free tier AWS services. So be careful about the possible costs.

Since each stack refers to each other through `Parameter Store`, it must be deployed sequentially during the only first deployment. After that, independent deployment is possible.

You can deploy the entire stacks by running:

```bash
sh scripts/deploy_stacks.sh config/app-config-demo.json
```

#### Deployment Results

You can find the deployment results in AWS CloudFormation.

After `Cloud9` is deployed, connect and run the following sql script.  completing deployment of Cloud9. Database access information(host_name, username, password) can be checked in `Secrets Manager`.

Database Connection

```bash
mysql -h host_name -u admin -p
```

SQL Commands

```
CREATE DATABASE IF NOT EXISTS helloworld;
USE helloworld;

CREATE TABLE IF NOT EXISTS Items (
	            ID int NOT NULL AUTO_INCREMENT,
		        NAME varchar(255) NOT NULL UNIQUE,
			    PRIMARY KEY (ID)
			);


INSERT INTO Items (NAME) VALUES ("name-001");
SELECT * FROM Items;
```

Finally we can call internal REST APIs in `Cloud9`. Execute the following commands in `Cloud9`:

```bash
export ALB_DNS_NAME=xxxxxxxxxxxxxxxx.region.elb.amazonaws.com

curl $ALB_DNS_NAME
...
...
{"Health": "Good"}
```

Or

```bash
curl $ALB_DNS_NAME/items
...
...
{"items": [[1,"name-001"]]}
```

Where `ALB_DNS_NAME` is found in `LoadBalancers` DNS name in `EC2` web console.

#### How to clean up

Execute the following command, which will destroy all resources except RDS Database. So destroy these resources in AWS web console manually(Go RDS -> Select RDS Name -> Modify -> disable deletion protection -> Select again -> Delete).

```bash
sh ./script/destroy_stacks.sh config/app-config-demo.json
```

## 5. Projects based on this framework

- [Amazon Sagemaker Model Serving Using AWS CDK](https://github.com/aws-samples/amazon-sagemaker-model-serving-using-aws-cdk)
- [AWS ECS DevOps UsingAWS CDK](https://github.com/aws-samples/aws-ecs-devops-using-aws-cdk)
- [AWS Serverless Using AWS CDK](https://github.com/aws-samples/aws-serverless-using-aws-cdk)
- [AWS IoT Greengrass Ver2 using AWS CDK](https://github.com/aws-samples/aws-iot-greengrass-v2-using-aws-cdk)
- [Amazon SageMaker Built-in Algorithm MLOps Pipeline using AWS CDK](https://github.com/aws-samples/amazon-sagemaker-built-in-algorithms-mlops-pipeline-using-aws-cdk)

## 6. Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## 7. License

This library is licensed under the MIT-0 License. See the LICENSE file.
