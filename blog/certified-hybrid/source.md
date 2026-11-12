# A fair walk, with proof in reserve

How do you find a valuable selection without breaking fairness? Start from a fair set and make exchanges toward a high-value reference. Then ask a separate question: **can we prove the answer is good?**

The walk does not aim for the unknown optimum. Its first target is \(Y_0\), a greedy set that respects upper bounds and may miss lower bounds. The optimum is a comparison set in the proof. A certificate can establish the desired value guarantee immediately; a fallback search supplies a worst-case guarantee if the certificate does not pass.

<div class="theorem"><span class="eyebrow">The promise · Theorem CH</span>

For \(0<\varepsilon\le 1/4\), the output is upper-fair, has total shortfall at most \(\varepsilon N\), and has value at least \((1/2-\varepsilon)\mathrm{OPT}\). A certificate obtained during the fair route search proves the same value bound **with exact fairness**. The fallback may allow shortfall; an accepted restoration recovers exact fairness.

</div>

<div class="route"><span>Walk from a fair set</span><b>→</b><span>Check a certificate</span><b>→</b><span>Fall back if needed</span></div>

## 00 · The objects we work with

There are \(n=|V|\) available elements. Each has two group **slots**, one at each endpoint of its edge. In Problem 1 the endpoints come from two separate attributes. In Problem 2 they come from the same pool of groups, so an element may be a self-loop. Both of a loop's slots count at its one group.

For a selection \(S\), \(\deg_S(v)\) counts its slots at group \(v\). The group has lower bound \(\ell_v\) and upper bound \(u_v\). A set is **upper-fair** if it respects all upper bounds, and **fair** if it respects both bounds. Define the total lower-bound shortfall by

\[\operatorname{fav}(S)=\sum_v\max(0,\ell_v-\deg_S(v)).\]

An upper-fair set is fair exactly when its shortfall is zero. Lowercase \(n\) counts **all available elements**; uppercase \(N\) is the size of a **largest fair set**.

The value function \(f\) is normalized, monotone and submodular: \(f(\varnothing)=0\), adding elements never hurts, and the same addition gives no greater gain on a larger base set. Write \(f(A\mid T)=f(T\cup A)-f(T)\), with \(f(e\mid T)\) for a singleton. Let \(O\) be an optimal fair set and \(\mathrm{OPT}=f(O)\) its value. We assume a fair set exists.

**The workhorse.** Given a fixed number \(w(e)\) for each element, we can exactly maximize \(\sum_{e\in S}w(e)\) over fair sets: by min-cost flow for Problem 1, or weighted matching for Problem 2. Our [companion article on matching](../fair-selection-matching/) shows how the shared-group reduction works and how to prioritize cardinality when computing \(P\). A certificate call, by contrast, maximizes its supplied weights over **all** fair sets.

## 01 · The method at a glance

1. Build fair starting points and the greedy reference \(Y_0\).
2. Walk toward \(Y_0\) while preserving fairness and increasing value. Keep the best result \(T_1\).
3. Compute an upper bound \(U\) on \(\mathrm{OPT}\). If \(f(T_1)\ge (1/2-\varepsilon)U\), return \(T_1\).
4. If needed, use the certificate's maximizing set as another target and try again.
5. If no certificate passes, run the fallback local search.
6. Optionally restore exact fairness and continue improving, subject to the acceptance checks below.

## 02 · Build the starting sets

**\(P\), a largest fair set.** Find a fair set of size \(N\), breaking ties by the sum of singleton values \(f(\{e\})\). Use the flow or matching route appropriate to the problem. Those singleton weights are a proxy; the algorithm does not need \(P\) to maximize the submodular objective. Its cardinality gives \(N\), which sets the fallback's shortfall budget.

**\(Y_0\), the greedy reference.** Start empty and repeatedly add the element with greatest current marginal gain that fits under every upper bound. Stop when no element fits. The lower bounds do not constrain this step, so \(Y_0\) can have a shortfall.

**\(Q\), the fair projection of \(Y_0\).** Replay the greedy additions and record the gain \(g(e)\) when each element enters. The recorded gains telescope to \(f(Y_0)\). Give each element inside \(Y_0\) weight \(g(e)\), and each element outside it weight \(f(e\mid Y_0)\). Optimize these fixed weights over fair sets. This is a projection by a modular score; it need not be the closest set under any particular distance. Polish the result with value-increasing single additions and one-for-one swaps. A move must respect all upper bounds and leave each group with at least the smaller of its current degree and its lower bound. From a fair start this preserves exact fairness.

**\(L\), an optional LP start.** For coverage and facility objectives, solve the linear programming relaxation, which gives fractional element values \(x_e\in[0,1]\). Find a maximum-weight fair set using those values as weights, breaking ties toward valuable elements, and polish it by the same rule. \(Q\) and \(L\) are both fair.

## 03 · Walk along alternating trails

Take a current fair set \(T\) and a reference \(R\), initially \(Y_0\). Keep the shared elements in place. Color \(T\setminus R\) green (remove) and \(R\setminus T\) rust (add). At each group, pair as many opposite-color slots as possible, each slot at most once. Follow the pairings through the elements. The resulting trails alternate colors; they stop at unpaired slots or close into cycles.

<figure class="gadget">
<span class="eyebrow">An illustrative exchange</span>
<svg viewBox="0 0 600 130" role="img" aria-label="A trail a to b to c to d. Remove edges a–b and c–d, and add b–c. The middle groups keep the same degree." style="width:100%;height:auto">
<g fill="none" stroke-width="5"><path d="M70 66H220M380 66H530" stroke="#325e50"/><path d="M220 66H380" stroke="#a74335"/></g>
<g fill="#faf8f3" stroke="#325e50" stroke-width="2"><circle cx="70" cy="66" r="13"/><circle cx="220" cy="66" r="13"/><circle cx="380" cy="66" r="13"/><circle cx="530" cy="66" r="13"/></g>
<g fill="#24312e" font-size="14" text-anchor="middle"><text x="70" y="71">a</text><text x="220" y="71">b</text><text x="380" y="71">c</text><text x="530" y="71">d</text><text x="145" y="43">remove</text><text x="300" y="43">add</text><text x="455" y="43">remove</text><text x="300" y="109">b and c each lose one slot and gain one</text></g>
</svg>
<figcaption>Only the endpoint slots change the degree balance. If the two ends of a piece are at the same group, count both changes there. A closed alternating cycle preserves every degree.</figcaption>
</figure>

A trail or contiguous piece gives a candidate move: remove its \(T\)-colored elements and add its \(R\)-colored elements. Opposite-color slots cancel in the middle. Only the endpoint slots can change a degree, so we can check the bounds using their net changes. This works with self-loops because pairing is defined on slots, including both slots of a loop.

**Short pieces.** Number the \(R\)-colored elements along a trail. For a cut level \(q\), copy the trail \(q\) times and in copy \(i\) delete the \(R\)-elements labeled \(i\bmod q\). The remaining stretches are shorter alternating pieces. The route search considers whole trails as well as pieces (the supplied recipe uses cut levels 2, 4, and 8).

**Which move wins?** Among the candidates, keep only those respecting the upper bounds and preserving zero shortfall. Take the best value gain if it exceeds \(\gamma_H=\varepsilon M_{\rm all}/n\), where \(M_{\rm all}=\max_e f(\{e\})\). Then rebuild trails from the updated set. When no candidate qualifies, stop. If \(M_{\rm all}=0\), normalization and submodularity give no positive gain; otherwise \(f(T)\le nM_{\rm all}\) bounds the number of accepted moves by \(n^2/\varepsilon\). Run the walk from \(Q\) and, when available, \(L\). Keep the better result \(T_1\). It is fair and \(f(T_1)\ge f(Q)\); the next step checks its quality.

## 04 · Certify the answer

**Lemma C1.** For any \(T\), even one that is not fair, the following upper bound is valid:

\[\mathrm{OPT}\le U(T):=f(T)+\max_{S\ \text{fair}}\sum_{e\in S\setminus T} f(e\mid T).\]

<details class="proof" open><summary>Proof · Why this upper-bounds the optimum</summary><div>

Monotonicity gives \(f(O)\le f(T\cup O)\). List the elements of \(O\setminus T\) as \(s_1,\ldots,s_k\) and add them to \(T\) in that order. By telescoping and diminishing returns,

\[f(T\cup O)-f(T)=\sum_i f(s_i\mid T\cup\{s_1,\ldots,s_{i-1}\})\le\sum_i f(s_i\mid T).\]

The maximum over fair sets is at least the expression for the fair set \(O\). This proves the bound. <span class="qed">∎</span>

</div></details>

**Compute and test.** For fixed \(T\), give elements outside \(T\) the weight \(f(e\mid T)\) and elements inside weight zero. A maximum-weight fair-set call supplies the additive term and its maximizing set \(S^*\). If \(f(T)\ge(1/2-\varepsilon)U(T)\), then \(f(T)\ge(1/2-\varepsilon)\mathrm{OPT}\). A failed test means only that this bound did not certify the answer.

<div id="certificate-lab" class="lab"></div>

**Tighten the bound.** Take the minimum of valid upper bounds: \(f(V)\) by monotonicity, the LP value when available, Lemma C1 applied at other base sets (a chain can start at \(T\) and grow to \(T\cup S^*\)), and a cut bound from multiple submodular upper inequalities. The cut solver can stop at a time budget; use its proven upper bound, not the value of the best feasible solution it found.

## 05 · Use a failed certificate to guide another walk

The maximizing fair set \(S^*\) points to elements with high total marginal weight at \(T\). Add it to the references and continue walking from the current fair set toward the reference sets. Recompute the certificate. The method uses a small round budget (three by default), returning as soon as the test passes.

Accepted walk moves only increase value, but a newly computed bound need not decrease. Keeping \(U_{\min}\), the smallest valid bound found anywhere during the run, lets us reuse every improvement in the certificate.

## 06 · Fall back to local search

**Theorem C.** For the hybrid's setting \(\delta=\varepsilon\), the fallback runs in \(n^{O(1/\varepsilon)}\) time and reaches an upper-fair set of shortfall at most \(\varepsilon N\) and value at least \((1/2-\varepsilon)\mathrm{OPT}\).

First delete elements that occur in no fair set, which preserves \(N\) and \(\mathrm{OPT}\). The largest remaining singleton value \(M\) is at most \(\mathrm{OPT}\), because each retained element belongs to some fair set and \(f\) is monotone. If none remains, the feasible empty set is optimal. When \(N<12/\varepsilon\), enumerate sets of size at most \(N\) and take the best fair one. Otherwise take \(q=\lceil8/\varepsilon\rceil\) and \(\gamma=\varepsilon M/(2qn)\). When \(M=0\), all retained elements have zero value and the fair start already suffices.

Start from the current fair set. A move removes \(S'\) and adds \(S''\), with \(|S''|\le6q\) and \(|S'|\le |S''|+3\). The result must be upper-fair and keep shortfall at most \(\varepsilon N\). Take improvements greater than \(\gamma\) until none exists. The proof needs only single alternating walks, or a bundle of one or two shortfall-reducing walks followed by an alternating walk. The guarantee uses the absence of an improving move in this proof-required family, rather than a timeout.

<details class="proof" open><summary>Proof · How the unknown optimum enters the argument</summary><div>

**1. Build comparison pieces.** At a terminal set \(T\), form alternating trails between \(T\) and the unknown fair optimum \(O\). Use \(q\) copies and delete the \(O\setminus T\) elements labeled \(i\bmod q\) in copy \(i\). Labels run continuously across trails. Every element of \(T\setminus O\) appears in exactly \(q\) pieces across all copies, and every element of \(O\setminus T\) appears in \(q-1\).

**2. Keep the comparison moves legal.** Degrees can increase only at unpaired \(O\)-colored ends; at each group the total increase from any disjoint collection of pieces is bounded by the surplus of \(O\)-slots over \(T\)-slots. Thus upper bounds hold. Cutting creates exposed removal ends, so a piece can increase shortfall by at most two. If \(\operatorname{fav}(T)\le\varepsilon N-2\), use pieces individually.

Near the cap, bundle pieces instead. In copy \(i\), at most \(\lceil N/q\rceil\) elements are deleted; let \(D_i\) be this set. Each deletion exposes at most two cut ends. A deficient group has surplus \(O\)-slots, since \(O\) is fair. Uncut trail ends there can supply compensating decreases in shortfall. The grouping lemma in the underlying proof counts endpoint contributions, including multiple ends at the same group: positive shortfall mass is at most \(2|D_i|\), and total signed mass is at most \(2|D_i|-\operatorname{fav}(T)\). With the chosen parameters,

\[4|D_i|\le4N/q+4\le\varepsilon N/2+4\le\varepsilon N-2<\operatorname{fav}(T).\]

There is at least twice as much negative mass as positive mass. Each positive piece costs one or two units, and each reducing piece pays one or two. First cover the two-unit costs, using one two-unit reducer when available and otherwise two one-unit reducers. Then cover the one-unit costs: the initial negative mass was at least twice the total cost, so after covering the two-unit costs there is enough mass left to pay even two units for each one-unit cost. The grouping lemma ensures these disjoint bundles fit the move bounds and do not increase shortfall. Since bundling partitions the pieces, the appearance counts from step 1 survive.

**3. Sum the local-optimality inequalities.** For each comparison move \(G\), let \(G_T\) be its removals and \(G_O\) its additions. The move gains at most \(\gamma\). Diminishing returns gives

\[f(G_O\mid T)\le f(T)-f(T\setminus G_T)+\gamma.\]

Indeed, the gain from adding \(G_O\) on top of \(T\setminus G_T\) is at least its gain on top of \(T\). Across each copy the addition sets partition the retained \(O\)-elements. Across all copies, their \((q-1)\)-fold coverage gives total gain at least \((q-1)f(O\setminus T\mid T)\) by submodularity. The removal sets are disjoint within each copy, so their losses sum to at most \(f(T)\) per copy: deleting the parts one by one costs at least as much as deleting each individually from the full \(T\). There are at most \(qn\) nonempty moves, so the threshold terms total at most \(\varepsilon M/2\). Combining these bounds yields

\[(q-1)(\mathrm{OPT}-f(T))\le qf(T)+\varepsilon\mathrm{OPT}/2.\]

Rearranging and using the choice of \(q\) gives

\[f(T)\ge\left(\frac12-\frac{1/2+\varepsilon/2}{2q-1}\right)\mathrm{OPT}\ge(1/2-\varepsilon)\mathrm{OPT}.\]

</div></details>

**Running time and the half factor.** The bound \(f(T)\le nM\) gives at most \(2qn^2/\varepsilon\) accepted moves, and each move search examines \(n^{O(q)}\) candidates. The half factor comes from comparing \((q-1)\) copies of the optimum's additions with \(q\) copies of the current set's losses. The project's lower bound shows that, for guarantees based on this kind of local optimum, move sizes of order \(1/\varepsilon\) are necessary in the worst case.

## 07 · Restore and improve

**Restore exact fairness if needed.** Try shortfall-reducing walks and re-optimize between repairs. The implementation may use a fair projection if the repair search does not finish within its budget. Accept an exactly fair candidate \(F\) only if \(f(F)\ge(1/2-\varepsilon)U_{\min}\) and \(f(F)\ge f(T_1)\). If this check fails, keep the fallback result with its existing guarantee.

**Optional improvement.** Use remaining time to seek value-increasing exchanges that respect the upper bounds and never increase shortfall. This preserves the guarantees already established.

## 08 · Put the guarantees together

| How the run finishes | Fairness guarantee | Value guarantee |
|---|---|---|
| A certificate passes during the fair route search or a reference round | Exact fairness | At least \((1/2-\varepsilon)\mathrm{OPT}\), by the certificate |
| The fallback finishes without an accepted restoration | Upper-fair, with \(\operatorname{fav}(T)\le\varepsilon N\) | At least \((1/2-\varepsilon)\mathrm{OPT}\), by Theorem C or a valid certificate |
| An exact restoration is accepted | Exact fairness | At least \((1/2-\varepsilon)\mathrm{OPT}\), by the acceptance check |

In all cases \(f(T)\ge f(T_1)\ge f(Q)\): the subsequent searches improve value, and any replacement from a separate candidate or restoration must clear the baseline check. The main route and certificate stages use polynomial work with an exponent independent of \(\varepsilon\); the worst-case search has the larger \(n^{O(1/\varepsilon)}\) cost. Time-budgeted certificate tightening is optional. The key distinction is between a **fast candidate**, an **instance-specific proof**, and a **fallback guarantee**.

<div class="theorem"><span class="eyebrow">Companion article</span><p><a href="../fair-selection-matching/">A fair choice, hidden in a matching</a> explains the exact fair-set subroutine behind the starting points and the marginal-weight certificate.</p></div>
