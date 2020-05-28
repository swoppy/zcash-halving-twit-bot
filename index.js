require('dotenv').config();
const Twit = require('twit');
const text = require('./src/text');
const puppeteer = require('puppeteer');
const fs = require('fs');
const phrases = require('./src/phrases').phrases;

const T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/*  We need to upload to twitter first to receive the media_id_string from its callback, to
*   include that data with the tweet request
*
*   Run upload() once, then run the suceeding process interval'd
*/

upload();
setInterval(upload, 1000*120) // test
// setInterval(upload, 86400000); //24 hours

// callback function when statuses/update is successful
function tweetedCb(err, data, response) {
  if (err) {
    console.log('error: something wrong!');
  }
  else {
    console.log(`Tweet posted! date: ${data.created_at}`);
  }
}

// callback function when media/upload is successful, then make a request to tweet
function uploadedCb(err, data, response) {
  const id = data.media_id_string;
  const randomPhrases = phrases[Math.floor(Math.random() * phrases.length)];
  const post = {
    status: text.status(randomPhrases),
    media_ids: [id],
  };
  T.post('statuses/update', post, tweetedCb);
};

function upload() {
  const path = 'src/img/ss.png';
  if (fs.existsSync(path)) {
    fs.unlinkSync(path)
  }
  /* Puppeteer: go to a website and take a screenshot of a specific element then save to path as .png
  * args: ['--no-sandbox', '--disable-setuid-sandbox'] is a heroku specific config to stop whinning
  */
  (async () => {
    try {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await page.setViewport({width: 766, height: 113, deviceScaleFactor: 2});
      await page.goto(text.siteLink);
      await page.waitForSelector('#countdownTimer')
      const element = await page.$('#countdownTimer');
      await element.screenshot({ path: path });
      await browser.close();

      const b64Media = fs.readFileSync(path, { encoding: 'base64' }); 
      T.post('media/upload', { media_data: b64Media }, uploadedCb);
    }
    catch(e) {
      console.log(e);
    }
    
  })();
}