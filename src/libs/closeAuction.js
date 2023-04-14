import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
        ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
        '#status': 'status',
    },
};

const result = await ddbDocClient.send(new UpdateCommand(params));
return result;
};
