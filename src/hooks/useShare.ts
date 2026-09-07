import { useCallback, useState } from "react";
import { Linking } from "react-native";
import Share, { Social } from "react-native-share";

const APP_NAME = "App";

export type MilestoneAchievementLine = {
  title: string;
  subtitle?: string;
  status?: "achieved" | "new" | "locked";
};

export type MilestoneSharePayload = {
  milestoneValue: string;
  milestoneLabel: string;
  achievements: MilestoneAchievementLine[];
  headline?: string;
  subheadline?: string;
};

export type MilestoneSharePlatform = "instagram" | "whatsapp" | "facebook";

function buildMilestoneShareMessage(payload: MilestoneSharePayload): string {
  const headline = payload.headline ?? "Congratulations";
  const sub = payload.subheadline ?? "You've reached a major milestone";
  const milestoneLine =
    `${payload.milestoneValue} ${payload.milestoneLabel}`.trim();

  const visible = payload.achievements.filter((a) => a.status !== "locked");
  const achievementLines =
    visible.length > 0
      ? visible
          .map((a) => {
            const suffix = a.subtitle ? ` — ${a.subtitle}` : "";
            return `• ${a.title}${suffix}`;
          })
          .join("\n")
      : "• Keep going on your journey!";

  return [
    `🎉 ${headline}`,
    "",
    sub,
    "",
    milestoneLine,
    "",
    "Your achievements:",
    achievementLines,
    "",
    `Shared via ${APP_NAME}`,
  ].join("\n");
}

function isUserDismissedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("user did not share") ||
    m.includes("cancel") ||
    m.includes("dismissed")
  );
}

/** WhatsApp: avoid shareSingle on Android (often opens Play Store without com.whatsapp query). */
async function openWhatsAppWithMessage(message: string): Promise<void> {
  const text = encodeURIComponent(message);
  const waApp = `whatsapp://send?text=${text}`;
  try {
    await Linking.openURL(waApp);
    return;
  } catch {
    // continue
  }
  try {
    await Share.shareSingle({
      social: Social.Whatsapp,
      message,
    });
    return;
  } catch {
    // Last resort: web handler (may open app or browser)
    await Linking.openURL(`https://api.whatsapp.com/send?text=${text}`);
  }
}

/**
 * Instagram does not accept plain-text via shareSingle reliably (often Play Store / wrong intent).
 * Use the system share sheet so the user can pick Instagram, Stories, or copy elsewhere.
 */
async function openInstagramFriendlyShare(message: string): Promise<void> {
  await Share.open({
    title: "Share your milestone",
    message,
    failOnCancel: false,
  });
}

export type UseShareReturn = {
  shareTo: (
    platform: MilestoneSharePlatform,
    payload: MilestoneSharePayload,
  ) => Promise<void>;
  shareToInstagram: (payload: MilestoneSharePayload) => Promise<void>;
  shareToWhatsapp: (payload: MilestoneSharePayload) => Promise<void>;
  shareToFacebook: (payload: MilestoneSharePayload) => Promise<void>;
  isSharing: boolean;
};

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);

  const shareTo = useCallback(
    async (
      platform: MilestoneSharePlatform,
      payload: MilestoneSharePayload,
    ) => {
      const message = buildMilestoneShareMessage(payload);
      setIsSharing(true);
      try {
        if (platform === "whatsapp") {
          await openWhatsAppWithMessage(message);
          return;
        }

        if (platform === "facebook") {
          await Share.shareSingle({
            social: Social.Facebook,
            message,
          });
          return;
        }

        if (platform === "instagram") {
          await openInstagramFriendlyShare(message);
          return;
        }
      } catch (e) {
        const errMsg =
          e instanceof Error
            ? e.message
            : "Something went wrong while sharing.";
        if (!isUserDismissedError(errMsg)) {
          // showErrorToast(errMsg, { position: "top", duration: 3000 });
        }
      } finally {
        setIsSharing(false);
      }
    },
    [],
  );

  const shareToInstagram = useCallback(
    (payload: MilestoneSharePayload) => shareTo("instagram", payload),
    [shareTo],
  );

  const shareToWhatsapp = useCallback(
    (payload: MilestoneSharePayload) => shareTo("whatsapp", payload),
    [shareTo],
  );

  const shareToFacebook = useCallback(
    (payload: MilestoneSharePayload) => shareTo("facebook", payload),
    [shareTo],
  );

  return {
    shareTo,
    shareToInstagram,
    shareToWhatsapp,
    shareToFacebook,
    isSharing,
  };
}
