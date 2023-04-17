import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import commonMiddleware from '../libs/commonMiddleware';
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import validatorMiddleware from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import placeBidSchema from '../libs/schemas/placeBidSchema';

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  if (auction.seller === email) {
    throw new createError.Forbidden(`You cannot bid on your own auctions!`);
  }

  if (auction.hightestBid.bidder === email) {
    throw new createError.Forbidden(`You are already the highest bidder!`);
  }

  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden(`You cannot bid on closed auctions!`);
  };

  if (amount <= auction.hightestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.hightestBid.amount}!`);
  };

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set hightestBid.amount = :amount, hightestBid.bidder = :bidder',
    ExpressionAttributeValues: {
        ':amount': amount,
        ':bidder': email,
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

export const handler = commonMiddleware(placeBid)
.use(validatorMiddleware({
  eventSchema: transpileSchema(placeBidSchema),
  ajvOptions: {
    strict: false,
  },
}));
