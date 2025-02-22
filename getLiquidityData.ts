import axios from 'axios';

export async function getLiquidityData(mintAddress: string) {
  const DEXSCREENER_BASIC_ENDPOINT = process.env.DEXSCREENER_BASIC_ENDPOINT;
  const getLqDataUrl = DEXSCREENER_BASIC_ENDPOINT + `/tokens/v1/solana/${mintAddress}`;
  const response = await axios.get(getLqDataUrl);

  if (response.status === 200) {
    // console.log(response.data);
    // const getPairUrl = DEXSCREENER_BASIC_ENDPOINT + `/latest/dex/pairs/solana/${response.data[0].pairAddress}`;
    // const pairResponse = await axios.get(getPairUrl);
    const liquidityData = {
      priceUsd: response.data[0].priceUsd,
      priceNative: response.data[0].priceNative,
      liquidity: response.data[0].liquidity,
      pairCreatedAt: response.data[0].pairCreatedAt
    }
    return liquidityData;
  } else {
    return {
      priceUsd: "",
      priceNative: "",
      liquidity: "",
      pairCreatedAt: 0
    } 
  }
}
