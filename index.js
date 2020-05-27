require('dotenv').config();
const Twit = require('twit');
const text = require('./src/text');
const { webkit } = require('playwright');
const fs = require('fs');

const T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const path = 'src/img/site.png';

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto(text.siteLink);
  await page.screenshot({ path: path });
  await browser.close();
})();

const tweetedCb = (err, data, response) => {
  if (err) {
    console.log('error: something wrong!');
  }
  else {
    console.log(`Tweet posted! date: ${data.created_at}`);
  }
}

const uploadedCb = (err, data, response) => {
  const id = data.media_id_string;
  const post = {
    status: text.status(),
    media_ids: [id],
  };
  T.post('statuses/update', post, tweetedCb);
};

const upload = () => {
  const b64Media = fs.readFileSync(path, { encoding: 'base64' }); 
  T.post('media/upload', { media_data: b64Media }, uploadedCb);
}

upload();
// setInterval(upload, 140000000);
