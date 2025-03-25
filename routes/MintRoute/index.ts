import { Request, Response, Router } from "express";
import { MintModal } from "../../model/MintModal";
import { Connection, LAMPORTS_PER_SOL, ParsedInstruction, clusterApiUrl } from "@solana/web3.js";
import { createAssetInCollection } from "../../program/createAsset";
import { json } from "body-parser";


// Create a new instance of the Express Router
const MintRouter = Router();

let count = 0;

// Solana connection instance
export const solConnection = new Connection(
  process.env.RPC_URL || clusterApiUrl("devnet")
);

// @route    GET api/mint
// @desc     Mint new NFT
// @access   Private
MintRouter.get("/:signature", async (req: Request, res: Response) => {
  try {
    const sig = req.params.signature;
    console.log("params: ", req.params)
    console.log("signatuer: ", sig)

    // Ensure the signature exists in the request body
    if (!sig) {
      return res.status(400).json({ error: "Signature is required" });
    }

    // Query the MintModal database by hash
    const mintData = await MintModal.findOne({ hash: sig });
    if (mintData) {
      return res.status(404).json({ error: "Already minted tx" });
    }

    const transaction = await solConnection.getParsedConfirmedTransaction(sig, "confirmed");

    // Validate that the transaction is found
    if (!transaction) {
      throw new Error("Transaction not found for the given signature.");
    }

    // Initialize variables
    let amount = 0;
    let userWallet = "";
    let receiveWallet = "";

    // Extract instructions from the transaction
    const ixs = transaction.transaction.message.instructions;

    // Loop through instructions to find parsed instructions
    for (let i = 0; i < ixs.length; i++) {
      // Check if instruction contains parsed data
      if ("parsed" in ixs[i]) {
        const parsedIx = ixs[i] as ParsedInstruction; // Cast to ParsedInstruction for type safety

        // Extract and calculate necessary information
        amount = parsedIx?.parsed?.info?.lamports / LAMPORTS_PER_SOL || 0;
        userWallet = parsedIx?.parsed?.info?.source || "";
        receiveWallet = parsedIx?.parsed?.info?.destination || "";
        break; // Exit the loop once valid data is found
      }
    }
    console.log("user wallet: ", userWallet);
    console.log("receive wallet: ", receiveWallet);
    console.log("amount: ", amount);
    if (!userWallet || !receiveWallet) throw "Could not parse wallet & amount from min tx";

    console.log("Backend wallet: ", process.env.BACKEND_PUBKEY);

    if (receiveWallet != process.env.BACKEND_PUBKEY) {
      console.log("--> Hacker's wallet", userWallet, receiveWallet);
      throw "transaction is wrong";
    }

    const collection = process.env.COLLECTION || "4GNyKThWxqePAqrz7A9EnoVGgc4HFdDcLCWppBuh4ZUV";
    const pinata = process.env.PINATA_URL || "https://peach-binding-gamefowl-763.mypinata.cloud/ipfs/bafybeiaz7uatc7yhmm3ebabayklz2pochjnmv7vklgzcmpgccq37jhggpm/";
    const url = pinata + count.toString() + ".json";
    console.log("url : ", url)
    const fetchRes = await fetch(url);
    const fetchText = await fetchRes.text();

    const jsonData = JSON.parse(fetchText);
    console.log("json data => ", jsonData)
    const txSig = await createAssetInCollection(collection, jsonData.name, url, userWallet)
    console.log("tx sig: ", txSig);

    await MintModal.create({ hash: sig, amount: amount, wallet: userWallet, count: count });

    count++;

    return res.status(200).json({ data: txSig }); // Respond with the mintData
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

MintRouter.get("/getCount", async (req: Request, res: Response) => {
  try {
    // Get all documents and then get the length
    const documents = await MintModal.find({});
    const dbLength = documents.length;

    console.log("Database length:", dbLength);

    return res.status(200).json({ count: dbLength });
  } catch (err) {
    console.error("Failed to get database length:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default MintRouter;
