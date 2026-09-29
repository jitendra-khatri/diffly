import { compareText } from "./lib/diff.js?v=2";
import { readSessionContent, writeSessionContent } from "./lib/session.js?v=1";

const icon = (paths) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const icons = {
  lock: icon('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/>'),
  swap: icon('<path d="M7 7h11l-3-3"/><path d="m18 7-3 3"/><path d="M17 17H6l3 3"/><path d="m6 17 3-3"/>'),
  trash: icon('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/><path d="M10 11v5M14 11v5"/>'),
  compare: icon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>'),
  pencil: icon('<path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z"/><path d="m14.5 7.1 2.8 2.8"/>'),
  close: icon('<path d="m6 6 12 12M18 6 6 18"/>'),
  previous: icon('<path d="m6 14 6-6 6 6"/>'),
  next: icon('<path d="m6 10 6 6 6-6"/>'),
};

const originalSample = `Our product helps teams work together more effectively.
It was built with a focus on simplicity and speed.
You can edit your documents in real time, see changes
instantly, and stay in sync.

We believe great software should be easy to use,
privacy-friendly, and reliable.
That’s why we designed Diffly for everyone.

Try it today and see the difference.`;

const revisedSample = `Our product helps teams work together more effectively.
It’s designed to be simple, fast, and reliable.
You can edit your documents in real time, see changes
instantly, and stay in sync across all your devices.

We believe great software should be easy to use,
privacy-friendly, and secure.
That’s why millions of people choose Diffly.

Try it today and see the difference.`;

const initialContent = readSessionContent(window.sessionStorage, {
  original: originalSample,
  revised: revisedSample,
});

const state = {
  original: initialContent.original,
  revised: initialContent.revised,
  options: {
    mode: "words",
    ignoreCase: false,
    trimWhitespace: false,
    syncHorizontalScroll: true,
  },
  showResults: true,
};

document.querySelector("#root").innerHTML = `
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="Diffly home">
        <img class="brand-logo" src="/diffly-logo.png" width="510" height="168" alt="Diffly" />
      </a>
      <div class="header-meta">
        <span class="privacy-note">${icons.lock}Your text never leaves this browser</span>
        <span class="header-divider" aria-hidden="true"></span>
        <button class="help-link" id="help-button" type="button">How it works</button>
      </div>
    </header>
    <main id="top">
      <div class="intro">
        <h1>See every change. Instantly.</h1>
        <p>Paste two versions, compare them side by side, and spot every edit.</p>
      </div>
      <section class="workspace" aria-label="Text comparison workspace">
        <div class="toolbar" aria-label="Comparison controls">
          <div class="toolbar-options">
            <div class="segmented" aria-label="Comparison granularity">
              <button id="words-mode" class="active" type="button" aria-pressed="true">Words</button>
              <button id="lines-mode" type="button" aria-pressed="false">Lines</button>
            </div>
            <span class="toolbar-divider" aria-hidden="true"></span>
            <label class="check-control">
              <input id="ignore-case" type="checkbox"/><span aria-hidden="true"></span>Ignore case
            </label>
            <label class="check-control">
              <input id="trim-whitespace" type="checkbox"/><span aria-hidden="true"></span>Trim whitespace
            </label>
            <label class="check-control">
              <input id="sync-horizontal-scroll" type="checkbox" checked/><span aria-hidden="true"></span>Scroll Panes Together
            </label>
          </div>
          <div class="toolbar-actions">
            <button class="button secondary" id="swap-button" type="button">${icons.swap}Swap</button>
            <button class="button secondary" id="clear-button" type="button">${icons.trash}Clear</button>
            <button class="button primary" id="compare-button" type="button">${icons.compare}Compare</button>
          </div>
        </div>
        <nav class="change-navigator" id="change-navigator" aria-label="Navigate text changes" hidden></nav>
        <div class="pane-grid" id="pane-grid"></div>
        <footer class="status-rail" aria-live="polite">
          <div class="summary" id="summary" aria-label="Comparison summary"></div>
          <span class="local-status">Compared locally in your browser</span>
        </footer>
      </section>
      <section class="seo-content" aria-labelledby="about-diffly">
        <div class="seo-intro">
          <h2 id="about-diffly">Free online text comparison</h2>
          <p>Diffly is a fast online diff checker for comparing two versions of text. Paste an original and a revised version to highlight additions, removals, and edits side by side.</p>
        </div>
        <div class="seo-details">
          <article>
            <h3>Compare words or lines</h3>
            <p>Use word comparison for precise edits or switch to line comparison when reviewing larger documents, code snippets, drafts, and revisions.</p>
          </article>
          <article>
            <h3>Keep comparisons private</h3>
            <p>Your text is processed locally in your browser. It is never uploaded to Diffly, and session content is cleared when you close the tab.</p>
          </article>
          <article>
            <h3>Review changes faster</h3>
            <p>Clear red and green highlighting makes removed and added content easy to identify. You can also ignore letter case or normalize whitespace.</p>
          </article>
        </div>
        <div class="seo-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Text comparison questions</h2>
          <details>
            <summary>Is Diffly free to use?</summary>
            <p>Yes. Diffly is a free online text comparison tool and does not require an account.</p>
          </details>
          <details>
            <summary>Does Diffly store the text I compare?</summary>
            <p>No server stores your text. Content is kept only in session storage for the current browser tab so it survives a refresh, then it is cleared when the tab closes.</p>
          </details>
          <details>
            <summary>Can I compare text by words and by lines?</summary>
            <p>Yes. Choose Words for detailed edits or Lines for a broader comparison of changed, added, and removed lines.</p>
          </details>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <p><strong>Diffly</strong> — a private text comparison tool that runs in your browser.</p>
      <a href="#top">Back to comparator</a>
    </footer>
    <div class="modal-backdrop" id="help-modal" role="presentation" hidden>
      <section class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <button class="dialog-close" id="close-help" type="button" aria-label="Close">${icons.close}</button>
        <h2 id="help-title">How Diffly works</h2>
        <p>Paste an original and revised version, choose word or line comparison, then select Compare.</p>
        <ol>
          <li>Red marks text removed from the original.</li>
          <li>Green marks text added to the revision.</li>
          <li>Everything runs locally—your text is never uploaded.</li>
          <li>Your text is kept only for this tab and cleared when it closes.</li>
          <li>Use the change navigator to jump directly between edits.</li>
        </ol>
        <p class="shortcut">Tip: press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to compare, or <kbd>Esc</kbd> to edit.</p>
      </section>
    </div>
  </div>`;

const paneGrid = document.querySelector("#pane-grid");
const summary = document.querySelector("#summary");
const modal = document.querySelector("#help-modal");
const changeNavigator = document.querySelector("#change-navigator");
let activeChangeIndex = 0;
let changeEntries = [];
let changePosition;
let previousChangeButton;
let nextChangeButton;
let scrollUpdateFrame;

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function persistContent() {
  writeSessionContent(window.sessionStorage, state);
}

function renderLineContent(container, row, side) {
  const parts = row[`${side}Parts`];
  const text = row[`${side}Text`];
  if (parts) {
    parts.forEach((part) => {
      const span = makeElement("span", part.changed ? `token-${side}` : "", part.value);
      container.append(span);
    });
    return;
  }
  const changed = row.kind === "change" && state.options.mode === "lines";
  container.append(makeElement("span", changed ? `token-${side}` : "", text || " "));
}

function createDiffPane(title, side, rows) {
  const pane = makeElement("section", `diff-pane ${side}`);
  pane.setAttribute("aria-label", `${title} comparison`);
  const header = makeElement("header", "pane-header");
  header.append(makeElement("h2", "", title));
  const edit = makeElement("button", "edit-button");
  edit.type = "button";
  edit.setAttribute("aria-label", `Edit ${title.toLowerCase()} text`);
  edit.innerHTML = icons.pencil;
  edit.addEventListener("click", editTexts);
  header.append(edit);
  pane.append(header);

  const lines = makeElement("div", "diff-lines");
  lines.setAttribute("role", "table");
  lines.setAttribute("aria-label", `${title} diff result`);
  rows.forEach((row, rowIndex) => {
    const relevant = side === "left"
      ? row.kind === "remove" || row.kind === "change"
      : row.kind === "add" || row.kind === "change";
    const line = makeElement("div", `diff-row ${relevant ? `${side}-changed` : ""}`);
    line.setAttribute("role", "row");
    line.dataset.rowIndex = String(rowIndex);
    const numberValue = row[`${side}Number`];
    const number = makeElement("span", "line-number", numberValue ?? "");
    number.setAttribute("role", "cell");
    const content = makeElement("code", "line-content");
    content.setAttribute("role", "cell");
    if (numberValue) renderLineContent(content, row, side);
    else content.textContent = " ";
    line.append(number, content);
    lines.append(line);
  });
  pane.append(lines);
  return pane;
}

function getChangeTarget(entry) {
  const preferredSide = entry.kind === "add" ? "right" : "left";
  return paneGrid.querySelector(`.diff-pane.${preferredSide} .diff-row[data-row-index="${entry.rowIndex}"]`)
    || paneGrid.querySelector(`.diff-row[data-row-index="${entry.rowIndex}"]`);
}

function updateChangeNavigator() {
  if (!changeEntries.length) return;
  const fullPosition = `Change ${activeChangeIndex + 1} of ${changeEntries.length}`;
  changePosition.replaceChildren(
    makeElement("span", "change-word", "Change "),
    document.createTextNode(`${activeChangeIndex + 1} of ${changeEntries.length}`),
  );
  changePosition.setAttribute("aria-label", fullPosition);
  previousChangeButton.disabled = activeChangeIndex === 0;
  nextChangeButton.disabled = activeChangeIndex === changeEntries.length - 1;
  changeNavigator.querySelectorAll(".change-marker").forEach((marker, index) => {
    const active = index === activeChangeIndex;
    marker.classList.toggle("active", active);
    if (active) marker.setAttribute("aria-current", "true");
    else marker.removeAttribute("aria-current");
  });
}

function goToChange(index) {
  if (!changeEntries.length) return;
  activeChangeIndex = Math.max(0, Math.min(index, changeEntries.length - 1));
  updateChangeNavigator();
  const target = getChangeTarget(changeEntries[activeChangeIndex]);
  if (!target) return;
  const viewportTarget = Math.max(
    changeNavigator.offsetHeight + 18,
    Math.min(window.innerHeight * 0.42, 360),
  );
  const top = target.getBoundingClientRect().top + window.scrollY - viewportTarget;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  target.classList.remove("change-focus");
  window.requestAnimationFrame(() => target.classList.add("change-focus"));
}

function createChangeNavigator(rows) {
  changeEntries = rows
    .map((row, rowIndex) => ({ ...row, rowIndex }))
    .filter((row) => row.kind !== "equal");
  changeNavigator.replaceChildren();
  activeChangeIndex = 0;

  if (!changeEntries.length) {
    changeNavigator.hidden = true;
    return;
  }

  changeNavigator.hidden = false;
  previousChangeButton = makeElement("button", "change-step");
  previousChangeButton.type = "button";
  previousChangeButton.setAttribute("aria-label", "Go to previous change");
  previousChangeButton.innerHTML = `${icons.previous}<span>Previous</span>`;
  previousChangeButton.addEventListener("click", () => goToChange(activeChangeIndex - 1));

  changePosition = makeElement("span", "change-position");
  changePosition.setAttribute("aria-live", "polite");

  nextChangeButton = makeElement("button", "change-step");
  nextChangeButton.type = "button";
  nextChangeButton.setAttribute("aria-label", "Go to next change");
  nextChangeButton.innerHTML = `<span>Next</span>${icons.next}`;
  nextChangeButton.addEventListener("click", () => goToChange(activeChangeIndex + 1));

  const track = makeElement("div", "change-track");
  const lastRowIndex = Math.max(rows.length - 1, 1);
  changeEntries.forEach((entry, index) => {
    const marker = makeElement("button", `change-marker ${entry.kind}`);
    marker.type = "button";
    const position = Math.round((entry.rowIndex / lastRowIndex) * 20) * 5;
    marker.dataset.position = String(Math.max(0, Math.min(100, position)));
    const lineNumber = entry.leftNumber ?? entry.rightNumber ?? entry.rowIndex + 1;
    marker.setAttribute("aria-label", `Go to change ${index + 1}, line ${lineNumber}`);
    marker.addEventListener("click", () => goToChange(index));
    track.append(marker);
  });

  changeNavigator.append(previousChangeButton, track, changePosition, nextChangeButton);
  updateChangeNavigator();
}

function updateActiveChangeFromScroll() {
  scrollUpdateFrame = undefined;
  if (changeNavigator.hidden || !changeEntries.length) return;
  const viewportTarget = Math.min(window.innerHeight * 0.42, 360);
  let closestIndex = activeChangeIndex;
  let closestDistance = Number.POSITIVE_INFINITY;
  changeEntries.forEach((entry, index) => {
    const target = getChangeTarget(entry);
    if (!target) return;
    const distance = Math.abs(target.getBoundingClientRect().top - viewportTarget);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  if (closestIndex !== activeChangeIndex) {
    activeChangeIndex = closestIndex;
    updateChangeNavigator();
  }
}

function scheduleScrollUpdate() {
  if (scrollUpdateFrame !== undefined) return;
  scrollUpdateFrame = window.requestAnimationFrame(updateActiveChangeFromScroll);
}

function createEditorPane(title, key, placeholder) {
  const pane = makeElement("section", "editor-pane");
  const header = makeElement("header", "pane-header");
  header.append(makeElement("h2", "", title));
  const textarea = makeElement("textarea");
  textarea.value = state[key];
  textarea.placeholder = placeholder;
  textarea.wrap = "off";
  textarea.spellcheck = false;
  textarea.setAttribute("aria-label", `${title} text`);
  textarea.addEventListener("input", () => {
    state[key] = textarea.value;
    persistContent();
  });
  pane.append(header, textarea);
  return { pane, textarea };
}

function getHorizontalScrollers() {
  return [...paneGrid.querySelectorAll(".diff-lines, .editor-pane textarea")];
}

function syncHorizontalScrollers() {
  const scrollers = getHorizontalScrollers();
  let isSyncing = false;
  scrollers.forEach((source) => {
    source.addEventListener("scroll", () => {
      if (!state.options.syncHorizontalScroll || isSyncing) return;
      isSyncing = true;
      scrollers.forEach((target) => {
        if (target !== source && target.scrollLeft !== source.scrollLeft) {
          target.scrollLeft = source.scrollLeft;
        }
      });
      window.requestAnimationFrame(() => { isSyncing = false; });
    }, { passive: true });
  });
}

function render() {
  document.querySelector("#words-mode").classList.toggle("active", state.options.mode === "words");
  document.querySelector("#lines-mode").classList.toggle("active", state.options.mode === "lines");
  document.querySelector("#words-mode").setAttribute("aria-pressed", String(state.options.mode === "words"));
  document.querySelector("#lines-mode").setAttribute("aria-pressed", String(state.options.mode === "lines"));
  document.querySelector("#ignore-case").checked = state.options.ignoreCase;
  document.querySelector("#trim-whitespace").checked = state.options.trimWhitespace;
  document.querySelector("#sync-horizontal-scroll").checked = state.options.syncHorizontalScroll;
  paneGrid.replaceChildren();
  summary.replaceChildren();

  if (state.showResults) {
    const comparison = compareText(state.original, state.revised, state.options);
    paneGrid.append(
      createDiffPane("Original", "left", comparison.rows),
      createDiffPane("Revised", "right", comparison.rows),
    );
    createChangeNavigator(comparison.rows);
    const labels = [
      [comparison.summary.additions, "additions", "additions"],
      [comparison.summary.removals, "removals", "removals"],
      [comparison.summary.changes, comparison.summary.changes === 1 ? "change" : "changes", "changes"],
    ];
    labels.forEach(([count, label, type]) => {
      const item = makeElement("span");
      item.append(makeElement("strong", `count ${type}`, count), document.createTextNode(` ${label}`));
      summary.append(item);
    });
  } else {
    changeEntries = [];
    changeNavigator.hidden = true;
    changeNavigator.replaceChildren();
    const original = createEditorPane("Original", "original", "Paste the original text here…");
    const revised = createEditorPane("Revised", "revised", "Paste the revised text here…");
    paneGrid.append(original.pane, revised.pane);
    window.requestAnimationFrame(() => original.textarea.focus());
  }
  syncHorizontalScrollers();
}

function editTexts() {
  state.showResults = false;
  render();
}

function compare() {
  document.querySelectorAll(".editor-pane textarea").forEach((textarea, index) => {
    state[index === 0 ? "original" : "revised"] = textarea.value;
  });
  persistContent();
  state.showResults = true;
  render();
}

document.querySelector("#words-mode").addEventListener("click", () => { state.options.mode = "words"; render(); });
document.querySelector("#lines-mode").addEventListener("click", () => { state.options.mode = "lines"; render(); });
document.querySelector("#ignore-case").addEventListener("change", (event) => { state.options.ignoreCase = event.target.checked; render(); });
document.querySelector("#trim-whitespace").addEventListener("change", (event) => { state.options.trimWhitespace = event.target.checked; render(); });
document.querySelector("#sync-horizontal-scroll").addEventListener("change", (event) => {
  state.options.syncHorizontalScroll = event.target.checked;
  if (event.target.checked) {
    const [source, ...targets] = getHorizontalScrollers();
    targets.forEach((target) => { target.scrollLeft = source?.scrollLeft ?? 0; });
  }
});
document.querySelector("#compare-button").addEventListener("click", compare);
document.querySelector("#clear-button").addEventListener("click", () => {
  state.original = "";
  state.revised = "";
  state.showResults = false;
  persistContent();
  render();
});
document.querySelector("#swap-button").addEventListener("click", () => {
  [state.original, state.revised] = [state.revised, state.original];
  persistContent();
  render();
});
document.querySelector("#help-button").addEventListener("click", () => { modal.hidden = false; document.querySelector("#close-help").focus(); });
document.querySelector("#close-help").addEventListener("click", () => { modal.hidden = true; document.querySelector("#help-button").focus(); });
modal.addEventListener("mousedown", (event) => { if (event.target === modal) modal.hidden = true; });

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    compare();
  }
  if (event.key === "Escape") {
    if (!modal.hidden) modal.hidden = true;
    else if (state.showResults) editTexts();
  }
});

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate);

render();
