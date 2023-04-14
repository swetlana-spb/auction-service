import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from './ddbDocClient';

export async function getEndedAuctions() {
    const now = new Date();
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndingAt',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString(),
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return result.Items;
};
