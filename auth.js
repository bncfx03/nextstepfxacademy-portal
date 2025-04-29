const axios = require('axios');
const CLIENT_ID = process.env.PATREON_CLIENT_ID;
const CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const REDIRECT_URI = process.env.PATREON_REDIRECT_URI;

const getPatreonAuthURL = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'identity identity.memberships'
  });
  return `https://www.patreon.com/oauth2/authorize?${params.toString()}`;
};

const checkPatreonMembership = async (code) => {
  const payload = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  });

  const tokenResponse = await axios.post('https://www.patreon.com/api/oauth2/token', payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const accessToken = tokenResponse.data.access_token;

  const identityResponse = await axios.get('https://www.patreon.com/api/oauth2/v2/identity', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { include: 'memberships' }
  });

  const memberships = identityResponse.data.included || [];

  const isPatron = memberships.some(
    m => m.type === 'member' && m.attributes.patron_status === 'active_patron'
  );

  return isPatron;
};

module.exports = { getPatreonAuthURL, checkPatreonMembership };
