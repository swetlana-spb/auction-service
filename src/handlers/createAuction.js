import { v4 as uuid } from 'uuid';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import commonMiddleware from '../libs/commonMiddleware';
import createError from "http-errors";
import validatorMiddleware from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import createAuctionSchema from '../libs/schemas/createAuctionSchema';

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    hightestBid: {
      amount: 0,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }));
  }
  catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction)
  .use(validatorMiddleware({
    eventSchema: transpileSchema(createAuctionSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  }));
