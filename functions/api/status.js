export const onRequestGet = ({ env }) => {
  const hasApiKey = !!env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'your_api_key_here';
  return Response.json({
    hasApiKey,
    mode: hasApiKey ? 'live' : 'demo',
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null
  });
};
