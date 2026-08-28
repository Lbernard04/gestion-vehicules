:root {
  --bg: #12161d;
  --surface: #1a202b;
  --surface-alt: #212938;
  --surface-hover: #262f40;
  --border: #2b3342;
  --border-strong: #3b4557;
  --text: #edf0f5;
  --text-muted: #98a2b6;
  --text-faint: #626d80;

  --accent: #f2a93b;
  --accent-strong: #ffc266;
  --accent-ink: #2c1a02;

  --positive: #45c98e;
  --positive-ink: #06301e;
  --danger: #ef6161;
  --danger-ink: #3a0d0d;

  --radius-lg: 14px;
  --radius: 10px;
  --radius-sm: 7px;
  --shadow-card: 0 1px 0 rgba(255, 255, 255, 0.02) inset, 0 8px 24px rgba(0, 0, 0, 0.28);
  --shadow-pop: 0 20px 60px rgba(0, 0, 0, 0.5);

  --font-display: var(--font-space-grotesk), 'Segoe UI', sans-serif;
  --font-body: var(--font-inter), 'Segoe UI', sans-serif;
  --font-mono: var(--font-jetbrains-mono), 'Courier New', monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
}

body {
  background: var(--bg);
  background-image: radial-gradient(circle at 12% -10%, rgba(242, 169, 59, 0.08), transparent 42%);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  letter-spacing: -0.01em;
  margin: 0;
}

.plate {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.tabular {
  font-variant-numeric: tabular-nums;
}

/* ---------- Layout ---------- */

.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 24px 64px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

/* ---------- Nav ---------- */

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(18, 22, 29, 0.86);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.topbar-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  white-space: nowrap;
}

.brand-mark {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(242, 169, 59, 0.16);
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.nav-link.active {
  background: var(--surface-alt);
  color: var(--accent-strong);
}

/* ---------- Cards / surfaces ---------- */

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.card-pad {
  padding: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
}

.stat-label {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
}

.stat-value.accent {
  color: var(--accent-strong);
}

.stat-value.positive {
  color: var(--positive);
}

/* ---------- Buttons ---------- */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface-alt);
  color: var(--text);
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.05s;
}

.btn:hover {
  background: var(--surface-hover);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}

.btn-danger {
  background: transparent;
  border-color: var(--border-strong);
  color: var(--danger);
}

.btn-danger:hover {
  background: rgba(239, 97, 97, 0.1);
  border-color: var(--danger);
}

.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-muted);
}

.btn-ghost:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.btn-sm {
  padding: 5px 10px;
  font-size: 13px;
}

/* ---------- Forms ---------- */

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.field input,
.field select,
.field textarea {
  background: var(--bg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(242, 169, 59, 0.16);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
}

.checkbox-row input {
  width: 16px;
  height: 16px;
}

.form-error {
  background: rgba(239, 97, 97, 0.12);
  border: 1px solid rgba(239, 97, 97, 0.35);
  color: #ffb4b4;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  margin-bottom: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

/* ---------- Table ---------- */

.table-wrap {
  overflow-x: auto;
}

table.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  color: var(--text-faint);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: var(--surface-alt);
}

.row-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

/* ---------- Badges / status ---------- */

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge.status-available {
  background: rgba(69, 201, 142, 0.14);
  color: var(--positive);
}
.badge.status-available .badge-dot {
  background: var(--positive);
  box-shadow: 0 0 0 3px rgba(69, 201, 142, 0.18);
}

.badge.status-busy {
  background: rgba(242, 169, 59, 0.14);
  color: var(--accent-strong);
}
.badge.status-busy .badge-dot {
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(242, 169, 59, 0.18);
}

.badge.status-inactive {
  background: rgba(154, 163, 178, 0.12);
  color: var(--text-faint);
}
.badge.status-inactive .badge-dot {
  background: var(--text-faint);
}

/* ---------- Empty / loading states ---------- */

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
}

.empty-state-title {
  font-family: var(--font-display);
  color: var(--text);
  font-size: 16px;
  margin-bottom: 6px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: var(--text-faint);
  font-size: 14px;
}

/* ---------- Modal ---------- */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 8, 12, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 16px 16px;
  z-index: 100;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-pop);
  width: 100%;
  max-width: 480px;
  padding: 22px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
}

/* ---------- Planning (vue calendrier) ---------- */

.planning-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.planning-week-label {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
}

.planning-nav {
  display: flex;
  gap: 6px;
}

.planning-grid {
  display: grid;
  grid-template-columns: 160px repeat(7, minmax(120px, 1fr));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.planning-cell {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 8px;
  min-height: 76px;
}

.planning-grid > .planning-cell:nth-child(8n) {
  border-right: none;
}

.planning-head-cell {
  background: var(--surface-alt);
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-muted);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.planning-head-cell.today {
  color: var(--accent-strong);
}

.planning-vehicle-cell {
  background: var(--surface-alt);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
}

.planning-vehicle-name {
  font-size: 13px;
  font-weight: 600;
}

.planning-vehicle-plate {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
}

.planning-chip {
  display: block;
  width: 100%;
  text-align: left;
  background: rgba(242, 169, 59, 0.14);
  border: 1px solid rgba(242, 169, 59, 0.3);
  color: var(--accent-strong);
  border-radius: var(--radius-sm);
  padding: 4px 7px;
  font-size: 11.5px;
  margin-bottom: 4px;
  cursor: pointer;
  line-height: 1.35;
}

.planning-chip:hover {
  background: rgba(242, 169, 59, 0.22);
}

.planning-chip strong {
  display: block;
  color: var(--text);
  font-size: 12px;
}

/* ---------- Responsive ---------- */

@media (max-width: 720px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .topbar-inner {
    flex-wrap: wrap;
    gap: 10px;
  }

  .planning-grid {
    grid-template-columns: 130px repeat(7, minmax(96px, 1fr));
  }

  .stat-value {
    font-size: 26px;
  }
}
