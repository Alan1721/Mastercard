const axios = require('axios');
const oauth = require('mastercard-oauth1-signer');
const config = require('./config');

function getSigningKey() {
  if (!config.privateKey) {
    throw new Error('No se encontró PRIVATE_KEY en variables de entorno');
  }

  return config.privateKey.replace(/\\n/g, '\n');
}

async function searchAccountRange(accountRange) {
  const url = `${config.baseUrl}${config.binLookupPath}`;
  const method = 'POST';

  const body = { accountRange };
  const payload = JSON.stringify(body);
  const signingKey = getSigningKey();

  const authorizationHeader = oauth.getAuthorizationHeader(
    url,
    method,
    payload,
    config.consumerKey,
    signingKey
  );

  const response = await axios({
    url,
    method,
    headers: {
      Authorization: authorizationHeader,
      'Content-Type': 'application/json',
    },
    data: body,
  });

  return response.data;
}

module.exports = {
  searchAccountRange,
};