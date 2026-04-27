# FetLife — Style Guide & Design Reference

Estratto da ispezione visiva delle pagine: Home, Esplora, Gruppi, Eventi.

---

## 1. Palette Colori

| Token           | Valore hex      | Utilizzo                                      |
|-----------------|-----------------|-----------------------------------------------|
| `bg-base`       | `#1a1a1a`       | Background generale della pagina              |
| `bg-surface`    | `#242424`       | Card, panel, sidebar                          |
| `bg-elevated`   | `#2e2e2e`       | Dropdown, tooltip, hover state                |
| `accent`        | `#b22222`       | Colore primario brand (rosso scuro/cremisi)   |
| `accent-dark`   | `#8b0000`       | Hover su bottoni primary, bordi attivi        |
| `accent-light`  | `#cc3333`       | Badge, counter, label evidenziata             |
| `text-primary`  | `#f0f0f0`       | Testo principale                              |
| `text-secondary`| `#aaaaaa`       | Testo secondario, metadata, timestamp         |
| `text-muted`    | `#666666`       | Placeholder, testo disabilitato               |
| `border`        | `#333333`       | Bordi di card, separatori                     |
| `border-subtle` | `#2a2a2a`       | Bordi molto sottili, divisori interni         |
| `link`          | `#f0f0f0`       | Link (bianco/near-white, underline on hover)  |
| `link-accent`   | `#cc4444`       | Link in evidenza (titoli post/evento)         |

### Colori semantici

| Token              | Valore hex      | Utilizzo                                      |
|--------------------|-----------------|-----------------------------------------------|
| `color-success`    | `#22c55e`       | Stato sicuro (security level max, badge verdi) |
| `color-warning`    | `#f59e0b`       | Stato attenzione (security level high, ambra)  |
| `color-error`      | `#dc2626`       | Azione distruttiva (delete, anonymize button)  |
| `color-error-dark` | `#b91c1c`       | Hover su bottoni error                         |
| `color-info`       | `#63b3ed`       | Regioni custom, bordi informativi (blu)        |
| `color-face`       | `#ff3333`       | Colore regioni viso in SVG overlay             |

---

## 2. Tipografia

### Font families
- **Heading / Display**: Font serif — `Georgia, "Times New Roman", serif`
- **Body / UI**: Font sans-serif — `"Helvetica Neue", Arial, sans-serif`

### Scala tipografica

| Ruolo               | Font    | Size  | Weight | Style   |
|---------------------|---------|-------|--------|---------|
| Hero headline       | Serif   | 48px  | 700    | normale |
| Hero italic word    | Serif   | 48px  | 400    | italic  |
| Titolo sezione      | Sans    | 18px  | 600    | normale |
| Titolo card/post    | Sans    | 15px  | 700    | normale |
| Titolo link (rosso) | Sans    | 15px  | 600    | normale |
| Body text           | Sans    | 14px  | 400    | normale |
| Metadata / timestamp| Sans    | 12px  | 400    | normale |
| Label categoria     | Sans    | 11px  | 500    | uppercase |
| Counter badge       | Sans    | 11px  | 700    | normale |

### Variabili font-size (CSS custom properties)

| Token      | Valore | Utilizzo                                  |
|------------|--------|-------------------------------------------|
| `--fs-xs`  | `10px` | Label categoria, level badge              |
| `--fs-sm`  | `11px` | Badge compact, counter, shape label       |
| `--fs-base`| `12px` | Metadata, timestamp, details tecnici      |
| `--fs-md`  | `13px` | Testo warning, loading, reassurance       |
| `--fs-lg`  | `14px` | Body text, titoli card, label regioni     |
| `--fs-xl`  | `15px` | Tagline, label drop-zone, icona warning   |
| `--fs-2xl` | `16px` | Titoli modali, drop overlay               |
| `--fs-3xl` | `18px` | Titoli sezione                            |

---

## 3. Layout & Grid

### Struttura generale
```
┌─────────────────────────────────────────────────────┐
│                   TOPNAV (50px)                      │
├──────────┬──────────────────────────┬───────────────┤
│ SIDEBAR  │      MAIN CONTENT        │  SIDEBAR RIGHT│
│ ~220px   │      flex / grow         │   ~220px      │
└──────────┴──────────────────────────┴───────────────┘
```

- Max-width container: ~`1000px`, centrato con `margin: auto`
- Gutter: `16px` laterali
- Gap tra colonne: `20px`
- Layout mobile: colonne collassano in stack verticale

### Topnav
- Altezza: `50px`
- Background: `#1a1a1a`
- Border-bottom: `1px solid #333`
- Logo: icon SVG (silhouette gatto/animale), `~28px`, bianco
- Search bar: `width: ~180px`, `background: #2a2a2a`, `border-radius: 4px`, placeholder grigio
- Nav items: testo uppercase piccolo, spacing `16px` tra voci
- Icone destra: `+`, messaggi, profilo, notifiche, avatar — dimensione `20px`

---

## 4. Componenti

### Bottoni

```
Primary:
  background: #b22222
  color: #fff
  border: none
  border-radius: 4px
  padding: 10px 18px
  font-weight: 600
  hover: background #8b0000

Secondary / Ghost:
  background: transparent
  color: #f0f0f0
  border: 1px solid #555
  border-radius: 4px
  padding: 10px 18px
  hover: border-color #888
```

### Card / Feed Item
- Background: `#242424`
- Border: `1px solid #333`
- Border-radius: `4px`
- Padding: `16px`
- Avatar: `40px`, `border-radius: 50%`
- Titolo in rosso (`#cc4444`), hover underline
- Metadata (autore, data): `12px`, colore `#aaa`

### Sidebar sinistra
- Sezioni: etichette uppercase `11px`, colore `#666`
- Voci: `14px`, colore `#f0f0f0`
- Voce attiva: bordo sinistro `3px solid #b22222`, testo bianco
- Hover: background `#2e2e2e`

### Tab / Sottomenu
- Indicatore attivo: bordo inferiore `2px solid #b22222`
- Colore testo attivo: `#f0f0f0`
- Colore testo inattivo: `#aaa`

### Badge / Counter
- Background: `#b22222`
- Color: `#fff`
- Border-radius: `50%` o `pill (999px)`
- Min-width: `20px`, altezza `20px`
- Font: `11px bold`

### Evento card (lista)
```
Layout orizzontale:
  [DATE BADGE] [CATEGORY TAG] [TITOLO] [METADATA] [...] [PARTECIPANTI]

Date badge:
  posizione sinistra
  "GIO 13 APR" — giorno grande bold, mese piccolo

Category tag:
  colore accent su sfondo trasparente, uppercase 10px

Titolo:
  link rosso, 15px bold

Metadata:
  icone + testo grigio 12px (orario, luogo, partecipanti)

Azioni:
  "Parteciperò" / "Interessato" — bottone ghost piccolo
```

### Gruppo list item
- Bordo sinistro colorato (accent) per gruppo attivo/con notifiche
- Nome gruppo: `14px`, bold
- Badge "N New": pill accent rosso

### Input / Search
```
background: #2a2a2a
border: 1px solid #3a3a3a
border-radius: 4px
color: #f0f0f0
placeholder-color: #666
padding: 8px 12px
font-size: 14px
focus: border-color #b22222, outline none
```

---

## 5. Iconografia

- Stile: outline lineare, peso sottile
- Dimensioni comuni: `16px`, `20px`, `24px`
- Colore di default: `#aaa`
- Colore attivo/hover: `#f0f0f0`
- Icone usate: cerca, +, busta (messaggi), campanella (notifiche), utente, impostazioni, cuoricino, commento, condividi, punti (…)

---

## 6. Spaziatura

| Token   | Valore |
|---------|--------|
| `xs`    | `4px`  |
| `sm`    | `8px`  |
| `md`    | `16px` |
| `lg`    | `24px` |
| `xl`    | `32px` |
| `2xl`   | `48px` |

---

## 7. Bordi & Ombre

- `border-radius` sm: `3px` (`--radius-sm`) — slider track, bottoni piccoli
- `border-radius` generico: `4px` (`--radius`)
- `border-radius` lg: `6px` (`--radius-lg`) — thumbnail, hint box
- `border-radius` avatar/immagini: `50%`
- `border-radius` pill (badge): `999px`
- Ombre: **assenti** — il design usa esclusivamente contrasto di colore tra livelli di grigio scuro
- Separatori: `1px solid #333`

---

## 8. Tono visivo generale

- **Dark-only** — nessun tema chiaro
- **Minimalista e denso** — poco whitespace, contenuto compatto
- **Rosso come unico accento** — tutto il resto è scala di grigi scuri
- **Serif per i titoli hero** — conferisce un'atmosfera editoriale/letteraria
- **Zero decorazioni** — no gradienti, no ombre elaborate, no illustrazioni UI
- **Feed-centrico** — l'attenzione è tutta sul contenuto degli utenti (testo, immagini)

---

## 9. Pagine principali identificate

| Pagina    | URL               | Note                                              |
|-----------|-------------------|---------------------------------------------------|
| Home      | `/home`           | Feed attività 3 colonne, composer in cima         |
| Esplora   | `/explore`        | Grid masonry di post/immagini con testo           |
| Gruppi    | `/groups`         | Lista gruppi propri + thread discussioni          |
| Eventi    | `/events/near`    | Lista cronologica con filtri e mini calendario    |
| Profilo   | `/users/:id`      | Avatar grande, bio, tab (post/immagini/video)     |

---

## 10. Checklist per replicare il look

- [ ] Sfondo `#1a1a1a`, superfici `#242424`
- [ ] Font serif per titoli hero, sans-serif per tutto il resto
- [ ] Accento unico rosso `#b22222` — bottoni, link titoli, bordi attivi, badge
- [ ] Colori semantici: success `#22c55e`, warning `#f59e0b`, error `#dc2626`, info `#63b3ed`
- [ ] Scala font-size con variabili CSS `--fs-xs` … `--fs-3xl`
- [ ] Border-radius scala: sm `3px`, default `4px`, lg `6px`, pill `999px`
- [ ] Topnav fisso scuro con search + icone
- [ ] Layout 3 colonne (sidebar sinistra, feed centrale, sidebar destra)
- [ ] Card feed: avatar + username + azione + timestamp + contenuto
- [ ] Sidebar sinistra: sezioni collassabili con bordo sinistro rosso sull'attivo
- [ ] Tab con underline rosso sull'attivo
- [ ] Input dark con focus rosso
- [ ] Badge/counter pill rosso
- [ ] Nessuna ombra, nessun gradiente
