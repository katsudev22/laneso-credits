require('dotenv').config();

const express = require('express');
const path = require('path');

const dir = process.pkg ? path.dirname(process.execPath) : __dirname;

const app = express();
const port = process.env.PORT;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const USE_MOCK = process.env.USE_MOCK === 'true';
const SCOPE = 'channel:read:subscriptions';

const MOCK_TWITCH_SUBS = [
    { user_id: '1', user_name: 'katsu0z', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'barao', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'davi', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'ajnin', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'ioha', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'alehmalia', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'matheusdevido', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'mef', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'euvo', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'kyorannie', user_login: 'katsu0z', tier: '1000', is_gift: false },
    { user_id: '1', user_name: 'ga_argoso', user_login: 'katsu0z', tier: '1000', is_gift: false }
]

let subsData = {
    accessToken: null,
    channelId: null,
    subscriptions: []
}

function getTwitchAuthUrl() {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('scope', SCOPE);
    return url.toString();
}

async function getChannelId(accessToken) {
    const response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    });

    const data = await response.json();

    return data.data[0].id;
}

async function getSubscriptions(accessToken, channelId) {
    const response = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${channelId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    });

    const data = await response.json();

    if (USE_MOCK) {
        return MOCK_TWITCH_SUBS;
    }

    return data.data;
}

app.use(express.static(path.join(dir, 'public')));

app.get('/subscriptions', (req, res) => {
    if (!USE_MOCK && !subsData.accessToken) {
        return res.redirect(getTwitchAuthUrl());
    }
    
    res.sendFile(path.join(dir, 'public', 'subscriptions.html'));
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const url = new URL('https://id.twitch.tv/oauth2/token');
        url.searchParams.set('client_id', CLIENT_ID);
        url.searchParams.set('client_secret', CLIENT_SECRET);
        url.searchParams.set('code', code);
        url.searchParams.set('grant_type', 'authorization_code');
        url.searchParams.set('redirect_uri', REDIRECT_URI);

        const response = await fetch(url.toString(), { method: 'POST' });
        const data = await response.json();

        const accessToken = data.access_token;
        const channelId = await getChannelId(accessToken);
        const subscriptions = await getSubscriptions(accessToken, channelId);

        subsData = {
            accessToken,
            channelId,
            subscriptions
        };

        res.redirect('/subscriptions');
    } catch (err) {
        res.status(500).send(`grrr... ${err}`);
    }
});

app.get('/subs', async (req, res) => {
    try {
        const subs = await getSubscriptions(subsData.accessToken, subsData.channelId);
        subsData.subscriptions = Array.isArray(subs) ? subs : [];

        const subNames = subsData.subscriptions
            .map((x) => x.user_name)
            .filter(Boolean);

        res.json({
            subs: subNames
        });
    } catch (err) {
        console.log(`err... ${err}`);
    }
});

app.listen(port, () => { 
    console.log(`rodando creditos laneso | http://localhost:${port}/subscriptions`);
});