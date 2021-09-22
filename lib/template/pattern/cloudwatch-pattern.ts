
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import { IWidget } from "@aws-cdk/aws-cloudwatch";

export interface CloudWatchPatternProps {
    readonly projectFullName: string;
    readonly dashboardName: string;
    readonly period: cdk.Duration;
}

export class CloudWatchPattern extends cdk.Construct {

    private dashboard: cloudwatch.Dashboard;
    private props: CloudWatchPatternProps;

    constructor(scope: cdk.Construct, id: string, props: CloudWatchPatternProps) {
        super(scope, id);
        this.props = props;

        this.dashboard = new cloudwatch.Dashboard(this, props.dashboardName, {
            dashboardName: `${props.projectFullName}-${props.dashboardName}`,
        });
    }

    public addTextTitleWidges(title: string) {
        this.dashboard.addWidgets(new cloudwatch.TextWidget({
            markdown: title,
            width: 24,
          }));
    }

    public addWidgets(...widgets: IWidget[]): void {
        this.dashboard.addWidgets(...widgets);
    }

    public createWidget(name: string, metrics: cloudwatch.IMetric[], width?: number, label?: string): cloudwatch.GraphWidget {
        const widget = new cloudwatch.GraphWidget({
            title: name,
            left: metrics,
            width: width,
            leftYAxis: {
                label: label
            }
        });
        return widget;
    }

    public createWidget2(name: string, metrics: cloudwatch.IMetric[], width?: number): cloudwatch.GraphWidget {
        const widget = new cloudwatch.GraphWidget({ 
            title: name,
            left: metrics,
            width: width,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            leftYAxis: {
                min: 0,
                max: 1,
                showUnits: false
            },
        });
        return widget;
    }

    public createLeftRightWidget(name: string, leftMetrics: cloudwatch.IMetric[], rightMetrics: cloudwatch.IMetric[], width?: number): cloudwatch.GraphWidget {
        const widget = new cloudwatch.GraphWidget({
            title: name,
            left: leftMetrics,
            right: rightMetrics,
            width: width
        });
        return widget;
    }

    public createDynamoDBMetric(tableName: string, metricName: string, options: cloudwatch.MetricOptions = {}, operation?: string): cloudwatch.Metric {
        var dimensions: any = { TableName: tableName };
        if (operation != undefined) {
            dimensions['operation'] = operation
        }

        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/DynamoDB',
            dimensions: dimensions,
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createLambdaMetric(lambdaFunctionName: string, metricName: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        /*
        Options:
         - Sum : cloudwatch.Unit.COUNT
         - Average/Minimum/Maximum : Milliseconds
        */

        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/Lambda',
            dimensions: {
                FunctionName: lambdaFunctionName.includes(':') ? lambdaFunctionName.split(':')[0] : lambdaFunctionName, //lambdaNameAlias.split(':')[0],
                Resource: lambdaFunctionName      //lambdaNameAlias
            },
            statistic: options.statistic, // Sum
            unit: options.unit, //cloudwatch.Unit.COUNT
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createIotMetric(ruleName: string, metricName: string, actionType: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        /*
        Options:
         - Sum : cloudwatch.Unit.COUNT
         - Average/Minimum/Maximum : Milliseconds
        */

        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/IoT',
            dimensions: {
                RuleName: ruleName,
                ActionType: actionType
            },
            statistic: options.statistic, // Sum
            unit: options.unit, //cloudwatch.Unit.COUNT
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createKinesisMetric(streamName: string, metricName: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/Kinesis',
            dimensions: {
                StreamName: streamName
            },
            unit: cloudwatch.Unit.COUNT,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createEndpointInstanceMetrics(endpointName: string, variantName: string, metricNames: string[], options: cloudwatch.MetricOptions = {}): cloudwatch.Metric[] {
        const metric: cloudwatch.Metric[] = metricNames.map(metricName => {
            return new cloudwatch.Metric({
                metricName,
                namespace: '/aws/sagemaker/Endpoints',
                dimensions: {
                    EndpointName: endpointName,
                    VariantName: variantName,
                },
                statistic: 'Average',
                unit: cloudwatch.Unit.PERCENT,
                period: this.props.period,
                label: options.label != undefined ? options.label : metricName,
                ...options
            });
        })

        return metric;
    }

    public createEndpointInvocationMetrics(endpointName: string, variantName: string, metricNames: string[], options: cloudwatch.MetricOptions = {}): cloudwatch.Metric[] {
        const metric: cloudwatch.Metric[] = metricNames.map(metricName => {
            return new cloudwatch.Metric({
                metricName,
                namespace: 'AWS/SageMaker',
                dimensions: {
                    EndpointName: endpointName,
                    VariantName: variantName,
                },
                statistic: options.statistic, // Sum, Average
                unit: options.unit, //cloudwatch.Unit.COUNT Milliseconds
                period: this.props.period,
                label: options.label != undefined ? options.label : metricName,
                ...options
            });
        })

        return metric;
    }

    public createEsDomainMetric(domainName: string, metricName: string, clientId: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/ES',
            dimensions: {
                DomainName: domainName,
                ClientId: clientId
            },
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            color: options.color,
            ...options
        });
    }
    public createEsDomainMetric2(domainName: string, metricName: string, clientId: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: '.',
            dimensions: {
                DomainName: domainName,
                '.': '.'
            },
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            color: options.color,
            ...options
        });
    }

    public createApiGatewayMetric(apiName: string, metricName: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/ApiGateway',
            dimensions: {
                ApiName: apiName,
            },
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createSnsMetric(topicName: string, metricName: string, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: 'AWS/SNS',
            dimensions: {
                TopicName: topicName,
            },
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }

    public createCustomMetric(namespace: string, metricName: string, dimensions: any, options: cloudwatch.MetricOptions = {}): cloudwatch.Metric {
        return new cloudwatch.Metric({
            metricName,
            namespace: namespace,
            dimensions: dimensions,
            statistic: options.statistic,
            unit: options.unit,
            period: this.props.period,
            label: options.label != undefined ? options.label : metricName,
            ...options
        });
    }
}
