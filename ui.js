// UI for Learn / Practice / Word Problems tabs.
const $ = id => document.getElementById(id);
const store = Object.assign({ streak: 0, solved: 0, per: {}, wordDone: {} }, JSON.parse(localStorage.getItem("calcStats") || "{}"));
const save = () => localStorage.setItem("calcStats", JSON.stringify(store));
const state = { tab: localStorage.getItem("calcTab") || "learn", skill: "power", mixed: false, prob: null, answered: false, lesson: "start", fsec: "ideas", word: "bathtub", wp: null, stage: 0 };

const K = (s, display) => { try { return katex.renderToString(s, { displayMode: !!display, throwOnError: false }); } catch { return s; } };
const math = el => renderMathInElement(el, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }], throwOnError: false });
const setHTML = (el, html) => { el.innerHTML = html; math(el); };

// ---------- Tabs & sidebar ----------
function setTab(t) {
  state.tab = t; localStorage.setItem("calcTab", t);
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("on", v.id === "view-" + t));
  if (t === "practice" && !state.prob) newProblem();
  if (t === "word" && !state.wp) newWord();
  if (t === "learn") renderLesson();
  if (t === "formulas") renderFormulas();
  sidebar();
}

function item(label, right, active, onclick, done) {
  const b = document.createElement("button");
  b.className = "item" + (active ? " active" : "");
  b.innerHTML = `<span>${label}</span><span class="count ${done ? "done" : ""}">${right}</span>`;
  b.onclick = onclick; return b;
}
function heading(text) { const h = document.createElement("div"); h.className = "topic-title"; h.textContent = text; return h; }

function sidebar() {
  const sb = $("sidebar"); sb.innerHTML = "";
  if (state.tab === "learn") {
    sb.appendChild(heading("Lessons"));
    LESSONS.forEach(l => sb.appendChild(item(`${l.icon}&nbsp; ${l.title}`, "", state.lesson === l.id, () => { state.lesson = l.id; renderLesson(); sidebar(); })));
  } else if (state.tab === "formulas") {
    sb.appendChild(heading("Formula Page"));
    FORMULAS.forEach(f => sb.appendChild(item(`${f.icon}&nbsp; ${f.title}`, f.cards.length, state.fsec === f.id, () => {
      state.fsec = f.id; sidebar(); document.getElementById("fs-" + f.id).scrollIntoView({ behavior: "smooth" });
    })));
  } else if (state.tab === "practice") {
    const mixed = document.createElement("button");
    mixed.className = "mixed" + (state.mixed ? " primary" : ""); mixed.textContent = "🔀 Mixed review (all topics)";
    mixed.onclick = () => { state.mixed = true; newProblem(); };
    sb.appendChild(mixed);
    for (const t of TOPICS) {
      sb.appendChild(heading(t.name));
      for (const [id, name] of t.skills) {
        const n = store.per[id] || 0;
        sb.appendChild(item(name, (n >= 5 ? "✓ " : "") + n, !state.mixed && state.skill === id, () => { state.mixed = false; state.skill = id; newProblem(); }, n >= 5));
      }
    }
  } else {
    sb.appendChild(heading("Rate-of-change problems"));
    WORD_LIST.forEach(([id, name]) => {
      const n = store.wordDone[id] || 0;
      sb.appendChild(item(`${WORD[id]().icon}&nbsp; ${name}`, n ? "✓ " + n : "", state.word === id, () => { state.word = id; newWord(); }, n > 0));
    });
  }
  $("streak").textContent = store.streak; $("solved").textContent = store.solved;
}

// ---------- Learn ----------
function renderLesson() {
  const i = LESSONS.findIndex(l => l.id === state.lesson), l = LESSONS[i];
  const prev = LESSONS[i - 1], next = LESSONS[i + 1];
  setHTML($("lesson"), `<h1>${l.icon} ${l.title}</h1><div class="sub">Lesson ${i + 1} of ${LESSONS.length}</div>`
    + l.sections.map(([h, b]) => `<section><h3>${h}</h3><div>${b}</div></section>`).join("")
    + `<div class="nav"><span>${prev ? `<button data-go="${prev.id}">← ${prev.title}</button>` : ""}</span>
       <span>${next ? `<button class="primary" data-go="${next.id}">${next.title} →</button>`
                    : `<button class="primary" data-tab-go="word">Try a word problem →</button>`}</span></div>`);
  $("lesson").querySelectorAll("[data-go]").forEach(b => b.onclick = () => { state.lesson = b.dataset.go; renderLesson(); sidebar(); window.scrollTo(0, 0); });
  $("lesson").querySelectorAll("[data-tab-go]").forEach(b => b.onclick = () => setTab(b.dataset.tabGo));
}

// ---------- Formula Page ----------
function renderFormulas() {
  const el = $("formulaPage");
  if (el.dataset.done) return;
  el.dataset.done = 1;
  setHTML(el, `<div class="card fp-hero"><h1>📋 Formula Page</h1>
      <p>Every formula and big idea, explained in plain, easy words — plus a picture to help it stick.</p></div>`
    + FORMULAS.map(sec => `<section class="fp-sec" id="fs-${sec.id}">
        <h2>${sec.icon} ${sec.title}</h2><p class="muted fp-intro">${sec.intro}</p>
        <div class="fp-grid">${sec.cards.map(c => `<div class="fp-card">
          <div class="fp-name">${c.name}</div>
          <div class="fp-tex">${K(c.tex, true)}</div>
          <div class="fp-plain"><span class="tag">In plain words</span>${c.plain}</div>
          <div class="fp-like"><span class="tag">Think of it like…</span>${c.like}</div>
          ${c.ex ? `<div class="fp-ex"><span class="tag">Example</span>${K(c.ex, true)}</div>` : ""}
        </div>`).join("")}</div></section>`).join(""));
}

// ---------- Practice ----------
const SKILL_NAME = Object.fromEntries(TOPICS.flatMap(t => t.skills.map(([id, n]) => [id, [t.name, n]])));
function newProblem() {
  if (state.mixed) state.skill = pick(Object.keys(GEN));
  state.prob = GEN[state.skill](); state.answered = false;
  const p = state.prob, [topic, name] = SKILL_NAME[state.skill];
  $("crumb").textContent = `${topic} › ${name}${state.mixed ? " (mixed)" : ""}`;
  setHTML($("promptText"), p.prompt);
  $("promptMath").innerHTML = K(p.tex, true);
  $("answer").value = ""; $("answer").className = ""; $("preview").innerHTML = "";
  $("feedback").className = "feedback"; $("feedback").textContent = "";
  ["hint", "solution", "simple"].forEach(id => $(id).classList.add("hidden"));
  sidebar(); $("answer").focus();
}
function submit() {
  if (state.answered) return newProblem();
  const r = check(state.prob, $("answer").value), fb = $("feedback");
  if (r.msg) { fb.className = "feedback info"; fb.textContent = r.msg; return; }
  if (r.ok) {
    state.answered = true; store.streak++; store.solved++;
    store.per[state.skill] = (store.per[state.skill] || 0) + 1; save();
    fb.className = "feedback good"; fb.textContent = "✓ Correct!" + (r.warnC ? " (Don't forget + C.)" : "") + "  Press Enter for the next one.";
    $("answer").className = "good";
  } else {
    store.streak = 0; save();
    fb.className = "feedback bad"; fb.textContent = "✗ Not quite. Try again, or tap \"Explain it simply\".";
    $("answer").className = "bad";
  }
  sidebar();
}
function showSolution() {
  const p = state.prob;
  setHTML($("solution"), "<h4>Solution</h4>" + p.steps.map(([t, m]) => `<div class="step">${t}<div class="math">${K(m, true)}</div></div>`).join("")
    + `<div class="final"><b>Answer:</b> ${K(p.ansTex)}</div>`);
  $("solution").classList.remove("hidden");
  if (!state.answered) { state.answered = true; store.streak = 0; save(); sidebar(); }
}

// ---------- Word problems ----------
const STEP_NAMES = ["Variables", "Know / Find", "Formula", "Differentiate", "Solve"];
function newWord() {
  state.wp = WORD[state.word](); state.stage = 0;
  $("wIcon").textContent = state.wp.icon; $("wTitle").textContent = state.wp.title;
  setHTML($("wStory"), state.wp.story);
  $("wSimple").classList.add("hidden");
  $("wStages").innerHTML = "";
  renderStage(); sidebar();
}
function stepper() {
  $("wStepper").innerHTML = STEP_NAMES.map((n, i) => `<li class="${i < state.stage ? "done" : i === state.stage ? "cur" : ""}">${i + 1}. ${n}</li>`).join("");
}
function renderStage() {
  stepper();
  const wp = state.wp, i = state.stage;
  if (i >= wp.stages.length) {
    store.wordDone[state.word] = (store.wordDone[state.word] || 0) + 1; save(); sidebar();
    const d = document.createElement("div"); d.className = "done-banner";
    d.innerHTML = `🎉 Solved! You found the variables, built the formula, differentiated, and solved.<br><br><button class="primary" id="wAgain">Try it with new numbers</button>`;
    $("wStages").appendChild(d); $("wAgain").onclick = newWord; d.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const s = wp.stages[i], el = document.createElement("div");
  el.className = "stage";
  const next = () => { el.classList.add("locked-done"); state.stage++; renderStage(); };
  const reveal = (ok) => {
    const ex = document.createElement("div"); ex.className = "explain";
    ex.innerHTML = (ok ? "✅ <b>Right!</b> " : "") + s.explain;
    const nb = document.createElement("button"); nb.className = "primary"; nb.style.marginTop = "12px";
    nb.textContent = i === wp.stages.length - 1 ? "Finish" : "Next step →"; nb.onclick = () => { nb.remove(); next(); };
    el.append(ex, nb); math(ex); nb.focus();
  };

  if (s.type === "mc") {
    el.innerHTML = `<div class="q"><b class="n">Step ${i + 1}.</b>${s.question}</div><div class="opts"></div>`;
    const opts = el.querySelector(".opts"); let solved = false;
    s.options.forEach(o => {
      const b = document.createElement("button"); b.className = "opt"; b.innerHTML = o.html;
      b.onclick = () => {
        if (solved) return;
        if (o.ok) { solved = true; b.classList.add("right"); opts.querySelectorAll(".opt").forEach(x => x.disabled = true); reveal(true); }
        else { b.classList.add("wrong"); b.disabled = true; }
      };
      opts.appendChild(b);
    });
  } else {
    el.innerHTML = `<div class="q"><b class="n">Step ${i + 1}.</b>${s.question}</div>
      <div class="numrow"><input placeholder="Your answer (${s.unit})" autocomplete="off" /><button class="primary">Check</button><button class="giveup">Show me</button></div>
      <div class="feedback"></div>`;
    const inp = el.querySelector("input"), fb = el.querySelector(".feedback"); let solved = false;
    const go = () => {
      if (solved) return;
      const r = check({ kind: "num", ans: s.ans, tol: 0.01 }, inp.value.replace(/\s*(ft|m|cm)(²|³|\^?[23])?\s*\/\s*(s|sec|min)\s*$/i, ""));
      if (r.msg) { fb.className = "feedback info"; fb.textContent = r.msg; return; }
      if (r.ok) { solved = true; fb.className = "feedback good"; fb.textContent = `✓ Correct! (${(+s.ans).toPrecision(4)} ${s.unit})`; reveal(false); }
      else { fb.className = "feedback bad"; fb.textContent = "✗ Not quite. Check your signs and the numbers you plugged in."; }
    };
    el.querySelector(".primary").onclick = go;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    el.querySelector(".giveup").onclick = () => { if (!solved) { solved = true; fb.className = "feedback info"; fb.textContent = "Here's how:"; reveal(false); } };
    setTimeout(() => inp.focus(), 0);
  }
  $("wStages").appendChild(el); math(el);
  if (i > 0) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---------- Wiring ----------
window.addEventListener("load", () => {
  document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => setTab(b.dataset.tab));

  for (const k of ["^", "(", ")", "sqrt(", "sin(", "cos(", "tan(", "sec(", "e^(", "ln(", "pi", "+ C"]) {
    const b = document.createElement("button"); b.textContent = k;
    b.onclick = () => {
      const a = $("answer"), s = a.selectionStart, e = a.selectionEnd;
      a.value = a.value.slice(0, s) + k + a.value.slice(e); a.focus();
      a.selectionStart = a.selectionEnd = s + k.length; a.dispatchEvent(new Event("input"));
    };
    $("keypad").appendChild(b);
  }
  $("answer").addEventListener("input", () => {
    const v = $("answer").value.trim().replace(/^y\s*=/, "");
    if (!v) return ($("preview").innerHTML = "");
    try { $("preview").innerHTML = K(tex(parse(v))); } catch (e) { $("preview").innerHTML = `<span class="err">${e.message}</span>`; }
  });
  $("answer").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  $("checkBtn").onclick = submit;
  $("nextBtn").onclick = newProblem;
  $("hintBtn").onclick = () => { setHTML($("hint"), "💡 " + state.prob.hint); $("hint").classList.remove("hidden"); };
  $("simpleBtn").onclick = () => { setHTML($("simple"), "🧒 <b>In plain English:</b> " + SIMPLE[state.skill]); $("simple").classList.remove("hidden"); };
  $("solutionBtn").onclick = showSolution;
  $("wSimpleBtn").onclick = () => { setHTML($("wSimple"), "🧒 <b>In plain English:</b> " + state.wp.simple); $("wSimple").classList.remove("hidden"); };
  $("wNewBtn").onclick = newWord;
  $("resetStats").onclick = () => { if (confirm("Reset all stats?")) { Object.assign(store, { streak: 0, solved: 0, per: {}, wordDone: {} }); save(); sidebar(); } };

  setTab(state.tab);
});
