import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import commonMiddleware from '../libs/commonMiddleware';
import createError from "http-errors";

async function getAuctions(event, context) {
  let auctions;

  try {
    const result = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }));

    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions);
