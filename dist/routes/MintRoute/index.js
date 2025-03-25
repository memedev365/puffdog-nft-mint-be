"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solConnection = void 0;
const express_1 = require("express");
const MintModal_1 = require("../../model/MintModal");
const web3_js_1 = require("@solana/web3.js");
const createAsset_1 = require("../../program/createAsset");
// import fetch from "node-fetch";
// Create a new instance of the Express Router
const MintRouter = (0, express_1.Router)();
// Solana connection instance
exports.solConnection = new web3_js_1.Connection(process.env.RPC_URL || (0, web3_js_1.clusterApiUrl)("devnet"));
// Ensure required environment variables are present
if (!process.env.RPC_URL || !process.env.BACKEND_PUBKEY || !process.env.COLLECTION || !process.env.PINATA_URL) {
    throw new Error("Missing required environment variables. Please check your configuration.");
}
// Initialize count dynamically; use database for synchronization
let count;
// Function to initialize count by querying the database
const initializeCount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        count = yield MintModal_1.MintModal.countDocuments(); // Synchronize count with database
        console.log("Initialized count from database:", count);
    }
    catch (err) {
        console.error("Failed to initialize count:", err);
        count = 0; // Fallback to 0 if initialization fails
    }
});
// Immediately initialize count
initializeCount();
// @route    GET api/mint/:signature
// @desc     Mint new NFT
// @access   Private
MintRouter.get("/:signature", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sig = req.params.signature;
        // Ensure the signature exists in the request
        if (!sig) {
            return res.status(400).json({ error: "Signature is required" });
        }
        // Check if the transaction is already minted
        const mintData = yield MintModal_1.MintModal.findOne({ hash: sig });
        if (mintData) {
            return res.status(404).json({ error: "Already minted transaction" });
        }
        // Fetch the Solana transaction using the signature
        const transaction = yield exports.solConnection.getParsedConfirmedTransaction(sig, "confirmed");
        if (!transaction) {
            throw new Error("Transaction not found for the given signature.");
        }
        // Parse transaction details
        let amount = 0, userWallet = "", receiveWallet = "";
        const ixs = transaction.transaction.message.instructions;
        for (const ix of ixs) {
            if ("parsed" in ix && ((_a = ix.parsed) === null || _a === void 0 ? void 0 : _a.info)) {
                const parsedIx = ix;
                amount = parsedIx.parsed.info.lamports / web3_js_1.LAMPORTS_PER_SOL || 0;
                userWallet = parsedIx.parsed.info.source || "";
                receiveWallet = parsedIx.parsed.info.destination || "";
                break;
            }
        }
        // Validate parsed wallets
        if (!userWallet || !receiveWallet) {
            throw new Error("Could not parse wallet & amount from mint transaction.");
        }
        // Ensure the received wallet matches the backend public key
        if (receiveWallet !== process.env.BACKEND_PUBKEY) {
            throw new Error("Transaction is invalid or targeting the wrong wallet.");
        }
        // Define collection and metadata URL
        const collection = process.env.COLLECTION || "4GNyKThWxqePAqrz7A9EnoVGgc4HFdDcLCWppBuh4ZUV";
        const pinata = process.env.PINATA_URL || "https://peach-binding-gamefowl-763.mypinata.cloud/ipfs/";
        const url = `${pinata}${count}.json`;
        console.log("Metadata URL:", url);
        // Fetch metadata
        const fetchRes = yield fetch(url);
        if (!fetchRes.ok) {
            throw new Error(`Failed to fetch metadata. Status: ${fetchRes.status}`);
        }
        const fetchText = yield fetchRes.text();
        const jsonData = JSON.parse(fetchText);
        console.log("Metadata JSON:", jsonData);
        // Create asset in the collection
        const txSig = yield (0, createAsset_1.createAssetInCollection)(collection, jsonData.name, url, userWallet);
        console.log("Transaction Signature:", txSig);
        // Save the minted transaction into the database
        yield MintModal_1.MintModal.create({ hash: sig, amount, wallet: userWallet, count });
        // Increment count
        count++;
        return res.status(200).json({ data: txSig }); // Respond with the mint result
    }
    catch (err) {
        console.error("Minting Error:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}));
// @route    GET api/mint/getCount
// @desc     Get the number of minted transactions
// @access   Public
MintRouter.get("/getCount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use countDocuments for efficient counting
        const dbLength = yield MintModal_1.MintModal.countDocuments();
        console.log("Database length:", dbLength);
        return res.status(200).json({ count: dbLength });
    }
    catch (err) {
        console.error("Failed to get database length:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = MintRouter;
