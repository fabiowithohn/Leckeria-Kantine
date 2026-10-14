import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  CATEGORIES,
  DAY_LABELS,
  MENU_COUNT,
  sortCodes,
  splitCodes,
  type Category,
  type PlanData,
} from "./meal-plan";
import { CATEGORY_ICON_PATHS } from "./plan-icons";

/*
  DESIGN-KONTRAKT – Speiseplan-Vorlage (Druck / Upload)
  THESIS: Der Speiseplan ist die gedruckte Fortsetzung der Website – nicht ein
    Fremdlayout mit Leckeria-Logo. Er verweigert das übliche Fotorahmen-Poster
    mit dünner Geometrie-Type und übernimmt die Formsprache der Site 1:1.
  OWN-WORLD: Leckeria-Orange als Verlaufsband (brand-400 → 600) oben und unten,
    dazwischen eine weiße Karte mit Sand-Rand und warmem Schatten; Pills für
    Tage, Status und Kennzeichnung; Nunito 900 mit enger Laufweite für Titel,
    Nunito Sans für Text; Gold-Punkt als Eyebrow, Kräutergrün als Rand-Akzent,
    Terra für Symbole und Kennzeichnungen. Ein warmes Food-Flatlay in
    Cremetönen rahmt alles.
  STORY: Gäste erkennen auf einen Blick Tag → Menü → Gericht → Kennzeichnung
    und sehen, dass es dieselbe Marke wie die Website ist.
  FIRST VIEWPORT: DIN-A4-quer, Kopfband mit „Speiseplan“ links und Kantine/Woche
    rechts, Karte mit Tages-Pills links und drei Menüspalten, Legende als Zeile
    am Kartenfuß, Fußband mit Logo-Chip, Salat-Hinweis und Vorbestell-Notiz.
  FORM: Erweiterung der bestehenden Website-Welt auf eine Druckfläche
    (Struktur vom bisherigen Plan übernommen, Welt ersetzt).
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
    finish review, the verdict, and DESIGN.md.
*/

// Basis-Layout in Pixeln bei 1600 × 1131 (DIN-A4-quer). Alle Maße werden mit
// `scale` multipliziert, für den Download z. B. ×2.
export const PLAN_WIDTH = 1600;
export const PLAN_HEIGHT = 1131;

// Website-Tokens (src/app/globals.css)
const BRAND_400 = "#fb923c";
const BRAND_500 = "#f97316";
const BRAND_600 = "#ea580c";
const BRAND_700 = "#c2410c";
const GOLD_400 = "#fbbf24";
const HERB_500 = "#65a30d";
const HERB_600 = "#4d7c0f";
const SAND_100 = "#fdf1e3";
const SAND_200 = "#f8e4cd";
const INK = "#1c1917";
const INK_SOFT = "#6f655d";
const WHITE = "#ffffff";

const BAND_GRADIENT = `linear-gradient(118deg, ${BRAND_400} 0%, ${BRAND_500} 42%, ${BRAND_600} 100%)`;

// Raster
const M = 120; // Außenrand (Foto bleibt links/rechts sichtbar)
const W = PLAN_WIDTH - 2 * M; // 1360
const HEADER = { top: 56, height: 144 };
const CARD = { top: 224, height: 720 };
const FOOTER = { top: 972, height: 120 };
const LOGO = { width: 72, height: 96 }; // Seitenverhältnis 674:900, sitzt im Fußband
const RADIUS = 36;

const DAY_PILL = { left: 144, width: 160, height: 56 };
const COLS = [
  { left: 336, width: 350 },
  { left: 712, width: 350 },
  { left: 1088, width: 350 },
];
const DIVIDERS = [699, 1075];
const MENU_HEAD_TOP = 256;
const ROW_TOP = 316;
const ROW_STEP = 114;
const LEGEND_TOP = 896;

/* ---------------- Assets (einmal laden, dann im Speicher) ---------------- */

type FontSpec = { name: string; file: string; weight: 400 | 600 | 700 | 800 | 900; style: "normal" | "italic" };

const FONT_SPECS: FontSpec[] = [
  { name: "Nunito", file: "Nunito-700.ttf", weight: 700, style: "normal" },
  { name: "Nunito", file: "Nunito-800.ttf", weight: 800, style: "normal" },
  { name: "Nunito", file: "Nunito-900.ttf", weight: 900, style: "normal" },
  { name: "Nunito", file: "Nunito-700-Italic.ttf", weight: 700, style: "italic" },
  { name: "Nunito Sans", file: "NunitoSans-400.ttf", weight: 400, style: "normal" },
  { name: "Nunito Sans", file: "NunitoSans-600.ttf", weight: 600, style: "normal" },
  { name: "Nunito Sans", file: "NunitoSans-700.ttf", weight: 700, style: "normal" },
  { name: "Nunito Sans", file: "NunitoSans-400-Italic.ttf", weight: 400, style: "italic" },
];

type Assets = {
  fonts: { name: string; data: ArrayBuffer; weight: FontSpec["weight"]; style: FontSpec["style"] }[];
  background: string;
  logo: string;
};

let assetsPromise: Promise<Assets> | null = null;

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function dataUri(path: string, mime: string): Promise<string> {
  const buf = await readFile(path);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function loadAssets(): Promise<Assets> {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      const root = process.cwd();
      const fontDir = join(root, "src", "plan-assets", "fonts");
      const fonts = await Promise.all(
        FONT_SPECS.map(async (f) => ({
          name: f.name,
          data: toArrayBuffer(await readFile(join(fontDir, f.file))),
          weight: f.weight,
          style: f.style,
        })),
      );
      const [background, logo] = await Promise.all([
        dataUri(join(root, "public", "plan", "background.jpg"), "image/jpeg"),
        dataUri(join(root, "public", "plan", "logo-white.png"), "image/png"),
      ]);
      return { fonts, background, logo };
    })();
    assetsPromise.catch(() => (assetsPromise = null));
  }
  return assetsPromise;
}

/* ---------------- Bausteine ---------------- */

function CategoryIcon({ category, size, color }: { category: Category; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={CATEGORY_ICON_PATHS[category]} />
    </svg>
  );
}

/** Kennzeichnung („*1,3,7“) klein hochgestellt in Terra. */
function Codes({ value, s, size = 12 }: { value: string; s: number; size?: number }) {
  return (
    <div
      style={{
        fontFamily: "Nunito Sans",
        fontSize: size * s,
        fontWeight: 700,
        lineHeight: 1,
        marginTop: 2 * s,
        marginLeft: 3 * s,
        marginRight: 3 * s,
        color: BRAND_700,
      }}
    >
      {value}
    </div>
  );
}

/** Eine Beschreibungszeile: Text und hochgestellte Kennzeichnungen. */
function DescriptionLine({ line, s }: { line: string; s: number }) {
  const parts = splitCodes(line);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
      {parts.map((p, i) =>
        p.kind === "codes" ? (
          <Codes key={i} value={p.value} s={s} size={11.5} />
        ) : (
          <div
            key={i}
            style={{ fontFamily: "Nunito Sans", fontSize: 17.5 * s, lineHeight: 1.3, color: INK, whiteSpace: "pre-wrap" }}
          >
            {p.value}
          </div>
        ),
      )}
    </div>
  );
}

/** Das komplette Plan-Layout als Satori-kompatibles JSX (nur Flexbox, absolute Positionen). */
export function PlanImage({ plan, kw, assets, scale: s }: { plan: PlanData; kw?: number; assets: Assets; scale: number }) {
  const px = (n: number) => n * s;

  return (
    <div
      style={{
        width: px(PLAN_WIDTH),
        height: px(PLAN_HEIGHT),
        display: "flex",
        position: "relative",
        fontFamily: "Nunito Sans",
        color: INK,
        background: SAND_100,
      }}
    >
      {/* Hintergrundfoto mit leichtem Creme-Schleier, damit Bänder und Karte führen */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assets.background}
        alt=""
        width={px(PLAN_WIDTH)}
        height={px(PLAN_HEIGHT)}
        style={{ position: "absolute", left: 0, top: 0, width: px(PLAN_WIDTH), height: px(PLAN_HEIGHT), objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: px(PLAN_WIDTH),
          height: px(PLAN_HEIGHT),
          background: "rgba(255, 250, 244, 0.08)",
        }}
      />

      {/* ---------- Kopfband ---------- */}
      <div
        style={{
          position: "absolute",
          left: px(M),
          top: px(HEADER.top),
          width: px(W),
          height: px(HEADER.height),
          borderRadius: px(RADIUS),
          background: BAND_GRADIENT,
          boxShadow: `0 ${px(18)}px ${px(40)}px ${px(-16)}px rgba(194, 65, 12, 0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: px(56),
          paddingRight: px(48),
        }}
      >
        <div
          style={{
            fontFamily: "Nunito",
            fontWeight: 900,
            fontSize: px(82),
            letterSpacing: px(-2.4),
            lineHeight: 1,
            color: WHITE,
            paddingBottom: px(6),
          }}
        >
          Speiseplan
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {/* Eyebrow-Pill wie auf der Website */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: px(36),
              paddingLeft: px(14),
              paddingRight: px(16),
              borderRadius: px(999),
              background: "rgba(255,255,255,0.22)",
              fontFamily: "Nunito Sans",
              fontWeight: 700,
              fontSize: px(16),
              color: WHITE,
            }}
          >
            <div style={{ width: px(9), height: px(9), borderRadius: px(999), background: GOLD_400, marginRight: px(9) }} />
            <div>{`Kantine ${plan.canteen}${kw ? ` · KW ${kw}` : ""}`}</div>
          </div>
          <div
            style={{
              marginTop: px(10),
              fontFamily: "Nunito",
              fontWeight: 800,
              fontSize: px(34),
              letterSpacing: px(-0.6),
              lineHeight: 1.1,
              color: WHITE,
            }}
          >
            {plan.dateLabel}
          </div>
        </div>
      </div>

      {/* ---------- Karte ---------- */}
      <div
        style={{
          position: "absolute",
          left: px(M),
          top: px(CARD.top),
          width: px(W),
          height: px(CARD.height),
          borderRadius: px(RADIUS),
          background: WHITE,
          border: `${px(1.5)}px solid ${SAND_200}`,
          boxShadow: `0 ${px(30)}px ${px(60)}px ${px(-20)}px rgba(194, 65, 12, 0.3)`,
        }}
      />

      {/* Menü-Überschriften */}
      {COLS.map((c, j) => (
        <div
          key={j}
          style={{
            position: "absolute",
            left: px(c.left),
            top: px(MENU_HEAD_TOP),
            width: px(c.width),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: px(11), height: px(11), borderRadius: px(999), background: GOLD_400, marginRight: px(11), marginTop: px(3) }} />
          <div style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: px(31), letterSpacing: px(-0.7), lineHeight: 1, color: INK }}>
            {`Menü ${j + 1}`}
          </div>
        </div>
      ))}

      {/* Spaltentrenner */}
      {DIVIDERS.map((x) => (
        <div
          key={x}
          style={{ position: "absolute", left: px(x), top: px(302), width: px(2), height: px(574), borderRadius: px(2), background: SAND_200 }}
        />
      ))}

      {/* Tages-Pills */}
      {DAY_LABELS.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: px(DAY_PILL.left),
            top: px(ROW_TOP + i * ROW_STEP - 2),
            width: px(DAY_PILL.width),
            height: px(DAY_PILL.height),
            borderRadius: px(999),
            background: BAND_GRADIENT,
            boxShadow: `0 ${px(14)}px ${px(28)}px ${px(-12)}px rgba(194, 65, 12, 0.45)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Nunito",
            fontWeight: 800,
            fontSize: px(label.length > 9 ? 19 : 21),
            letterSpacing: px(-0.2),
            color: WHITE,
          }}
        >
          {label}
        </div>
      ))}

      {/* Gerichte */}
      {plan.days.map((day, i) =>
        Array.from({ length: MENU_COUNT }, (_, j) => {
          const col = COLS[j];
          const menu = day.menus[j];
          const top = px(ROW_TOP + i * ROW_STEP);
          if (day.closed) {
            return (
              <div
                key={`${i}-${j}`}
                style={{
                  position: "absolute",
                  left: px(col.left),
                  top: top + px(12),
                  display: "flex",
                  alignItems: "center",
                  height: px(32),
                  paddingLeft: px(14),
                  paddingRight: px(14),
                  borderRadius: px(999),
                  background: SAND_100,
                  fontFamily: "Nunito",
                  fontWeight: 800,
                  fontSize: px(15),
                  color: INK_SOFT,
                }}
              >
                geschlossen
              </div>
            );
          }
          if (!menu || !menu.title.trim()) return null;
          const codes = sortCodes(menu.codes);
          const lines = menu.description.split(/\r?\n/).filter((l) => l.trim().length > 0);
          return (
            <div
              key={`${i}-${j}`}
              style={{
                position: "absolute",
                left: px(col.left),
                top,
                width: px(col.width),
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", marginBottom: px(3) }}>
                <div style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: px(21.5), letterSpacing: px(-0.3), lineHeight: 1.2, color: INK }}>
                  {menu.title}
                </div>
                {codes.length > 0 && <Codes value={`*${codes.join(",")}`} s={s} size={12.5} />}
                {menu.category && (
                  <div style={{ display: "flex", marginLeft: px(4), marginTop: px(-1) }}>
                    <CategoryIcon category={menu.category} size={px(25)} color={BRAND_700} />
                  </div>
                )}
              </div>
              {lines.map((line, k) => (
                <DescriptionLine key={k} line={line} s={s} />
              ))}
            </div>
          );
        }),
      )}

      {/* Legende als Zeile am Kartenfuß */}
      {plan.showLegend && (
        <div
          style={{
            position: "absolute",
            left: px(M),
            top: px(LEGEND_TOP),
            width: px(W),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {CATEGORIES.map((c, i) => (
            <div key={c.key} style={{ display: "flex", alignItems: "center", marginLeft: i === 0 ? 0 : px(34) }}>
              <CategoryIcon category={c.key} size={px(24)} color={BRAND_700} />
              <div style={{ marginLeft: px(8), fontFamily: "Nunito Sans", fontWeight: 600, fontSize: px(14.5), color: INK_SOFT }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Fußband ---------- */}
      <div
        style={{
          position: "absolute",
          left: px(M),
          top: px(FOOTER.top),
          width: px(W),
          height: px(FOOTER.height),
          borderRadius: px(RADIUS),
          background: BAND_GRADIENT,
          boxShadow: `0 ${px(18)}px ${px(40)}px ${px(-16)}px rgba(194, 65, 12, 0.35)`,
          display: "flex",
          alignItems: "center",
          paddingLeft: px(24),
          paddingRight: px(28),
        }}
      >
        {/* Logo (weiß) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assets.logo}
          alt=""
          width={px(LOGO.width)}
          height={px(LOGO.height)}
          style={{ width: px(LOGO.width), height: px(LOGO.height), flexShrink: 0 }}
        />

        {/* Salate-Pill in Kräutergrün (wie die Kantinen-Buttons der Website) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: px(40),
            paddingLeft: px(18),
            paddingRight: px(18),
            marginLeft: px(26),
            borderRadius: px(999),
            background: WHITE,
            border: `${px(2)}px solid ${HERB_500}`,
            fontFamily: "Nunito",
            fontWeight: 800,
            fontSize: px(16),
            color: HERB_600,
            flexShrink: 0,
          }}
        >
          Salate
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: px(640), flexShrink: 0, marginLeft: px(18) }}>
          <div style={{ fontFamily: "Nunito Sans", fontWeight: 700, fontSize: px(16), lineHeight: 1.3, color: WHITE }}>
            {plan.saladTitle}
          </div>
          <div style={{ fontFamily: "Nunito Sans", fontWeight: 400, fontSize: px(16), lineHeight: 1.3, color: WHITE }}>
            {plan.saladText}
          </div>
        </div>

        {plan.note.trim().length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              width: px(280),
              flexShrink: 0,
              paddingLeft: px(16),
              paddingRight: px(16),
              paddingTop: px(9),
              paddingBottom: px(9),
              borderRadius: px(18),
              background: WHITE,
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: px(11.5),
              lineHeight: 1.3,
              color: BRAND_700,
            }}
          >
            {plan.note}
          </div>
        )}
      </div>
    </div>
  );
}

/** Rendert den Plan als PNG (Buffer). scale 1 = 1600 × 1131, scale 2 = 3200 × 2262. */
export async function renderPlanPng(plan: PlanData, scale = 1, kw?: number): Promise<Buffer> {
  const assets = await loadAssets();
  const res = new ImageResponse(<PlanImage plan={plan} kw={kw} assets={assets} scale={scale} />, {
    width: Math.round(PLAN_WIDTH * scale),
    height: Math.round(PLAN_HEIGHT * scale),
    fonts: assets.fonts,
  });
  return Buffer.from(await res.arrayBuffer());
}
