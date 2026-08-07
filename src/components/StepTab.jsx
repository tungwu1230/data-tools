export default function StepTab({ n, label, active, done, onClick, disabled }) {
  return (
    <button className={`wb-step-btn ${active ? "active" : ""} ${done ? "done" : ""}`} onClick={onClick} disabled={disabled}>
      <span className="num">{done ? "✓" : n}</span>
      {label}
    </button>
  );
}
