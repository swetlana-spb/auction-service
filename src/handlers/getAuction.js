import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters;

  try {
    const result = await ddbDocClient.send(new GetCommand({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
    }));
    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  };

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  };

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
    };
}

export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
