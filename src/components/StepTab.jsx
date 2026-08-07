import { Check } from "lucide-react";

export default function StepTab({ n, label, active, done, onClick, disabled }) {
  return (
    <button className={`wb-step-btn ${active ? "active" : ""} ${done ? "done" : ""}`} onClick={onClick} disabled={disabled}>
      <span className="num">{done ? <Check size={12} /> : n}</span>
      {label}
    </button>
  );
}
