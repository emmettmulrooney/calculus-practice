// Plain-English explanation for each practice skill ("Explain it simply").
const SIMPLE = {
  limSub: "A limit asks: <b>what number does the function get close to</b> as x gets close to some value? For nice smooth functions like polynomials, there are no surprises — the answer is just what you get by plugging the number in.",
  limFactor: "If plugging in gives <b>0/0</b>, that doesn't mean \"no answer\" — it means there's a hidden common factor on the top and bottom that is causing the zero. Factor, cross out the matching piece, and then plugging in works.",
  limTrig: "Memorize one fact: when u is tiny, \\(\\sin u\\) is almost exactly u. So \\(\\frac{\\sin u}{u} \\to 1\\). The trick is to make the bottom match what's inside the sine, then pull out the leftover number.",
  limConj: "Square roots minus a number make 0/0. Multiplying by the \"conjugate\" (same thing with + instead of −) uses \\((a-b)(a+b) = a^2 - b^2\\) to get rid of the square root, so the x on the bottom can cancel.",
  limOneSided: "A one-sided limit only looks at one side. \\(x \\to c^-\\) means \"walking in from the left\" (numbers a bit less than c). \\(x \\to c^+\\) means from the right. With a piecewise function, just use the piece for that side.",
  limInf: "When x is HUGE, only the biggest power matters — everything else is tiny by comparison. If top and bottom have the same biggest power, the answer is the ratio of their numbers in front. If the bottom's power is bigger, the fraction shrinks to 0.",
  power: "Derivative = slope = how fast something changes. For \\(x^n\\): <b>bring the power down front, then subtract 1 from the power</b>. \\(x^5 \\to 5x^4\\). Plain numbers don't change, so their derivative is 0.",
  product: "When two things are multiplied, both can change. So: (derivative of the first × the second) + (the first × derivative of the second). \"Left-prime right plus left right-prime.\"",
  quotient: "For a fraction: \"low d-high minus high d-low, over low squared.\" Bottom × (top's derivative) − top × (bottom's derivative), all over the bottom squared.",
  chain: "A function inside a function, like \\((3x+1)^5\\). Take the derivative of the <b>outside</b> (leave the inside alone), then <b>multiply by the derivative of the inside</b>. Think of peeling an onion layer by layer.",
  trigExp: "Key facts: \\(\\sin \\to \\cos\\), \\(\\cos \\to -\\sin\\), \\(e^x \\to e^x\\). If there's a number multiplying x inside, like \\(\\sin(3x)\\), that number pops out front (that's the chain rule).",
  derivAt: "Two steps: 1) find the derivative formula (the slope machine), 2) feed it the x-value. The result is the slope of the curve at that exact point.",
  tangent: "A tangent line just touches the curve at one point and has the same slope there. You need a <b>point</b> (plug x into f) and a <b>slope</b> (plug x into f'). Then \\(y = y_0 + m(x - x_0)\\).",
  intPower: "Integrating is undoing a derivative. For \\(x^n\\): <b>add 1 to the power, then divide by the new power</b>. Always add <b>+ C</b>, because any constant would have disappeared when taking the derivative.",
  intTrig: "Reverse the derivative facts: \\(\\int \\cos = \\sin\\), \\(\\int \\sin = -\\cos\\), \\(\\int e^x = e^x\\). If there's a number with x inside, like \\(\\cos(4x)\\), <b>divide</b> by it (the opposite of the chain rule's multiply).",
  uSub: "u-substitution is the chain rule backwards. Spot an \"inside\" chunk whose derivative is also sitting in the problem. Call the chunk u, replace everything, integrate the simple u version, then put the chunk back.",
  definite: "A definite integral = the area under the curve between two x-values. Find the antiderivative F, then compute <b>F(top number) − F(bottom number)</b>. No + C needed — it would cancel out.",
};

// Tutorial pages for the Learn tab. Each section: [heading, html].
const LESSONS = [
  {
    id: "start", title: "What is calculus?", icon: "👋",
    sections: [
      ["The big idea", "Calculus is the math of <b>change</b>. Regular algebra handles things that stay still. Calculus handles things that are moving, growing, shrinking, or filling up."],
      ["Two main tools", "<ul><li><b>Derivatives</b> answer: <i>how fast is it changing right now?</i> (speed, slope, rate)</li><li><b>Integrals</b> answer: <i>how much has built up in total?</i> (area, distance, total amount)</li></ul>They are opposites: integrating undoes differentiating."],
      ["Limits come first", "Both tools are built on <b>limits</b>: the idea of getting closer and closer to a value without necessarily reaching it."],
    ],
  },
  {
    id: "limits", title: "Limits", icon: "🎯",
    sections: [
      ["What a limit means", "\\(\\lim_{x \\to a} f(x) = L\\) means: as x gets closer and closer to a, f(x) gets closer and closer to L. It's about where the function is <b>heading</b>, not where it actually is."],
      ["Step 1: Try plugging in", "Always try this first. If you get a normal number, that's the answer. $$\\lim_{x\\to 2}(x^2+1) = 2^2+1 = 5$$"],
      ["Step 2: If you get 0/0, simplify", "0/0 means \"needs more work.\" Try:<ul><li><b>Factor and cancel:</b> \\(\\frac{x^2-9}{x-3} = \\frac{(x-3)(x+3)}{x-3} = x+3 \\to 6\\)</li><li><b>Conjugate</b> (for square roots): multiply top and bottom by the same expression with the sign flipped.</li><li><b>Special trig limit:</b> \\(\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1\\)</li></ul>"],
      ["Step 3: Limits at infinity", "As \\(x \\to \\infty\\), compare the highest powers on top and bottom:<ul><li>Same power → ratio of leading numbers</li><li>Bottom bigger → 0</li><li>Top bigger → \\(\\infty\\) (no finite limit)</li></ul>"],
      ["One-sided limits", "\\(x \\to a^-\\) = approach from the left, \\(x \\to a^+\\) = approach from the right. A regular limit exists only when both sides agree."],
    ],
  },
  {
    id: "deriv", title: "Derivatives", icon: "📈",
    sections: [
      ["What a derivative means", "The derivative \\(f'(x)\\) is the <b>slope</b> of the curve at a point, or the <b>rate of change</b>. If f is position, f' is speed."],
      ["The rules you need", "<table class='rules'><tr><td>Constant</td><td>\\(\\frac{d}{dx}c = 0\\)</td></tr><tr><td>Power</td><td>\\(\\frac{d}{dx}x^n = nx^{n-1}\\)</td></tr><tr><td>Product</td><td>\\((uv)' = u'v + uv'\\)</td></tr><tr><td>Quotient</td><td>\\(\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}\\)</td></tr><tr><td>Chain</td><td>\\(\\frac{d}{dx}f(g(x)) = f'(g(x))\\cdot g'(x)\\)</td></tr><tr><td>Trig</td><td>\\(\\sin \\to \\cos,\\; \\cos \\to -\\sin,\\; \\tan \\to \\sec^2\\)</td></tr><tr><td>Exp / log</td><td>\\(e^x \\to e^x,\\; \\ln x \\to \\frac{1}{x}\\)</td></tr></table>"],
      ["How to pick a rule", "Ask \"what's the <b>last</b> operation?\"<ul><li>Adding terms → do each term separately</li><li>Multiplying two x-things → product rule</li><li>Dividing → quotient rule</li><li>Something inside something → chain rule</li></ul>"],
      ["Worked example", "Find \\(\\frac{d}{dx}(x^2+1)^3\\). It's a power with an inside, so chain rule: $$3(x^2+1)^2 \\cdot 2x = 6x(x^2+1)^2$$"],
    ],
  },
  {
    id: "integ", title: "Integrals", icon: "∫",
    sections: [
      ["What an integral means", "\\(\\int f(x)\\,dx\\) asks: what function has derivative f? A definite integral \\(\\int_a^b f(x)\\,dx\\) gives the <b>area</b> under f from a to b."],
      ["Basic rules", "<table class='rules'><tr><td>Power</td><td>\\(\\int x^n dx = \\frac{x^{n+1}}{n+1} + C\\)</td></tr><tr><td>Trig</td><td>\\(\\int \\cos x\\,dx = \\sin x + C,\\; \\int \\sin x\\,dx = -\\cos x + C\\)</td></tr><tr><td>Exp</td><td>\\(\\int e^{kx}dx = \\frac{1}{k}e^{kx} + C\\)</td></tr><tr><td>1/x</td><td>\\(\\int \\frac{1}{x}dx = \\ln|x| + C\\)</td></tr></table>"],
      ["Why + C?", "\\(x^2\\), \\(x^2 + 5\\), and \\(x^2 - 100\\) all have derivative \\(2x\\). So the antiderivative of \\(2x\\) is \\(x^2 + C\\), where C could be any constant."],
      ["u-substitution", "<ol><li>Pick u = the \"inside\" part</li><li>Find du</li><li>Rewrite everything in terms of u</li><li>Integrate</li><li>Put x back</li></ol>Example: \\(\\int 2x(x^2+1)^5dx\\). Let \\(u = x^2+1\\), \\(du = 2x\\,dx\\): $$\\int u^5du = \\frac{u^6}{6} + C = \\frac{(x^2+1)^6}{6} + C$$"],
      ["Definite integrals", "Find F (the antiderivative), then compute \\(F(b) - F(a)\\). $$\\int_0^2 3x^2dx = \\left[x^3\\right]_0^2 = 8 - 0 = 8$$"],
    ],
  },
  {
    id: "solve", title: "How to solve any problem", icon: "🧭",
    sections: [
      ["1. Read and identify", "What kind of problem is it? A limit (\\(\\lim\\)), a derivative (\\(f'\\), \\(\\frac{d}{dx}\\), \"slope\", \"rate\"), or an integral (\\(\\int\\), \"area\", \"total\")?"],
      ["2. Simplify first", "Rewrite to make it easier: \\(\\sqrt{x} = x^{1/2}\\), \\(\\frac{1}{x^3} = x^{-3}\\), expand small products, split fractions."],
      ["3. Apply one rule at a time", "Don't try to do it all in your head. Write each step. Find the outermost operation, apply its rule, then work inward."],
      ["4. Check your answer", "<ul><li>Derivative? Does the sign make sense (increasing = positive)?</li><li>Integral? Differentiate your answer — you should get back the original.</li><li>Word problem? Do the units make sense?</li></ul>"],
    ],
  },
  {
    id: "word", title: "Word problems (related rates)", icon: "🛁",
    sections: [
      ["What they look like", "\"Water drains from a tub at 3 ft³/min. How fast is the water level dropping?\" You're given <b>one rate</b> and asked for <b>a different rate</b>. Calculus connects them."],
      ["Step 1: Find the variables", "Draw a picture. Label everything. Then sort:<ul><li><b>Changing</b> things get letters (V, h, r, x...)</li><li><b>Fixed</b> things get their numbers right away</li></ul>"],
      ["Step 2: Translate the words into rates", "Any \"per second / per minute\" phrase is a derivative with respect to time.<ul><li>\"drains at 3 ft³/min\" → \\(\\frac{dV}{dt} = -3\\) (negative: decreasing)</li><li>\"how fast is the level dropping\" → find \\(\\frac{dh}{dt}\\)</li></ul>"],
      ["Step 3: Build the formula", "Find an equation that links the variables. Usually it's geometry: volume of a box \\(V = lwh\\), cone \\(V = \\frac{1}{3}\\pi r^2 h\\), sphere \\(V = \\frac{4}{3}\\pi r^3\\), circle area \\(A = \\pi r^2\\), Pythagoras \\(x^2 + y^2 = z^2\\). If there are extra variables, eliminate them (e.g. similar triangles)."],
      ["Step 4: Differentiate with respect to time", "Take \\(\\frac{d}{dt}\\) of both sides. Every variable gets its rate attached (chain rule): \\(h \\to \\frac{dh}{dt}\\), \\(r^2 \\to 2r\\frac{dr}{dt}\\)."],
      ["Step 5: Plug in and solve", "<b>Only now</b> plug in the numbers for that specific moment (like h = 4). Plugging in too early turns variables into constants and their derivatives into 0 — a very common mistake. Then solve for the rate you want."],
      ["Try it!", "Open the <b>Word Problems</b> tab to go through these steps one at a time on real problems."],
    ],
  },
];
