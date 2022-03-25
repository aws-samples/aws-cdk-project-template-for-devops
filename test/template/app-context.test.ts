import * as cdk from '@aws-cdk/core';
import { assert } from 'console';

import { AppContext } from '../../lib/template/app-context';


let cdkApp = new cdk.App();

test('[TESTCase01] updateContextArgs: HappyCase', () => {
    // SETUP
    cdkApp.node.tryGetContext = jest.fn()
        .mockReturnValueOnce('test/template/app-config-test.json')
        .mockReturnValueOnce('there');

    // WHEN
    const context = new AppContext({
        appConfigFileKey: 'APP_CONFIG',
        contextArgs: [
            'aa.bb.cc'
        ]
    }, cdkApp);

    // THEN
    expect(context.ready()).toBe(true);
});

test('[TESTCase02] updateContextArgs: BadCase', () => {
    // SETUP
    cdkApp.node.tryGetContext = jest.fn()
        .mockReturnValueOnce('test/template/app-config-test.json')
        .mockReturnValueOnce('there');

    // WHEN
    let context = undefined;
    try {
        context = new AppContext({
            appConfigFileKey: 'APP_CONFIG',
            contextArgs: [
                'aa.bb1.cc'
            ]
        }, cdkApp);
    } catch(e) {
       
    }

    // THEN
    expect(context).toBe(undefined);
});
