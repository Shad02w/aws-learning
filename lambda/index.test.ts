import { describe, it, expect } from 'vitest'
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { ddbMock } from '../vitest.setup'
import { handler, incrementReadCount } from './index'
import type { APIGatewayProxyEvent } from 'aws-lambda'

describe('incrementCounter', () => {
    it('should increment counter correctly', async () => {
        ddbMock.on(UpdateCommand).resolves({
            Attributes: {
                readCount: 42
            }
        })

        const result = await incrementReadCount(ddbMock as unknown as DynamoDBDocumentClient)
        expect(result.readCount).toBe(42)

        const calls = ddbMock.calls()
        expect(calls).toHaveLength(1)
        expect(calls[0].args[0].input).toMatchObject({
            TableName: process.env.TABLE_NAME,
            Key: { id: 'visit-counter' },
            UpdateExpression: 'SET readCount = if_not_exists(readCount, :start) + :inc'
        })
    })
})

describe('Lambda Handler', () => {
    it('should increment counter and return 200', async () => {
        // Mock DynamoDB response
        ddbMock.on(UpdateCommand).resolves({
            Attributes: {
                readCount: 1
            }
        })

        const event = {
            // Minimal API Gateway event
            httpMethod: 'GET',
            path: '/',
            headers: {},
            queryStringParameters: null,
            body: null
        } as any

        const response = await handler(event)

        expect(response.statusCode).toBe(200)
        expect(JSON.parse(response.body)).toHaveProperty('readCount')

        // Verify DynamoDB was called correctly
        expect(ddbMock.calls()).toHaveLength(1)
        const updateCall = ddbMock.call(0)
        expect(updateCall.args[0].input).toMatchObject({
            TableName: 'test-table',
            Key: { id: 'visit-counter' }
        })
    })

    it('should handle DynamoDB errors', async () => {
        // Mock DynamoDB error
        ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB error'))

        const event: APIGatewayProxyEvent = {
            httpMethod: 'GET',
            path: '/',
            headers: {},
            multiValueHeaders: {},
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            pathParameters: null,
            stageVariables: null,
            requestContext: {} as any,
            resource: '',
            body: null,
            isBase64Encoded: false
        }

        const response = await handler(event)

        expect(response.statusCode).toBe(500)
        expect(JSON.parse(response.body)).toHaveProperty('message')
    })
})
