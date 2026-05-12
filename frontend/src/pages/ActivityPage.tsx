import { IconCheck, IconZap, IconPlus, IconCircle } from "../components/icons/index.js";
import { Panel } from "../components/ui/Panel.js";

// Later you'll replace this with a real API call to your /events endpoint
const PLACEHOLDER_EVENTS = [
  { id: "1", icon: "check",  color: "var(--green)",    text: "No live events yet — start an agent run to see activity here.", time: "now" },
];

export function ActivityPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Activity log
        </span>
      </div>

      <Panel>
        {PLACEHOLDER_EVENTS.map((ev) => (
          <div key={ev.id} style={{
            display: "flex", gap: 10,
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--bg-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1, color: ev.color,
            }}>
              {ev.icon === "check"  && <IconCheck  size={10}/>}
              {ev.icon === "zap"    && <IconZap    size={10}/>}
              {ev.icon === "plus"   && <IconPlus   size={10}/>}
              {ev.icon === "circle" && <IconCircle size={10}/>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-2)" }}>{ev.text}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{ev.time}</div>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}