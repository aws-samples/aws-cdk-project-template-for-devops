import * as ec2 from '@aws-cdk/aws-ec2';

import * as base from '../base/base-stack';
import { AppContext } from '../../app-context';


export interface VpcLegacyLookupProps {
    vpcIdLegacy?: string;
    vpcNameLegacy?: string;
}

export abstract class VpcBaseStack extends base.BaseStack {
    private baseVpc?: ec2.IVpc;

    abstract onLookupLegacyVpc(): VpcLegacyLookupProps | undefined;
    abstract onPostConstructor(baseVpc?: ec2.IVpc): void;

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const props = this.onLookupLegacyVpc();

        if (props != undefined) {
            this.baseVpc = this.importVpc(props);
        } else {
            this.baseVpc = undefined;
        }

        this.onPostConstructor(this.baseVpc);
    }

    protected importVpc(props: VpcLegacyLookupProps): ec2.IVpc {
        if (props.vpcIdLegacy != undefined && props.vpcIdLegacy.length > 0) {
            const vpc = ec2.Vpc.fromLookup(this, `BaseVPC`, {
                vpcId: props.vpcIdLegacy,
            });
            return vpc;
        } else if (props.vpcNameLegacy != undefined && props.vpcNameLegacy.length > 0) {
            const vpc = ec2.Vpc.fromLookup(this, `BaseVPC`, {
                vpcName: props.vpcNameLegacy
            });
            return vpc;
        } else {
            console.error('please check VPC import options: VPCID or VPCName is essential.');
            process.exit(1)
        }
    }

    protected createVpc(baseName: string, vpcMaxAzs: number, vpcCidr: string, natGateways: number): ec2.IVpc {
        if (vpcMaxAzs > 0 && vpcCidr.length > 0) {
            const vpc = new ec2.Vpc(this, baseName,
                {
                    maxAzs: vpcMaxAzs,
                    cidr: vpcCidr,
                    natGateways: natGateways
                });
            return vpc;
        } else {
            console.error('please check the options: VPCMaxAzs, VPCCIDR, NATGateway');
            process.exit(1)
        }
    }
}
