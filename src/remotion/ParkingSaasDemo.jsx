import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Activity,
  Car,
  CheckCircle2,
  Database,
  MapPinned,
  Navigation,
  RadioTower,
  Route,
  Search,
  Server,
  Smartphone,
} from "lucide-react";
import { getRecommendations } from "../utils/algorithm";

const colors = {
  bg: "#1f201c",
  panel: "rgba(42, 39, 35, 0.78)",
  panelStrong: "rgba(18, 17, 15, 0.82)",
  line: "rgba(255, 255, 255, 0.12)",
  text: "#fff9e8",
  muted: "rgba(255, 249, 232, 0.62)",
  accent: "#ff6845",
  gold: "#c2ba95",
  goldStrong: "#ffb547",
  available: "#615f4e",
  occupied: "#5f3a32",
};

const demoLots = [
  { id: "L1-A1", floor: 1, row: "A", column: 1, jarakLobby: 27, kepadatanPrediksi: 6, isOccupied: true },
  { id: "L1-A2", floor: 1, row: "A", column: 2, jarakLobby: 34, kepadatanPrediksi: 8, isOccupied: false },
  { id: "L1-A3", floor: 1, row: "A", column: 3, jarakLobby: 41, kepadatanPrediksi: 10, isOccupied: true },
  { id: "L1-A4", floor: 1, row: "A", column: 4, jarakLobby: 48, kepadatanPrediksi: 2, isOccupied: false },
  { id: "L1-A5", floor: 1, row: "A", column: 5, jarakLobby: 55, kepadatanPrediksi: 4, isOccupied: false },
  { id: "L1-A6", floor: 1, row: "A", column: 6, jarakLobby: 62, kepadatanPrediksi: 6, isOccupied: true },
  { id: "L1-B1", floor: 1, row: "B", column: 1, jarakLobby: 5, kepadatanPrediksi: 5, isOccupied: false },
  { id: "L1-B2", floor: 1, row: "B", column: 2, jarakLobby: 12, kepadatanPrediksi: 7, isOccupied: true },
  { id: "L1-B3", floor: 1, row: "B", column: 3, jarakLobby: 19, kepadatanPrediksi: 9, isOccupied: false },
  { id: "L1-B4", floor: 1, row: "B", column: 4, jarakLobby: 26, kepadatanPrediksi: 1, isOccupied: false },
  { id: "L1-B5", floor: 1, row: "B", column: 5, jarakLobby: 33, kepadatanPrediksi: 3, isOccupied: true },
  { id: "L1-B6", floor: 1, row: "B", column: 6, jarakLobby: 40, kepadatanPrediksi: 5, isOccupied: false },
  { id: "L2-A1", floor: 2, row: "A", column: 1, jarakLobby: 41, kepadatanPrediksi: 9, isOccupied: false },
  { id: "L2-A2", floor: 2, row: "A", column: 2, jarakLobby: 48, kepadatanPrediksi: 1, isOccupied: true },
  { id: "L2-A3", floor: 2, row: "A", column: 3, jarakLobby: 55, kepadatanPrediksi: 3, isOccupied: true },
  { id: "L2-A4", floor: 2, row: "A", column: 4, jarakLobby: 62, kepadatanPrediksi: 5, isOccupied: false },
  { id: "L2-A5", floor: 2, row: "A", column: 5, jarakLobby: 69, kepadatanPrediksi: 7, isOccupied: false },
  { id: "L2-A6", floor: 2, row: "A", column: 6, jarakLobby: 76, kepadatanPrediksi: 9, isOccupied: true },
  { id: "L2-B1", floor: 2, row: "B", column: 1, jarakLobby: 19, kepadatanPrediksi: 8, isOccupied: true },
  { id: "L2-B2", floor: 2, row: "B", column: 2, jarakLobby: 26, kepadatanPrediksi: 10, isOccupied: false },
  { id: "L2-B3", floor: 2, row: "B", column: 3, jarakLobby: 33, kepadatanPrediksi: 2, isOccupied: false },
  { id: "L2-B4", floor: 2, row: "B", column: 4, jarakLobby: 40, kepadatanPrediksi: 4, isOccupied: true },
  { id: "L2-B5", floor: 2, row: "B", column: 5, jarakLobby: 47, kepadatanPrediksi: 6, isOccupied: false },
  { id: "L2-B6", floor: 2, row: "B", column: 6, jarakLobby: 54, kepadatanPrediksi: 8, isOccupied: false },
];

const recommendations = getRecommendations(demoLots);

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

function fade(frame, start, duration = 24) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function phase(frame, start, end) {
  return clamp(interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
}

function SceneLayer({ children, from, to }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, from + 16, to - 16, to], [0, 1, 1, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
}

function Background() {
  const frame = useCurrentFrame();
  const slowZoom = interpolate(frame, [0, 360], [1.05, 1.15]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: "hidden" }}>
      <Img
        src={staticFile("gedung_itb2_blur.jpg")}
        style={{
          height: "100%",
          objectFit: "cover",
          opacity: 0.28,
          transform: `scale(${slowZoom})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.78)), linear-gradient(180deg, rgba(31,32,28,0.18), rgba(31,32,28,0.92))",
        }}
      />
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          height: 780,
          left: 1030,
          opacity: 0.26,
          position: "absolute",
          top: -240,
          transform: `rotate(${interpolate(frame, [0, 360], [-8, 10])}deg)`,
          width: 780,
        }}
      />
      <div
        style={{
          background: "rgba(255,104,69,0.12)",
          borderRadius: 999,
          filter: "blur(64px)",
          height: 360,
          left: 1180,
          position: "absolute",
          top: 700,
          width: 520,
        }}
      />
    </AbsoluteFill>
  );
}

function Caption({ kicker, title, body, start }) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, start);
  const y = interpolate(opacity, [0, 1], [36, 0]);

  return (
    <div
      style={{
        color: colors.text,
        left: 96,
        opacity,
        position: "absolute",
        top: 92,
        transform: `translateY(${y}px)`,
        width: 650,
      }}
    >
      <div
        style={{
          alignItems: "center",
          color: colors.goldStrong,
          display: "flex",
          fontSize: 22,
          fontWeight: 800,
          gap: 10,
          letterSpacing: 1.8,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            background: colors.accent,
            borderRadius: 999,
            display: "inline-block",
            height: 10,
            width: 10,
          }}
        />
        {kicker}
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 850,
          letterSpacing: 0,
          lineHeight: 0.94,
          marginTop: 22,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: colors.muted,
          fontSize: 29,
          lineHeight: 1.35,
          marginTop: 28,
          maxWidth: 590,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function GlassPanel({ children, style }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03)), rgba(33,31,25,0.72)",
        border: `1px solid ${colors.line}`,
        borderRadius: 28,
        boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, delay = 0 }) {
  const frame = useCurrentFrame();
  const entry = spring({ frame: frame - delay, fps: 30, config: { damping: 18, stiffness: 130 } });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${colors.line}`,
        borderRadius: 18,
        flex: 1,
        minHeight: 132,
        opacity: entry,
        padding: 24,
        transform: `translateY(${(1 - entry) * 28}px)`,
      }}
    >
      <div style={{ alignItems: "center", color: colors.muted, display: "flex", fontSize: 18, gap: 10 }}>
        <Icon size={22} />
        {label}
      </div>
      <div style={{ color: colors.text, fontFamily: "JetBrains Mono, monospace", fontSize: 46, fontWeight: 800, marginTop: 20 }}>
        {value}
      </div>
    </div>
  );
}

function ParkingSlotMini({ lot, rank, revealDelay = 0 }) {
  const frame = useCurrentFrame();
  const entry = spring({ frame: frame - revealDelay, fps: 30, config: { damping: 20, stiffness: 140 } });
  const pulse = rank
    ? interpolate(Math.sin((frame - revealDelay) / 7), [-1, 1], [0.72, 1])
    : 0;
  const statusColor = lot.isOccupied ? colors.occupied : rank ? "#918c70" : colors.available;
  const textColor = lot.isOccupied ? "#f0d4c8" : "#fff9e8";

  return (
    <div
      style={{
        alignItems: "center",
        background: statusColor,
        border: `2px solid ${rank ? colors.gold : lot.isOccupied ? "#8f5a4e" : "#8e8972"}`,
        borderRadius: 9,
        boxShadow: rank ? `0 0 ${16 + pulse * 18}px rgba(255,181,71,0.42)` : "none",
        color: textColor,
        display: "flex",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 19,
        fontWeight: 800,
        height: 58,
        justifyContent: "space-between",
        opacity: entry,
        padding: "0 12px",
        transform: `translateY(${(1 - entry) * 42}px) scale(${0.92 + entry * 0.08})`,
      }}
    >
      <span style={{ alignItems: "center", display: "flex", gap: 7 }}>
        {lot.isOccupied && <Car size={18} />}
        {lot.id}
      </span>
      {rank && (
        <span
          style={{
            background: "#151411",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: 999,
            color: "white",
            display: "grid",
            fontSize: 15,
            height: 28,
            placeItems: "center",
            width: 28,
          }}
        >
          {rank}
        </span>
      )}
    </div>
  );
}

function ParkingGrid({ start = 0, compact = false }) {
  const leftLots = demoLots.filter((lot) => lot.floor === 1 && lot.row === "A");
  const rightLots = demoLots.filter((lot) => lot.floor === 1 && lot.row === "B");
  const recommendationRank = new Map(recommendations.map((lot, index) => [lot.id, index + 1]));

  return (
    <div
      style={{
        display: "grid",
        gap: compact ? 12 : 18,
        gridTemplateColumns: "1fr 118px 1fr 92px",
      }}
    >
      <div style={{ display: "grid", gap: compact ? 10 : 14 }}>
        {leftLots.map((lot, index) => (
          <ParkingSlotMini
            key={lot.id}
            lot={lot}
            rank={recommendationRank.get(lot.id)}
            revealDelay={start + index * 3}
          />
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          background: "rgba(0,0,0,0.22)",
          border: "1px dashed rgba(255,210,148,0.3)",
          borderRadius: 14,
          color: "#ffd8a6",
          display: "flex",
          flexDirection: "column",
          fontSize: 18,
          fontWeight: 800,
          gap: 14,
          justifyContent: "center",
          minHeight: compact ? 400 : 470,
        }}
      >
        <Navigation size={28} />
        Lane
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22 }}>L1</span>
      </div>
      <div style={{ display: "grid", gap: compact ? 10 : 14 }}>
        {rightLots.map((lot, index) => (
          <ParkingSlotMini
            key={lot.id}
            lot={lot}
            rank={recommendationRank.get(lot.id)}
            revealDelay={start + 18 + index * 3}
          />
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          background: "rgba(255,181,71,0.10)",
          border: "2px solid rgba(255,216,166,0.6)",
          borderRadius: 12,
          color: "#ffd8a6",
          display: "flex",
          fontSize: 18,
          fontWeight: 850,
          justifyContent: "center",
          textTransform: "uppercase",
        }}
      >
        Lobby
      </div>
    </div>
  );
}

function DashboardMock() {
  const frame = useCurrentFrame();
  const entry = spring({ frame: frame - 22, fps: 30, config: { damping: 18, stiffness: 100 } });
  const available = demoLots.filter((lot) => !lot.isOccupied).length;

  return (
    <GlassPanel
      style={{
        height: 780,
        opacity: entry,
        padding: 26,
        position: "absolute",
        right: 88,
        top: 156,
        transform: `translateX(${(1 - entry) * 86}px) rotateY(${(1 - entry) * -9}deg)`,
        transformOrigin: "right center",
        width: 1010,
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 18, marginBottom: 22 }}>
        <div style={{ background: colors.accent, borderRadius: 16, display: "grid", height: 58, placeItems: "center", width: 58 }}>
          <MapPinned size={30} />
        </div>
        <div>
          <div style={{ color: colors.text, fontSize: 26, fontWeight: 850 }}>ITB Parking Command Center</div>
          <div style={{ color: colors.muted, fontSize: 17, marginTop: 3 }}>Simulation mode with real-data pathway ready</div>
        </div>
        <div style={{ marginLeft: "auto", alignItems: "center", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(110,231,183,0.35)", borderRadius: 999, color: "#bbf7d0", display: "flex", fontSize: 17, fontWeight: 800, gap: 8, padding: "10px 16px" }}>
          <CheckCircle2 size={20} />
          Online
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
        <KpiCard delay={36} icon={Activity} label="Empty slots" value={`${available}/24`} />
        <KpiCard delay={42} icon={MapPinned} label="Recommended" value={recommendations[0].id} />
        <KpiCard delay={48} icon={Database} label="Data mode" value="Real" />
      </div>
      <GlassPanel style={{ background: "rgba(0,0,0,0.16)", borderRadius: 20, padding: 22 }}>
        <ParkingGrid start={62} />
      </GlassPanel>
    </GlassPanel>
  );
}

function Pipeline() {
  const frame = useCurrentFrame();
  const steps = [
    { label: "Sensor", sub: "Ultrasonic slot state", icon: RadioTower },
    { label: "MQTT", sub: "HiveMQ broker", icon: Activity },
    { label: "Queue", sub: "CloudAMQP worker", icon: Server },
    { label: "Supabase", sub: "Realtime table", icon: Database },
    { label: "Dashboard", sub: "Live parking view", icon: MapPinned },
  ];

  return (
    <div style={{ bottom: 116, display: "flex", gap: 18, left: 96, position: "absolute", width: 1220 }}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const entry = spring({ frame: frame - 130 - index * 8, fps: 30, config: { damping: 18, stiffness: 120 } });
        return (
          <GlassPanel
            key={step.label}
            style={{
              flex: 1,
              minHeight: 178,
              opacity: entry,
              padding: 22,
              transform: `translateY(${(1 - entry) * 42}px)`,
            }}
          >
            <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
              <div style={{ background: index === 3 ? colors.accent : "rgba(255,255,255,0.08)", border: `1px solid ${colors.line}`, borderRadius: 14, display: "grid", height: 50, placeItems: "center", width: 50 }}>
                <Icon size={25} />
              </div>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 850 }}>{step.label}</div>
            </div>
            <div style={{ color: colors.muted, fontSize: 16, lineHeight: 1.35, marginTop: 16 }}>{step.sub}</div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

function RecommendationStack() {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", right: 120, top: 170, width: 680 }}>
      {recommendations.map((lot, index) => {
        const entry = spring({ frame: frame - 202 - index * 12, fps: 30, config: { damping: 17, stiffness: 130 } });
        const xOffset = index * 54;
        const yOffset = index * 82;
        return (
          <GlassPanel
            key={lot.id}
            style={{
              height: 190,
              opacity: entry,
              padding: 26,
              position: "absolute",
              top: yOffset,
              transform: `translateX(${(1 - entry) * 180 + xOffset}px) rotateZ(${(index - 1) * 2.5}deg)`,
              width: 590,
              zIndex: recommendations.length - index,
            }}
          >
            <div style={{ alignItems: "center", display: "flex", gap: 22 }}>
              <div style={{ background: "linear-gradient(135deg,#d8cfaa,#918c70)", borderRadius: 20, color: "#1f201c", display: "grid", fontFamily: "JetBrains Mono, monospace", fontSize: 34, fontWeight: 900, height: 88, placeItems: "center", width: 118 }}>
                {lot.id}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.goldStrong, fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>Rank {index + 1}</div>
                <div style={{ color: colors.text, fontSize: 29, fontWeight: 850, marginTop: 6 }}>Nearest available slot</div>
                <div style={{ color: colors.muted, fontSize: 18, marginTop: 10 }}>
                  {lot.jarakLobby}m to lobby, density {lot.kepadatanPrediksi}/10
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

function RoutePreview() {
  const frame = useCurrentFrame();
  const draw = phase(frame, 276, 314);
  const carMove = interpolate(draw, [0, 1], [0, 500]);

  return (
    <GlassPanel style={{ bottom: 110, height: 392, left: 95, padding: 28, position: "absolute", width: 790 }}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: colors.text, fontSize: 31, fontWeight: 850 }}>Route to parked car</div>
          <div style={{ color: colors.muted, fontSize: 18, marginTop: 8 }}>After parking, the map becomes a return guide.</div>
        </div>
        <div style={{ alignItems: "center", background: "rgba(255,181,71,0.12)", border: "1px solid rgba(255,181,71,0.32)", borderRadius: 999, color: "#ffd8a6", display: "flex", fontSize: 18, fontWeight: 800, gap: 8, padding: "12px 18px" }}>
          <Route size={22} />
          Pedestrian route
        </div>
      </div>
      <div style={{ height: 230, marginTop: 34, position: "relative" }}>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, height: 88, left: 0, position: "absolute", top: 72, width: 660 }} />
        <div style={{ background: "#ffd8a6", borderRadius: 999, height: 8, left: 74, position: "absolute", top: 112, transform: `scaleX(${draw})`, transformOrigin: "left center", width: 520 }} />
        <div style={{ background: colors.accent, borderRadius: 18, color: "white", display: "grid", fontWeight: 850, height: 72, left: 42, placeItems: "center", position: "absolute", top: 40, width: 96 }}>Lobby</div>
        <div style={{ background: colors.gold, borderRadius: 18, color: "#1f201c", display: "grid", fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 900, height: 72, left: 560, placeItems: "center", position: "absolute", top: 132, width: 112 }}>L1-B1</div>
        <div style={{ color: "#fff", left: 90 + carMove, position: "absolute", top: 89, transform: "translate(-50%, -50%)" }}>
          <Car size={46} />
        </div>
      </div>
    </GlassPanel>
  );
}

function PhoneMock() {
  const frame = useCurrentFrame();
  const entry = spring({ frame: frame - 270, fps: 30, config: { damping: 16, stiffness: 100 } });

  return (
    <div
      style={{
        background: "#12110f",
        border: "8px solid rgba(255,255,255,0.16)",
        borderRadius: 48,
        boxShadow: "0 38px 90px rgba(0,0,0,0.42)",
        height: 690,
        opacity: entry,
        padding: 24,
        position: "absolute",
        right: 170,
        top: 180,
        transform: `translateY(${(1 - entry) * 80}px) rotateZ(${(1 - entry) * 5}deg)`,
        width: 360,
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
        <div style={{ background: colors.accent, borderRadius: 14, display: "grid", height: 44, placeItems: "center", width: 44 }}>
          <Smartphone size={24} />
        </div>
        <div>
          <div style={{ color: colors.text, fontSize: 20, fontWeight: 850 }}>Smart Parking</div>
          <div style={{ color: colors.muted, fontSize: 12 }}>ITB Main Entrance</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 28 }}>
        <KpiCard delay={256} icon={Activity} label="Empty" value="14/24" />
        <KpiCard delay={262} icon={MapPinned} label="Best" value="L1-B1" />
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${colors.line}`, borderRadius: 22, marginTop: 18, padding: 16 }}>
        <div style={{ alignItems: "center", color: colors.muted, display: "flex", fontSize: 14, fontWeight: 800, gap: 8, textTransform: "uppercase" }}>
          <Search size={16} />
          Recommended spots
        </div>
        {recommendations.map((lot, index) => (
          <div
            key={lot.id}
            style={{
              alignItems: "center",
              background: index === 0 ? "rgba(194,186,149,0.22)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${index === 0 ? "rgba(194,186,149,0.42)" : colors.line}`,
              borderRadius: 16,
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              padding: 14,
            }}
          >
            <div>
              <div style={{ color: colors.text, fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 900 }}>{lot.id}</div>
              <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{lot.jarakLobby}m to lobby</div>
            </div>
            <div style={{ background: "#151411", borderRadius: 999, color: "white", display: "grid", fontSize: 13, fontWeight: 900, height: 30, placeItems: "center", width: 30 }}>{index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalCard() {
  const frame = useCurrentFrame();
  const entry = spring({ frame: frame - 324, fps: 30, config: { damping: 18, stiffness: 120 } });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        opacity: entry,
        transform: `scale(${0.94 + entry * 0.06})`,
      }}
    >
      <GlassPanel style={{ padding: 54, textAlign: "center", width: 980 }}>
        <div style={{ color: colors.goldStrong, fontSize: 24, fontWeight: 900, letterSpacing: 1.8, textTransform: "uppercase" }}>Smart Parking Dashboard</div>
        <div style={{ color: colors.text, fontSize: 76, fontWeight: 900, letterSpacing: 0, lineHeight: 0.98, marginTop: 22 }}>
          Find the closest empty slot before drivers enter.
        </div>
        <div style={{ color: colors.muted, fontSize: 27, lineHeight: 1.35, margin: "28px auto 0", maxWidth: 760 }}>
          Live sensor data, ranked recommendations, and route guidance in one web dashboard.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 42 }}>
          <KpiCard delay={324} icon={Database} label="Realtime" value="Supabase" />
          <KpiCard delay={330} icon={MapPinned} label="Layout" value="2 floors" />
          <KpiCard delay={336} icon={Route} label="Driver flow" value="Route" />
        </div>
      </GlassPanel>
    </div>
  );
}

export function ParkingSaasDemo() {
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <Background />

      <SceneLayer from={0} to={120}>
        <Caption
          body="A web dashboard for live slot status, recommended parking, and faster entry decisions."
          kicker="Product demo"
          start={6}
          title="Smart Parking Dashboard"
        />
        <DashboardMock />
      </SceneLayer>

      <SceneLayer from={120} to={190}>
        <Caption
          body="Hardware and workers update Supabase, while the dashboard reads the current building state in realtime."
          kicker="Realtime data flow"
          start={124}
          title="Sensors to dashboard"
        />
        <Pipeline />
      </SceneLayer>

      <SceneLayer from={190} to={260}>
        <Caption
          body="Recommendations rank open slots by lobby distance, floor, and predicted density before the driver chooses."
          kicker="Decision engine"
          start={194}
          title="Best slot, instantly"
        />
        <RecommendationStack />
      </SceneLayer>

      <SceneLayer from={260} to={322}>
        <Caption
          body="The same product flow works on mobile: pick a slot, confirm parking, and return with route guidance."
          kicker="Driver experience"
          start={264}
          title="Park, then find your car"
        />
        <RoutePreview />
        <PhoneMock />
      </SceneLayer>

      <SceneLayer from={322} to={360}>
        <FinalCard />
      </SceneLayer>
    </AbsoluteFill>
  );
}
