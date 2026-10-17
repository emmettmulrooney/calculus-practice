// Guided word problems (related rates & rates of change).
// Every problem walks through: 1) find the variables, 2) build the formula,
// 3) differentiate with respect to time, 4) plug in and solve.

const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fx = (n, d) => frac(n, d).t; // TeX fraction
const piFrac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return `\\frac{${n}}{${d === 1 ? "" : d}\\pi}`; };

function mc(question, correct, wrong, explain) {
  return { type: "mc", question, options: shuffle([{ html: correct, ok: true }, ...wrong.map(w => ({ html: w, ok: false }))]), explain };
}
function solve(question, value, exact, unit, explain) {
  return { type: "num", question, ans: String(value), exact, unit, explain };
}

const WORD = {
  bathtub() {
    const L = ri(4, 6), W = ri(2, 3), Q = ri(2, 6), h0 = ri(4, 9);
    const ans = Q / (L * W);
    return {
      title: "The draining bathtub",
      icon: "🛁",
      story: `A rectangular bathtub is ${L} ft long and ${W} ft wide. The plug is pulled, and water drains out at a steady <b>${Q} ft³ per minute</b>. How fast is the water level dropping when the water is ${h0} inches deep?`,
      simple: `Think of the water as a box. The bottom of the box (length × width) never changes — only the height does. So every bit of water that leaves just lowers the height. If ${Q} ft³ leaves every minute and the floor is ${L * W} ft², the height drops by ${Q} ÷ ${L * W} ft each minute. The depth (${h0} in) doesn't matter here because the tub's sides are straight!`,
      stages: [
        mc("Which quantities are <b>changing over time</b>, and which are fixed?",
          `Changing: volume \\(V\\) and height \\(h\\). Fixed: length ${L}, width ${W}.`,
          [`Changing: length and width. Fixed: volume.`, `Changing: only the height \\(h\\). The volume stays the same.`, `Nothing changes — it's a constant problem.`],
          `Water leaves → the <b>volume V</b> shrinks → the <b>height h</b> drops. The tub's length and width are the walls of the tub, so they never move.`),
        mc("What do we <b>know</b>, and what do we want to <b>find</b>?",
          `Know: \\(\\frac{dV}{dt} = -${Q}\\) ft³/min. Find: \\(\\frac{dh}{dt}\\).`,
          [`Know: \\(\\frac{dh}{dt} = ${Q}\\). Find: \\(\\frac{dV}{dt}\\).`, `Know: \\(V = ${Q}\\). Find: \\(h\\).`, `Know: \\(\\frac{dV}{dt} = ${Q}\\). Find: \\(V\\).`],
          `"Drains at ${Q} ft³ per minute" is a <b>rate</b> of volume → \\(\\frac{dV}{dt}\\). It's <b>negative</b> because volume is going down. "How fast is the level dropping" asks for the rate of the height → \\(\\frac{dh}{dt}\\).`),
        mc("Which formula connects the variables?",
          `\\(V = ${L}\\cdot${W}\\cdot h = ${L * W}h\\)`,
          [`\\(V = \\pi r^2 h\\)`, `\\(V = ${L} + ${W} + h\\)`, `\\(V = \\tfrac{1}{3}\\cdot ${L * W} h\\)`],
          `The water is a rectangular box, so volume = length × width × height. Plug in the numbers that <b>don't</b> change right away: \\(V = ${L * W}h\\).`),
        mc("Differentiate both sides with respect to time \\(t\\). What do you get?",
          `\\(\\frac{dV}{dt} = ${L * W}\\,\\frac{dh}{dt}\\)`,
          [`\\(\\frac{dV}{dt} = ${L * W}\\)`, `\\(\\frac{dV}{dt} = ${L * W}h\\,\\frac{dh}{dt}\\)`, `\\(V' = ${L * W}h'\\,h\\)`],
          `The constant \\(${L * W}\\) just comes along. The derivative of \\(h\\) with respect to time is \\(\\frac{dh}{dt}\\) — that's the chain rule: whenever you differentiate a variable that depends on time, you attach its rate.`),
        solve(`Plug in \\(\\frac{dV}{dt} = -${Q}\\) and solve. How fast is the water level dropping (ft/min)? Give a positive number.`, ans, fx(Q, L * W), "ft/min",
          `\\(-${Q} = ${L * W}\\,\\frac{dh}{dt} \\Rightarrow \\frac{dh}{dt} = -${fx(Q, L * W)} \\approx -${ans.toFixed(3)}\\) ft/min. The minus sign means "dropping", so the water falls at <b>\\(${fx(Q, L * W)}\\) ft/min</b>.`),
      ],
    };
  },

  cone() {
    const R = ri(2, 5), H = R * ri(2, 3), Q = ri(2, 12), h0 = ri(2, H - 1);
    const ans = (Q * H * H) / (Math.PI * R * R * h0 * h0), k = fx(R, H);
    return {
      title: "Filling a cone-shaped tank",
      icon: "🍦",
      story: `Water pours into an upside-down cone tank at <b>${Q} m³/min</b>. The tank is ${H} m tall and its top has a radius of ${R} m. How fast is the water level rising when the water is ${h0} m deep?`,
      simple: `The tricky part: as the water rises, the surface gets wider. So the same amount of water raises the level less and less. We use similar triangles to say "the water's radius is always ${k} of its height", so the formula only has one changing letter (h). Then we take the derivative and plug in.`,
      stages: [
        mc("Which quantities are <b>changing</b> as water pours in?",
          `Volume \\(V\\), water depth \\(h\\), and water-surface radius \\(r\\).`,
          [`Only the volume \\(V\\).`, `The tank's height ${H} and radius ${R}.`, `Only the depth \\(h\\).`],
          `More water → more <b>volume</b>, a higher <b>depth</b>, and since the cone widens upward, a bigger <b>surface radius</b> too. The tank's own size (${H} m, ${R} m) is fixed.`),
        mc("What do we know, and what do we want?",
          `Know: \\(\\frac{dV}{dt} = ${Q}\\). Find: \\(\\frac{dh}{dt}\\) when \\(h = ${h0}\\).`,
          [`Know: \\(\\frac{dh}{dt} = ${Q}\\). Find: \\(\\frac{dV}{dt}\\).`, `Know: \\(V = ${Q}\\). Find: \\(r\\).`, `Know: \\(\\frac{dr}{dt} = ${Q}\\). Find: \\(\\frac{dh}{dt}\\).`],
          `"Pours in at ${Q} m³/min" → rate of volume, \\(\\frac{dV}{dt} = ${Q}\\) (positive, it's filling). "How fast is the level rising" → \\(\\frac{dh}{dt}\\).`),
        mc(`Cone volume is \\(V = \\tfrac{1}{3}\\pi r^2 h\\). That has two changing letters. Similar triangles give \\(\\frac{r}{h} = \\frac{${R}}{${H}}\\). Rewrite \\(V\\) using only \\(h\\):`,
          `\\(V = \\tfrac{1}{3}\\pi \\left(${k}h\\right)^2 h = \\frac{${R * R}\\pi}{${3 * H * H}}h^3\\)`,
          [`\\(V = \\tfrac{1}{3}\\pi h^2 \\cdot ${k}\\)`, `\\(V = \\pi (${k}h)^2\\)`, `\\(V = \\tfrac{1}{3}\\pi ${R * R} h\\)`],
          `The water forms a small cone that's the same shape as the tank, so \\(r = ${k}h\\) always. Substitute that in so there's only one variable to deal with.`),
        mc("Differentiate with respect to time \\(t\\):",
          `\\(\\frac{dV}{dt} = \\frac{${R * R}\\pi}{${H * H}}h^2\\,\\frac{dh}{dt}\\)`,
          [`\\(\\frac{dV}{dt} = \\frac{${R * R}\\pi}{${3 * H * H}}h^3\\,\\frac{dh}{dt}\\)`, `\\(\\frac{dV}{dt} = 3h^2\\)`, `\\(\\frac{dV}{dt} = \\frac{${R * R}\\pi}{${H * H}}h^2\\)`],
          `Power rule on \\(h^3\\) gives \\(3h^2\\), and the 3 cancels the \\(\\frac{1}{3}\\). Chain rule: since \\(h\\) changes with time, multiply by \\(\\frac{dh}{dt}\\).`),
        solve(`Plug in \\(\\frac{dV}{dt} = ${Q}\\) and \\(h = ${h0}\\). How fast is the water rising (m/min)?`, ans, piFrac(Q * H * H, R * R * h0 * h0), "m/min",
          `\\(${Q} = \\frac{${R * R}\\pi}{${H * H}}(${h0})^2\\frac{dh}{dt} \\Rightarrow \\frac{dh}{dt} = ${piFrac(Q * H * H, R * R * h0 * h0)} \\approx ${ans.toFixed(3)}\\) m/min.`),
      ],
    };
  },

  ladder() {
    const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
    const [x0, y0] = Math.random() < 0.5 ? [a, b] : [b, a], v = ri(1, 4), ans = (x0 * v) / y0;
    return {
      title: "The sliding ladder",
      icon: "🪜",
      story: `A ${c} ft ladder leans against a wall. The bottom slides away from the wall at <b>${v} ft/s</b>. How fast is the top of the ladder sliding down the wall when the bottom is ${x0} ft from the wall?`,
      simple: `The wall, the floor, and the ladder make a right triangle. The ladder's length never changes, so if the bottom moves out, the top has to move down to keep the triangle's long side at ${c} ft. Pythagoras ties them together; the derivative tells us how their speeds are related.`,
      stages: [
        mc("Which quantities change over time?",
          `\\(x\\) (bottom's distance from wall) and \\(y\\) (height of the top). The ladder length ${c} is fixed.`,
          [`The ladder length and \\(x\\).`, `Only \\(y\\).`, `The angle only — distances stay fixed.`],
          `Draw it! A right triangle: horizontal side \\(x\\), vertical side \\(y\\), slanted side = ladder = ${c} ft. The ladder doesn't stretch, so ${c} stays constant.`),
        mc("What do we know and what do we want?",
          `Know: \\(\\frac{dx}{dt} = ${v}\\), \\(x = ${x0}\\). Find: \\(\\frac{dy}{dt}\\).`,
          [`Know: \\(\\frac{dy}{dt} = ${v}\\). Find: \\(\\frac{dx}{dt}\\).`, `Know: \\(y = ${v}\\). Find: \\(x\\).`, `Know: \\(\\frac{dx}{dt} = ${x0}\\). Find: \\(y\\).`],
          `"Slides away at ${v} ft/s" = rate of \\(x\\). "How fast is the top sliding down" = rate of \\(y\\).`),
        mc("Which equation connects \\(x\\), \\(y\\), and the ladder?",
          `\\(x^2 + y^2 = ${c * c}\\)`,
          [`\\(x + y = ${c}\\)`, `\\(xy = ${c}\\)`, `\\(x^2 - y^2 = ${c * c}\\)`],
          `Pythagorean theorem: \\(a^2 + b^2 = c^2\\), so \\(x^2 + y^2 = ${c}^2 = ${c * c}\\).`),
        mc("Differentiate both sides with respect to time:",
          `\\(2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0\\)`,
          [`\\(2x + 2y = 0\\)`, `\\(2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = ${2 * c}\\)`, `\\(x\\frac{dx}{dt} = y\\)`],
          `Each squared variable becomes \\(2(\\text{variable})\\times(\\text{its rate})\\). The right side is a constant, and constants have derivative 0.`),
        solve(`When \\(x = ${x0}\\), Pythagoras gives \\(y = ${y0}\\). Plug in and find how fast the top slides down (ft/s). Give a positive number.`, ans, fx(x0 * v, y0), "ft/s",
          `\\(2(${x0})(${v}) + 2(${y0})\\frac{dy}{dt} = 0 \\Rightarrow \\frac{dy}{dt} = -${fx(x0 * v, y0)}\\). Negative means going down, so the top slides down at <b>\\(${fx(x0 * v, y0)}\\) ft/s</b>.`),
      ],
    };
  },

  balloon() {
    const Q = pick([36, 50, 64, 100, 144]), r0 = ri(2, 10), ans = Q / (4 * Math.PI * r0 * r0);
    return {
      title: "Blowing up a balloon",
      icon: "🎈",
      story: `Air is pumped into a spherical balloon at <b>${Q} cm³/s</b>. How fast is the radius growing when the radius is ${r0} cm?`,
      simple: `A bigger balloon has more surface to spread new air over, so it grows slower and slower. The sphere-volume formula links volume to radius; its derivative tells us how a volume rate turns into a radius rate.`,
      stages: [
        mc("What's changing?", `Volume \\(V\\) and radius \\(r\\).`, [`Only volume.`, `Only the air pump rate.`, `Nothing — it's a sphere.`],
          `Pumping air in increases the <b>volume</b>, and the balloon gets bigger, so the <b>radius</b> grows.`),
        mc("Know vs. find?", `Know: \\(\\frac{dV}{dt} = ${Q}\\), \\(r = ${r0}\\). Find: \\(\\frac{dr}{dt}\\).`,
          [`Know: \\(\\frac{dr}{dt} = ${Q}\\). Find: \\(\\frac{dV}{dt}\\).`, `Know: \\(V = ${Q}\\). Find: \\(r\\).`, `Know: \\(r = ${Q}\\). Find: \\(V\\).`],
          `cm³/s is volume per time → \\(\\frac{dV}{dt}\\). "How fast is the radius growing" → \\(\\frac{dr}{dt}\\).`),
        mc("Formula?", `\\(V = \\tfrac{4}{3}\\pi r^3\\)`, [`\\(V = 4\\pi r^2\\)`, `\\(V = \\pi r^2\\)`, `\\(V = \\tfrac{1}{3}\\pi r^2 h\\)`],
          `Volume of a sphere: \\(\\tfrac{4}{3}\\pi r^3\\). (\\(4\\pi r^2\\) is its surface area.)`),
        mc("Differentiate with respect to time:", `\\(\\frac{dV}{dt} = 4\\pi r^2\\,\\frac{dr}{dt}\\)`,
          [`\\(\\frac{dV}{dt} = 4\\pi r^2\\)`, `\\(\\frac{dV}{dt} = \\tfrac{4}{3}\\pi r^2\\frac{dr}{dt}\\)`, `\\(\\frac{dV}{dt} = 4\\pi r^3\\frac{dr}{dt}\\)`],
          `Power rule: \\(\\tfrac{4}{3}\\cdot 3r^2 = 4r^2\\). Chain rule: attach \\(\\frac{dr}{dt}\\).`),
        solve(`Plug in and solve for \\(\\frac{dr}{dt}\\) (cm/s).`, ans, piFrac(Q, 4 * r0 * r0), "cm/s",
          `\\(${Q} = 4\\pi(${r0})^2\\frac{dr}{dt} \\Rightarrow \\frac{dr}{dt} = ${piFrac(Q, 4 * r0 * r0)} \\approx ${ans.toFixed(4)}\\) cm/s.`),
      ],
    };
  },

  ripple() {
    const v = ri(1, 4), r0 = ri(3, 20), ans = 2 * Math.PI * r0 * v;
    return {
      title: "Ripples in a pond",
      icon: "💧",
      story: `A rock is dropped in a pond, making a circular ripple. The radius grows at <b>${v} ft/s</b>. How fast is the area inside the ripple growing when the radius is ${r0} ft?`,
      simple: `Each second, the ripple adds a thin ring around its edge. The longer the edge (circumference \\(2\\pi r\\)), the more area that ring adds. That's exactly what the derivative of \\(\\pi r^2\\) says.`,
      stages: [
        mc("What's changing?", `Radius \\(r\\) and area \\(A\\).`, [`Only area.`, `Only the speed ${v}.`, `The center of the circle.`],
          `The circle spreads out, so both its <b>radius</b> and <b>area</b> increase.`),
        mc("Know vs. find?", `Know: \\(\\frac{dr}{dt} = ${v}\\), \\(r = ${r0}\\). Find: \\(\\frac{dA}{dt}\\).`,
          [`Know: \\(\\frac{dA}{dt} = ${v}\\). Find: \\(\\frac{dr}{dt}\\).`, `Know: \\(A = ${v}\\). Find: \\(r\\).`, `Know: \\(r = ${v}\\). Find: \\(A\\).`],
          `ft/s is distance per time → rate of the radius. "How fast is the area growing" → \\(\\frac{dA}{dt}\\).`),
        mc("Formula?", `\\(A = \\pi r^2\\)`, [`\\(A = 2\\pi r\\)`, `\\(A = \\tfrac{4}{3}\\pi r^3\\)`, `\\(A = r^2\\)`], `Area of a circle.`),
        mc("Differentiate with respect to time:", `\\(\\frac{dA}{dt} = 2\\pi r\\,\\frac{dr}{dt}\\)`,
          [`\\(\\frac{dA}{dt} = 2\\pi r\\)`, `\\(\\frac{dA}{dt} = \\pi r^2\\frac{dr}{dt}\\)`, `\\(\\frac{dA}{dt} = 2\\pi\\frac{dr}{dt}\\)`],
          `Power rule on \\(r^2\\) gives \\(2r\\); chain rule attaches \\(\\frac{dr}{dt}\\).`),
        solve(`Plug in and solve (ft²/s). You can type something like <code>${2 * r0 * v}pi</code>.`, ans, `${2 * r0 * v}\\pi`, "ft²/s",
          `\\(\\frac{dA}{dt} = 2\\pi(${r0})(${v}) = ${2 * r0 * v}\\pi \\approx ${ans.toFixed(2)}\\) ft²/s.`),
      ],
    };
  },

  ball() {
    const v0 = pick([48, 64, 80, 96]), h0 = pick([0, 6, 16, 32]), t = ri(1, 2), ans = -32 * t + v0;
    return {
      title: "Throwing a ball up",
      icon: "⚾",
      story: `A ball is thrown straight up. Its height (in feet) after \\(t\\) seconds is \\(h(t) = -16t^2 + ${v0}t${h0 ? " + " + h0 : ""}\\). How fast is the ball moving upward at \\(t = ${t}\\) seconds?`,
      simple: `The formula tells you where the ball is. Speed is "how fast that position changes", which is exactly what a derivative measures. Take the derivative to get a velocity formula, then plug in the time.`,
      stages: [
        mc("What are the variables?", `Time \\(t\\) (input) and height \\(h\\) (output).`, [`Only \\(h\\).`, `The numbers ${v0} and 16.`, `Speed only.`],
          `\\(t\\) goes in, \\(h\\) comes out. ${v0} and 16 are fixed constants.`),
        mc("Which quantity is \"how fast it's moving\"?", `The velocity \\(v = \\frac{dh}{dt}\\)`, [`The height \\(h(${t})\\)`, `The number ${v0}`, `\\(\\frac{dt}{dh}\\)`],
          `"How fast" = rate of change of position = the derivative of height with respect to time.`),
        mc("The formula is already given. What's the next step?", `Take the derivative of \\(h(t)\\).`, [`Plug \\(t = ${t}\\) into \\(h(t)\\).`, `Set \\(h(t) = 0\\).`, `Integrate \\(h(t)\\).`],
          `Plugging into \\(h(t)\\) would give the ball's <b>height</b>, not its speed. We want the rate, so differentiate first.`),
        mc("Differentiate:", `\\(v(t) = -32t + ${v0}\\)`, [`\\(v(t) = -16t + ${v0}\\)`, `\\(v(t) = -32t^2 + ${v0}\\)`, `\\(v(t) = -32t + ${v0 + h0}\\)`],
          `Power rule: \\(-16t^2 \\to -32t\\), \\(${v0}t \\to ${v0}\\)${h0 ? `, and the constant ${h0} disappears` : ""}.`),
        solve(`Plug in \\(t = ${t}\\). What is the velocity (ft/s)?`, ans, `${ans}`, "ft/s",
          `\\(v(${t}) = -32(${t}) + ${v0} = ${ans}\\) ft/s. Positive means it's still going up.`),
      ],
    };
  },
};

const WORD_LIST = [["bathtub", "Draining bathtub"], ["cone", "Cone-shaped tank"], ["ladder", "Sliding ladder"], ["balloon", "Inflating balloon"], ["ripple", "Pond ripple"], ["ball", "Thrown ball"]];
if (typeof module !== "undefined" && typeof document === "undefined") module.exports = { WORD };
