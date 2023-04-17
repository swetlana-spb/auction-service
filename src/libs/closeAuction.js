import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.REGION });

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  await ddbDocClient.send(new UpdateCommand(params));

  const { title, seller, hightestBid } = auction;
  const { amount, bidder } = hightestBid;

  if (amount === 0) {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "No bids on your auction item :(",
          recipient: seller,
          body: `Oh no! Your item "${title}" didn't get any bids. Better luck next time!`,
        }),
      })
    );

    return;
  }

  const notifySeller = sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "Your item has been sold!",
        recipient: seller,
        body: `Woohoo! Your item '${title}' has been sold for ${amount}!`,
      }),

    })
  );

  const nofifyBidder = sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "You won an auction!",
        recipient: bidder,
        body: `What a great deal! You got yourself a '${title}' for ${amount}`,
      }),
    })
  );

  return Promise.all([notifySeller, nofifyBidder]);
}
