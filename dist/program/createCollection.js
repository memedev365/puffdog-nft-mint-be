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
const umi_1 = require("@metaplex-foundation/umi");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const serializers_1 = require("@metaplex-foundation/umi/serializers");
const mpl_core_1 = require("@metaplex-foundation/mpl-core");
const wallet_json_1 = __importDefault(require("../wallet.json"));
// Setup Umi
const umi = (0, umi_bundle_defaults_1.createUmi)("https://devnet.helius-rpc.com/?api-key=8827c745-52e2-4a9c-a5c5-f0da69716f4e", "finalized");
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet_json_1.default));
const adminSigner = (0, umi_1.createSignerFromKeypair)(umi, keypair);
umi.use((0, umi_1.signerIdentity)(adminSigner));
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Generate the Collection KeyPair
    const collection = (0, umi_1.generateSigner)(umi);
    console.log("This is your collection address", collection.publicKey.toString());
    // Generate the collection
    let tx = yield (0, mpl_core_1.createCollection)(umi, {
        collection,
        name: "Puff Dog NFT Collection",
        uri: "https://peach-binding-gamefowl-763.mypinata.cloud/ipfs/bafybeiezmadrwjd3yjsxn2nqtuxsuhpytgmfxa32kudi7oev3ookqfhqei/5971879913596240965.jpg",
    }).sendAndConfirm(umi);
    // Deserialize the Signature from the Transaction
    console.log("Collection Created: https://solscan.io/tx/" + serializers_1.base58.deserialize(tx.signature)[0] + "?cluster=devnet");
}))();
