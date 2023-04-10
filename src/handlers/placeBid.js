import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import commonMiddleware from '../libs/commonMiddleware';
import createError from "http-errors";

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set hightestBid.amount = :amount',
    ExpressionAttributeValues: {
        ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  };
  let updatedAuction;

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  };

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
    };
}

export const handler = commonMiddleware(placeBid);
