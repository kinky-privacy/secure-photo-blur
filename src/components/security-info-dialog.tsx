interface Props {
  onClose: () => void
}

const LEVEL_COLOR = {
  max: '#22c55e',
  high: '#f59e0b',
  low: '#b22222',
}

const LEVEL_LABEL = {
  max: 'MAX',
  high: 'HIGH',
  low: 'LOW',
}

const METHODS_INFO = [
  {
    label: 'Mosaic',
    level: 'high' as const,
    simple: 'Scrambles your photo into large blocks, like a puzzle with very few pieces.',
    technical: 'Adaptive block pixelation reduces any face region to ~5×5 effective pixels regardless of image resolution or export scale (block size scales proportionally with the region, minimum 12px). Each block averages all pixel values, destroying spatial detail. However, the regular grid structure is not random, which means sophisticated ML models could theoretically exploit it. Without the noise layer, this is strong but not maximum security.',
    warning: null,
  },
  {
    label: 'Solid black',
    level: 'max' as const,
    simple: 'Covers the area completely in black. There is nothing left underneath — it is gone forever.',
    technical: '100% information destruction. Every pixel is set to R=0, G=0, B=0. This is provably irreversible: no algorithm can recover data that no longer exists. The Fantômas study (PoPETs 2024) found that solid fill was one of the only methods that resisted all ML-based deanonymization attacks.',
    warning: null,
  },
  {
    label: 'Solid average',
    level: 'max' as const,
    simple: 'Replaces the area with one single flat color. There is nothing left underneath — it is gone forever.',
    technical: 'Computes the average R, G, B values across all pixels in the region, then fills the entire region with that single uniform color. Only one color value survives — all spatial information, texture, and shape data is destroyed. Functionally equivalent to solid fill in terms of irreversibility.',
    warning: null,
  },
  {
    label: 'Gaussian blur',
    level: 'low' as const,
    simple: 'Makes the photo look blurry, like looking through foggy glass. But AI tools can reverse this effect.',
    technical: 'The Revelio paper (arXiv:2506.12344, June 2025) demonstrated that Gaussian blur is reversible even at kernel size 81. Diffusion models can reconstruct a person\'s identity from heavily blurred photos if the attacker\'s model has seen other images of that person. The Fantômas study (PoPETs 2024) also listed Gaussian blur among the 10 out of 14 anonymization techniques that are at least partially reversible. Signal uses Gaussian blur and is considered potentially vulnerable.',
    warning: '⚠ Not recommended for sensitive content.',
  },
]

export function SecurityInfoDialog({ onClose }: Props) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog si-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>How blur methods work</h2>
        <p>
          Not all blur methods are equally safe. Some can be reversed by AI tools — others destroy
          information permanently. Here is what each method does.
        </p>

        <div class="si-methods">
          {METHODS_INFO.map((m) => {
            const color = LEVEL_COLOR[m.level]
            return (
              <div key={m.label} class="si-method">
                <div class="si-method-header">
                  <span class="si-dot" style={{ background: color }} />
                  <span class="si-method-label">{m.label}</span>
                  <span class="si-level" style={{ color }}>{LEVEL_LABEL[m.level]}</span>
                </div>
                <p class="si-simple">{m.simple}</p>
                <p class="si-technical">{m.technical}</p>
                {m.warning && <p class="si-method-warning">{m.warning}</p>}
              </div>
            )
          })}
        </div>

        <div class="sep" />

        <div class="si-actions">
          <button class="btn-primary" type="button" onClick={onClose}>Got it</button>
        </div>

        <style>{`
          .si-dialog {
            max-width: 520px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
          }
          .si-methods {
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--sp-md);
            margin-bottom: var(--sp-md);
          }
          .si-method {
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: var(--sp-md);
            background: var(--bg-elevated);
          }
          .si-method-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: var(--sp-sm);
          }
          .si-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .si-method-label {
            font-weight: 600;
            font-size: 14px;
            color: var(--text-primary);
            flex: 1;
          }
          .si-level {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
          }
          .si-simple {
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: var(--sp-sm) !important;
            line-height: 1.5;
          }
          .si-technical {
            font-size: 12px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 0 !important;
          }
          .si-method-warning {
            margin-top: var(--sp-sm);
            font-size: 12px;
            color: var(--accent-light);
            margin-bottom: 0 !important;
          }
          .si-actions {
            display: flex;
            justify-content: flex-end;
          }
        `}</style>
      </div>
    </div>
  )
}
