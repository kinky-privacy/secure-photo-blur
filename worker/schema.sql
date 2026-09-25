-- Anonymous daily counters written by worker/index.ts.
-- No IPs, no user agents, no identifiers: each dimension is a separate counter and
-- dimensions are never crossed, so no row can describe a single visit.
CREATE TABLE IF NOT EXISTS counts (
  day   TEXT    NOT NULL, -- YYYY-MM-DD, UTC
  event TEXT    NOT NULL, -- landing | photo | feedback
  kind  TEXT    NOT NULL, -- human | vpn | bot ('-' for feedback)
  dim   TEXT    NOT NULL, -- total | country | device | source | answer
  value TEXT    NOT NULL,
  n     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event, kind, dim, value)
) WITHOUT ROWID;
