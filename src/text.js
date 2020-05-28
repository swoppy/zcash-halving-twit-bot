const phrases = require('./phrases').phrases;

const randomPhrases = phrases[Math.floor(Math.random() * phrases.length)];
module.exports = {
  siteLink: 'https://zcashblockhalf.com',
  status: () => `⚒️ $ZEC Halving Countdown ⚒️\n\n\n🚨 Checkout: https://zcashblockhalf.com 🚨\n💰 Buy & Trade: bit.ly/zcashblockhalf 💰\n\n\n🔥 ${randomPhrases} 🔥`,
};