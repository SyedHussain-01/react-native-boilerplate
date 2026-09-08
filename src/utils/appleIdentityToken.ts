/** Reads `email` from an Apple identity JWT when credential.email is absent. */
export function getEmailFromAppleIdentityToken(
  identityToken: string,
): string {
  try {
    const payloadSegment = identityToken.split(".")[1];
    if (!payloadSegment) {
      return "";
    }
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload) as { email?: unknown };
    return typeof parsed.email === "string" ? parsed.email.trim() : "";
  } catch {
    return "";
  }
}
