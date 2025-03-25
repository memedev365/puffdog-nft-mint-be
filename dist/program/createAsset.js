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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetInCollection = void 0;
const umi_1 = require("@metaplex-foundation/umi");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const mpl_core_1 = require("@metaplex-foundation/mpl-core");
const serializers_1 = require("@metaplex-foundation/umi/serializers");
const wallet_json_1 = __importDefault(require("../wallet.json"));
// Setup Umi
const umi = (0, umi_bundle_defaults_1.createUmi)("https://api.devnet.solana.com", "finalized");
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet_json_1.default));
const adminSigner = (0, umi_1.createSignerFromKeypair)(umi, keypair);
umi.use((0, umi_1.signerIdentity)(adminSigner));
const createAssetInCollection = (collectionKey, name, uri, userWallet) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newOwner = (0, umi_1.publicKey)(userWallet);
        // Generate the Asset KeyPair
        const asset = (0, umi_1.generateSigner)(umi);
        console.log("This is your asset address", asset.publicKey.toString());
        // Fetch the Collection
        const collection = yield (0, mpl_core_1.fetchCollection)(umi, (0, umi_1.publicKey)(collectionKey));
        // Generate the Asset
        const tx = yield (0, mpl_core_1.create)(umi, {
            asset,
            collection,
            name,
            uri,
        }).sendAndConfirm(umi);
        // Deserialize the Signature from the Transaction
        const txSignature = serializers_1.base58.deserialize(tx.signature)[0];
        console.log(`Asset Created: https://solscan.io/tx/${txSignature}?cluster=devnet`);
        yield (0, mpl_core_1.transferV1)(umi, {
            asset: asset.publicKey,
            newOwner: newOwner,
            collection: (0, umi_1.publicKey)(collectionKey)
        }).sendAndConfirm(umi);
        return { txSignature };
    }
    catch (error) {
        console.error("An error occurred while creating the asset:", error);
        throw error;
    }
});
exports.createAssetInCollection = createAssetInCollection;
