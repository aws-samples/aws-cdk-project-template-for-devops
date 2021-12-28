#!/usr/bin/env node
import { AppContext, AppContextError } from '../lib/template/app-context';

import { SampleCfnVpcStack } from './stack/sample-cfn-vpc-stack'
import { SampleVpcRdsStack } from './stack/sample-vpc-rds-stack'
import { SampleVpcCloud9Stack } from './stack/sample-vpc-cloud9-stack'
import { SampleVpcEcsStack } from './stack/sample-vpc-ecs-stack'


try {
    const appContext = new AppContext({
        appConfigFileKey: 'APP_CONFIG',
        contextArgs: ['Stack.SampleVpcEcs.DesiredCount']
    });

    new SampleCfnVpcStack(appContext, appContext.appConfig.Stack.SampleCfnVpc);
    new SampleVpcRdsStack(appContext, appContext.appConfig.Stack.SampleVpcRds);
    new SampleVpcCloud9Stack(appContext, appContext.appConfig.Stack.SampleVpcCloud9);
    new SampleVpcEcsStack(appContext, appContext.appConfig.Stack.SampleVpcEcs);
} catch (error) {
    if (error instanceof AppContextError) {
        console.error('AppContextError:', error.message);
    } else {
        console.error('not-defined-error', error);
    }
}
