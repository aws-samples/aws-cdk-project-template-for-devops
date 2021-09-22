import * as cfn_inc from '@aws-cdk/cloudformation-include';

import * as base from '../base/base-stack';
import { AppContext } from '../../app-context';


export interface CfnTemplateProps {
    templatePath: string;
    parameters?: any;
}

export abstract class CfnIncludeStack extends base.BaseStack {
    private cfnTemplate?: cfn_inc.CfnInclude;

    abstract onLoadTemplateProps(): CfnTemplateProps | undefined;
    abstract onPostConstructor(cfnTemplate?: cfn_inc.CfnInclude): void;

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const props = this.onLoadTemplateProps();

        if (props != undefined) {
            this.cfnTemplate = this.loadTemplate(props);
        } else {
            this.cfnTemplate = undefined;
        }

        this.onPostConstructor(this.cfnTemplate);
    }

    private loadTemplate(props: CfnTemplateProps): cfn_inc.CfnInclude {
        const cfnTemplate = new cfn_inc.CfnInclude(this, 'cfn-template', {
            templateFile: props.templatePath,
        });

        if (props.parameters != undefined) {
            for(let param of props.parameters) {
                const paramEnv = cfnTemplate.getParameter(param.Key);
                paramEnv.default = param.Value;
            }
        }

        return cfnTemplate;
    }
}
