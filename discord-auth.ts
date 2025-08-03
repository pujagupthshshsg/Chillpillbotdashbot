
'use client';

import { DISCORD_CONFIG } from './discord-config';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
}

const CLIENT_ID = DISCORD_CONFIG.CLIENT_ID;
const CLIENT_SECRET = DISCORD_CONFIG.CLIENT_SECRET;
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
const SCOPES = 'identify guilds';

export const getDiscordAuthUrl = () => {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {
  try {
    const redirectUri = window.location.origin + '/auth/callback';

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Discord token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

export const getDiscordUser = async (accessToken: string): Promise<DiscordUser> => {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user');

    return await response.json();
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    throw error;
  }
};

export const getDiscordGuilds = async (accessToken: string): Promise<DiscordGuild[]> => {
  try {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch guilds');

    return await response.json();
  } catch (error) {
    console.error('Error fetching Discord guilds:', error);
    throw error;
  }
};
