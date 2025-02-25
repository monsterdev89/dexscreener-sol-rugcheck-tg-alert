import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { sleep } from './helper';
import { getMetaData } from './getMetaData';
import { getLiquidityData } from './getLiquidityData';
import JSONDatabase from './jsonDatabase';
import sendTelegramAlert from './sendTelegramAlert';

dotenv.config();

const heliusRpcUrl = `${process.env.HELIUS_BASIC_URL}${process.env.HELIUS_API_KEY}`;
const heliusWs = `${process.env.HELIUS_WS_URL}${process.env.HELIUS_API_KEY}`;
const DEXSCREENER_BASIC_ENDPOINT = process.env.DEXSCREENER_BASIC_ENDPOINT;;
const RUGCHECK_BASE_URL = process.env.RUGCHECK_BASE_URL;

interface data {
  id: string;
  tokenAddress: string;
}

const db = new JSONDatabase<data>('data.json');

interface DexscreenerPair {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: number;
  hearder: string;
  openGraph: string;
  description: string;
  links: any[];
}

async function getNewTokens(): Promise<DexscreenerPair[] | null> {
  try {
    const getLatestTokenURL = DEXSCREENER_BASIC_ENDPOINT + `/token-profiles/latest/v1`;
    const response = await axios.get(`${getLatestTokenURL}`);
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.error(`Error: HTTP status ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function getRugCheckScore(tokenMintAddress: string): Promise<{ risks: any[], score: number }> {
  const rugcheckReportUrl = RUGCHECK_BASE_URL + `/tokens/${tokenMintAddress}/report/summary`;
  const response = await axios.get(rugcheckReportUrl);
  // console.log(response.data);
  if (response.status === 200) {
    return { risks: response.data.risks, score: response.data.score };
  } else {
    return { risks: [], score: -1 }
  }
}

async function main() {
  // let previousTokens: Set<{ tokenAddress: string, dextoolUrl: string, socialLinks: any[] }> = new Set();
  while (true) {
    const data = await getNewTokens();
    if (data) {
      const filtered_data = data.filter(token => token.chainId === 'solana');
      const newTokens = filtered_data.map(token => {
        return {
          tokenAddress: token.tokenAddress,
          dextoolUrl: token.url,
          socialLinks: token.links
        };
      });
      const addedTokens = newTokens.filter(x => !db.getByTokenAddress(x.tokenAddress));
      if (addedTokens.length > 0) {
        // console.log("--------> New tokens found.");
        for (const token of addedTokens) {
          // console.log("new token: ", token.socialLinks);
          try {
            const liquidityData = await getLiquidityData(token.tokenAddress);
            const currentTime = Date.now();
            console.log(currentTime - liquidityData.pairCreatedAt);
            if (currentTime - liquidityData.pairCreatedAt > 1000 * 60 * 5) {
              console.log(`log----------> token address: ${token.tokenAddress}  --------> old token`);
              continue;
            }
            if (liquidityData.liquidity.usd < 3000) {
              console.log(`log-----------> token address: ${token.tokenAddress}  ---------> liquidity amount < $3000`);
              continue;
            }
            const metaData = await getMetaData(token.tokenAddress);
            const rugCheckResult = await getRugCheckScore(token.tokenAddress);
            if (rugCheckResult.score > 400) {
              console.log(`log-----------> token address: ${token.tokenAddress}  ---------> rugcheck score > 400`);
              continue;
            }
            console.log("new token address", token);
            // await sendTelegramAlert(token, metaData, liquidityData, rugCheckResult);
            await sleep(1000);
          } catch (err) {
            console.log(`Error getting RugCheck score for ${token}`, err);
          }
        }
      } else {
        console.log("-------->No new tokens found.");
      }

    } else {
      console.log("Failed to retrieve data or no pairs found.");
    }

    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

main();
