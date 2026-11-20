import { useState } from "react";

/** Lista de palavras: Enter ou vírgula adiciona, Backspace no campo vazio remove a última. */
export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");

  const add = (raw: string) => {
    const items = raw.split(",").map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setText("");
  };

  return (
    <div className="tags">
      {value.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
          <button type="button" aria-label={`Remover ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>×</button>
        </span>
      ))}
      <input
        value={text}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(text);
          } else if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => text && add(text)}
      />
    </div>
  );
}
