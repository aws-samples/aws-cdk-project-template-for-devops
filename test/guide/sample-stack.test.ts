import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';

import { BaseStack } from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';


class SampleStack extends BaseStack {

    constructor(appContext: AppContext, appConfig: any) {
        super(appContext, appConfig);

        const bucket = this.createS3Bucket(appConfig.BucketBaseName);
    }
}
//https://docs.aws.amazon.com/cdk/v2/guide/testing.html
test('Sample Stack for Guiding', () => {
    // SETUP
    process.env['APP_CONFIG'] = 'config/app-config-demo.json'
    const appContext = new AppContext({
        appConfigFileKey: 'APP_CONFIG'
    })

    // WHEN
    const stack = new SampleStack(appContext, {
        "Name": "SampleStack",

        "BucketBaseName": 'test-s3-bucket'
    });

    // THEN
    expectCDK(stack).to(matchTemplate({
        "Resources": {}
    }, MatchStyle.NO_REPLACES))
});
