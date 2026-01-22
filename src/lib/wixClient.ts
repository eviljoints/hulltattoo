//src\lib\wixClient.ts
import Cookies from "js-cookie";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { services, availabilityCalendar } from "@wix/bookings";
import { redirects } from "@wix/redirects";

export function getWixClient() {
  const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_WIX_CLIENT_ID");
  }

  // Wix example uses: JSON.parse(Cookies.get("session") || null)
  // but JSON.parse(null) throws, so we guard safely:
  const rawSession = Cookies.get("session");
  const tokens = rawSession ? JSON.parse(rawSession) : undefined;

  return createClient({
    modules: { services, availabilityCalendar, redirects },
    auth: OAuthStrategy({
      clientId,
      tokens,
    }),
  });
}
