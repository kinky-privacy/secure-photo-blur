interface Props {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

export function BrushSizeSlider({ value, onChange, min = 10, max = 120 }: Props) {
  return (
    <div class="brush-slider">
      <span class="brush-slider-label">Size</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onInput={(e) => onChange(parseInt((e.target as HTMLInputElement).value))}
        class="brush-slider-input"
      />
      <span class="brush-slider-value">{value}</span>
      <style>{`
        .brush-slider {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: var(--sp-sm) var(--sp-md);
        }
        .brush-slider-label {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .brush-slider-value {
          font-size: 12px;
          color: var(--text-secondary);
          width: 28px;
          text-align: right;
        }
        .brush-slider-input {
          flex: 1;
          appearance: none;
          -webkit-appearance: none;
          height: 3px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          min-width: 0;
        }
        .brush-slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
        }
        .brush-slider-input::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
