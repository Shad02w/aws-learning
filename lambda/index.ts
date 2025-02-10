import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const client = new DynamoDBClient()
const dynamodb = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.TABLE_NAME!
const COUNTER_ID = 'visit-counter'

export interface CounterResult {
    readCount: number
}

export async function incrementReadCount(db: DynamoDBDocumentClient): Promise<CounterResult> {
    const updateResult = await db.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id: COUNTER_ID },
            UpdateExpression: 'SET readCount = if_not_exists(readCount, :start) + :inc',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':start': 0
            },
            ReturnValues: 'UPDATED_NEW'
        })
    )

    return {
        readCount: updateResult.Attributes?.readCount as number
    }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const result = await incrementReadCount(dynamodb)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Hello, World!',
                readCount: result.readCount
            })
        }
    } catch (error) {
        console.error('Error:', error)
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}
