import { avatarInitials } from "@/lib/avatar";
import { svgDataUri } from "@/lib/badges";
import { createClient } from "@/utils/supabase/server";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const width = 1200;
const height = 630;

type PinnedBadge = {
  id: string;
  name: string;
  icon_svg: string;
  color: string;
};

type BadgeJoin = {
  name: string;
  icon_svg: string;
  color: string;
};

const frameStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#060B12",
  color: "#ffffff",
  fontFamily: "sans-serif",
  overflow: "hidden",
};

function dotMatrix() {
  const dots = [];
  const step = 28;

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="#36D6FF" />);
    }
  }

  return dots;
}

function CyberBackdrop() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.1 }}
      >
        {dotMatrix()}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 20,
          width: 1080,
          height: 590,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at center, rgba(54, 214, 255, 0.48) 0%, rgba(54, 214, 255, 0.16) 28%, rgba(6, 11, 18, 0) 68%)",
        }}
      />
    </div>
  );
}

function Watermark({ views }: { views?: number }) {
  const label =
    views == null ? "[ HAZY.TECH ]" : `[ HAZY.TECH ] • ${formatViews(views)} VIEWS`;

  return (
    <div
      style={{
        position: "absolute",
        right: 48,
        bottom: 36,
        display: "flex",
        color: "#36D6FF",
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 3,
      }}
    >
      {label}
    </div>
  );
}

function tintedBadgeSrc(iconSvg: string, color: string) {
  let svg = iconSvg.replace(/currentColor/gi, color);
  if (/fill="/i.test(svg)) {
    svg = svg.replace(/fill="(?!none)[^"]*"/gi, `fill="${color}"`);
  } else {
    svg = svg.replace(/<svg\b/i, `<svg fill="${color}"`);
  }
  return svgDataUri(svg);
}

function pinnedFromAwards(
  awards: { id: string; badges: BadgeJoin | BadgeJoin[] | null }[] | null,
): PinnedBadge[] {
  if (!awards) return [];

  return awards.flatMap((award) => {
    const badge = Array.isArray(award.badges) ? award.badges[0] : award.badges;
    if (!badge?.icon_svg?.trim()) return [];
    return [
      {
        id: award.id,
        name: badge.name,
        icon_svg: badge.icon_svg,
        color: badge.color || "#8EF3FF",
      },
    ];
  });
}

function brandedImage() {
  return new ImageResponse(
    (
      <div style={frameStyle}>
        <CyberBackdrop />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(142, 243, 255, 0.2)",
            borderRadius: 24,
            padding: "48px 72px",
            boxShadow: "0 0 60px rgba(54, 214, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -3,
              color: "#ffffff",
            }}
          >
            Hazy
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              color: "#8EF3FF",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            // hazy.tech
          </div>
        </div>
        <Watermark />
      </div>
    ),
    { width, height },
  );
}

function formatViews(views: number) {
  return new Intl.NumberFormat("en-US").format(views);
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim() ?? "";
  if (!username) return brandedImage();

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, avatar_url, display_name, username, views")
      .eq("username", username)
      .maybeSingle();

    if (!data) return brandedImage();

    const { data: awards } = await supabase
      .from("awarded_badges")
      .select("id, badges(name, icon_svg, color)")
      .eq("profile_id", data.id)
      .eq("is_pinned", true)
      .order("order_index", { ascending: true })
      .limit(3);

    const pinnedBadges = pinnedFromAwards(awards);
    const displayName = data.display_name?.trim() || data.username;
    const avatarUrl =
      data.avatar_url && /^https?:\/\//i.test(data.avatar_url) ? data.avatar_url : null;
    const views = data.views ?? 0;

    return new ImageResponse(
      (
        <div style={frameStyle}>
          <CyberBackdrop />
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(142, 243, 255, 0.2)",
              borderRadius: 24,
              padding: 40,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 40,
              width: "85%",
              boxShadow: "0 0 60px rgba(54, 214, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 180,
                height: 180,
                borderRadius: 9999,
                border: "4px solid #8EF3FF",
                boxShadow: "0 0 28px rgba(142, 243, 255, 0.55)",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0B1A24",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  width={180}
                  height={180}
                  style={{ width: 180, height: 180, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 64,
                    fontWeight: 800,
                    color: "#8EF3FF",
                  }}
                >
                  {avatarInitials(displayName)}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 72,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -2,
                  color: "#ffffff",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#8EF3FF",
                }}
              >
                {`// @${data.username}`}
              </div>

              {pinnedBadges.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 22,
                  }}
                >
                  {pinnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      style={{
                        display: "flex",
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(142, 243, 255, 0.08)",
                        border: "1px solid rgba(142, 243, 255, 0.35)",
                        boxShadow: `0 0 18px ${badge.color}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tintedBadgeSrc(badge.icon_svg, badge.color)}
                        alt=""
                        width={26}
                        height={26}
                        style={{ width: 26, height: 26 }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <Watermark views={views} />
        </div>
      ),
      { width, height },
    );
  } catch {
    return brandedImage();
  }
}
