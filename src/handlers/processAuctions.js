import createError from "http-errors";
import { getEndedAuctions } from "../libs/getEndedAuctions";
import { closeAuction } from "../libs/closeAuction";

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  };
};

export const handler = processAuctions;