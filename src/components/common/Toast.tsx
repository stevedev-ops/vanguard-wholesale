import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { usePos } from "../../context/PosContext";

export const Toast: React.FC = () => {
  const { toasts, removeToast } = usePos();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container no-print">
      {toasts.map((t) => {
        let icon = <Info size={18} color="var(--accent-primary)" />;
        if (t.type === "success") icon = <CheckCircle2 size={18} color="var(--color-success)" />;
        else if (t.type === "error") icon = <AlertCircle size={18} color="var(--color-danger)" />;
        else if (t.type === "warning") icon = <AlertTriangle size={18} color="var(--color-warning)" />;

        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icon}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
