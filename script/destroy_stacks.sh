#!/bin/sh

# Configuration File Path
export APP_CONFIG=$1

PROFILE_NAME=$(cat $APP_CONFIG | jq -r '.Project.Profile') #ex> cdk-demo

echo ==--------ConfigInfo---------==
echo $APP_CONFIG
echo $PROFILE_NAME
echo .
echo .

echo ==--------ListStacks---------==
cdk list
echo .
echo .

echo ==--------DestroyStacksStepByStep---------==
if [ -z "$PROFILE_NAME" ]; then
    cdk destroy *-SampleVpcCloud9Stack --force
    cdk destroy *-SampleVpcEcsStack --force
    cdk destroy *-SampleVpcRdsStack --force
    cdk destroy *-SampleCfnVpcStack --force
else
    cdk destroy *-SampleVpcCloud9Stack --force --profile $PROFILE_NAME
    cdk destroy *-SampleVpcEcsStack --force --profile $PROFILE_NAME
    cdk destroy *-SampleVpcRdsStack --force --profile $PROFILE_NAME
    cdk destroy *-SampleCfnVpcStack --force --profile $PROFILE_NAME
fi
echo .
echo .
