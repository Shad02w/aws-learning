import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import * as path from 'path'

export class HelloWorldStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // Create DynamoDB table
        const table = new dynamodb.Table(this, 'ReadCountTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY // For development only
        })

        // Create Lambda function
        const helloFunction = new lambda.Function(this, 'HelloWorldFunction', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/lambda')),
            environment: {
                TABLE_NAME: table.tableName
            }
        })

        // Grant Lambda permissions to DynamoDB
        table.grantReadWriteData(helloFunction)

        // Create API Gateway
        const api = new apigateway.RestApi(this, 'HelloWorldApi', {
            restApiName: 'Hello World API',
            description: 'Simple API Gateway with Lambda integration'
        })

        // Create API Gateway integration with Lambda
        const integration = new apigateway.LambdaIntegration(helloFunction)

        // Add GET method to root resource
        api.root.addMethod('GET', integration)

        // Output the API URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: api.url,
            description: 'API Gateway URL'
        })
    }
}
