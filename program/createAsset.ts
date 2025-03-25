import { generateSigner, createSignerFromKeypair, signerIdentity, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { create, fetchCollection, transferV1 } from '@metaplex-foundation/mpl-core'
import { base58 } from '@metaplex-foundation/umi/serializers';

import wallet from "../wallet.json";

// Setup Umi
const umi = createUmi("https://api.devnet.solana.com", "finalized");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const adminSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(adminSigner));

export const createAssetInCollection = async (collectionKey: string, name: string, uri: string, userWallet: string) => {
  try {
    const newOwner = publicKey(userWallet);

    // Generate the Asset KeyPair
    const asset = generateSigner(umi);
    console.log("This is your asset address", asset.publicKey.toString());

    // Fetch the Collection
    const collection = await fetchCollection(umi, publicKey(collectionKey));

    // Generate the Asset
    const tx = await create(umi, {
      asset,
      collection,
      name,
      uri,
    }).sendAndConfirm(umi);

    // Deserialize the Signature from the Transaction
    const txSignature = base58.deserialize(tx.signature)[0];
    console.log(`Asset Created: https://solscan.io/tx/${txSignature}?cluster=devnet`);
    await transferV1(umi, {
      asset: asset.publicKey,
      newOwner: newOwner,
      collection: publicKey(collectionKey)
    }).sendAndConfirm(umi);

    return {txSignature};
  } catch (error) {
    console.error("An error occurred while creating the asset:", error);
    throw error;
  }
};