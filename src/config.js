require('dotenv').config();

module.exports = {
  consumerKey: process.env.CONSUMER_KEY,
  baseUrl: process.env.BASE_URL,
  binLookupPath: process.env.BIN_LOOKUP_PATH,
  privateKey: process.env.PRIVATE_KEY,
};