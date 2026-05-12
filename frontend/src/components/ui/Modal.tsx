import type { ReactNode } from "react";
import { IconX } from "../icons/index.js";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-md)",
          borderRadius: "var(--radius-lg)",
          width: 460, padding: 20,
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-3)", display: "flex", padding: 4, borderRadius: "var(--radius)",
          }}>
            <IconX size={14}/>
          </button>
        </div>

        {children}

        {footer && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable form primitives used inside modals */
export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      background: "var(--bg-3)", border: "1px solid var(--border-md)",
      borderRadius: "var(--radius)", padding: "7px 10px",
      fontSize: 13, color: "var(--text-1)", fontFamily: "var(--font)",
      outline: "none", width: "100%",
      ...props.style,
    }}/>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{
      background: "var(--bg-3)", border: "1px solid var(--border-md)",
      borderRadius: "var(--radius)", padding: "7px 10px",
      fontSize: 13, color: "var(--text-1)", fontFamily: "var(--font)",
      outline: "none", width: "100%", resize: "vertical",
      ...props.style,
    }}/>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{
      background: "var(--bg-3)", border: "1px solid var(--border-md)",
      borderRadius: "var(--radius)", padding: "7px 10px",
      fontSize: 13, color: "var(--text-1)", fontFamily: "var(--font)",
      outline: "none", width: "100%",
      ...props.style,
    }}/>
  );
}