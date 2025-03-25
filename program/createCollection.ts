import { generateSigner, createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createCollection } from '@metaplex-foundation/mpl-core'

import wallet from "../wallet.json";

// Setup Umi
const umi = createUmi("https://devnet.helius-rpc.com/?api-key=8827c745-52e2-4a9c-a5c5-f0da69716f4e", "finalized");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const adminSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(adminSigner));

(async () => {
    // Generate the Collection KeyPair
    const collection = generateSigner(umi);
    console.log("This is your collection address", collection.publicKey.toString());

    // Generate the collection
    let tx = await createCollection(umi, {
        collection,
        name: "Puff Dog NFT Collection",
        uri: "https://peach-binding-gamefowl-763.mypinata.cloud/ipfs/bafybeiezmadrwjd3yjsxn2nqtuxsuhpytgmfxa32kudi7oev3ookqfhqei/5971879913596240965.jpg",

    }).sendAndConfirm(umi);

    // Deserialize the Signature from the Transaction
    console.log("Collection Created: https://solscan.io/tx/" + base58.deserialize(tx.signature)[0] + "?cluster=devnet");

})();