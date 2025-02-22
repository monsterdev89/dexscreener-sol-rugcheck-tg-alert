import TelegramBot from 'node-telegram-bot-api';

export default async function sendTelegramAlert(token: any, metaData: any, liquidityData: any, rugCheckResult: any) {
  const telegramBotToken = String(process.env.TELEGRAM_BOT_TOKEN);
  // const telegramChatId = String(process.env.TELEGRAM_CHAT_ID);
  const channelUserName = String(process.env.CHANNEL_USER_NAME);
  const bot = new TelegramBot(telegramBotToken, { polling: false });
  let channelId = "";
  await bot
  .getChat(channelUserName)
  .then((chat: any) => {
    channelId = chat.id;
  })
  const message = `
    New Token Detected From Dexscreener!
    1. Chart:  ${token.dextoolUrl}
    2. Token Name:  ${metaData.name}
    3. Symbol:  ${metaData.symbol}
    4. Contract Address:\n  ${token.tokenAddress}
    5. Social Networks:\n${token.socialLinks?.map((link: any) => {
      if (link?.label) {
        return  `        -type: ${link?.label}\n` + `         link: ${link.url} \n`;
      } else return `        -type: ${link?.type}\n` + `         link: ${link.url} \n`;
    })}
    6. Current Price (usd):  ${liquidityData.priceUsd}
    7. Liquidity Amount (usd):  ${liquidityData.liquidity.usd}
    8. RugCheckRisk:\n${rugCheckResult.risks?.map((item:any, index: number) => {
      return `      Risk${index+1}\n         -name: ${item.name}\n         -value: ${item.value}\n         -description: ${item.description}\n         -score: ${item.score}\n         -level: ${item.level}\n`
    })}
    `;
  try {
    await bot.sendMessage(channelId, message);
    console.log('Telegram alert sent.');
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
}