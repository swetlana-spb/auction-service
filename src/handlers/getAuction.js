import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import commonMiddleware from '../libs/commonMiddleware';
import createError from "http-errors";

export async function getAuctionById(id) {
  let auction;
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
  return auction;
};

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleware(getAuction);
