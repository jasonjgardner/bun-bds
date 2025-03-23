export default async function route(
  url: URL,
  request: Request
): Promise<Response> {
  const authCode = url.searchParams.get("code");
  console.log(authCode);

  if (!authCode) {
    return new Response(
      JSON.stringify({
        error: "No auth code",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      }
    );
  }

  // Exchange auth code for access token
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: `${url.origin}/oauth/callback`,
    }),
  });

  const data = await response.json();

  const accessToken = data.access_token;

  console.log(accessToken);

  return new Response(`Received access code: ${accessToken}`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
