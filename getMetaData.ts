import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';


export async function getMetaData(tokenAddress: string): Promise<{ name: string, symbol: string }> {
  const solanaRpcEndpoint = `${process.env.HELIUS_BASIC_URL}${process.env.HELIUS_API_KEY}`;
  const connection = new Connection(solanaRpcEndpoint);
  const metaplex = Metaplex.make(connection);
  const mintAddress = new PublicKey(tokenAddress);

  const tokenMetadata = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
  if (tokenMetadata) {
    const metadata = {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
    }
    return metadata;
  }
  else {
    return {
      name: "", 
      symbol: ""
    }
  }
}