## Poly diffuser

- Appearance: A two-dimensional grid of square wells/blocks with varying depths, read along both axes.
- Material: Solid wood or MDF.
- Typical depth: 10–30 cm as an example; depth depends on design.
- Effect: Scatters sound in a wide range of directions across both the horizontal and vertical planes; performance depends on the residue rule, coefficient choice, and panel dimensions.

A Poly diffuser is a 2D extension of the quadratic-residue diffuser. Instead of
a single residue sequence, the well depths come from a two-dimensional residue
rule with two coefficients.

Coefficients are congruence classes modulo p: any integer may be supplied and is
normalized to its canonical representative in [0, p), so equivalent values such
as q and q + p describe the same rule and produce identical grids. Coefficients
congruent to 0 modulo p are rejected: although 0 is technically a quadratic
residue, it collapses one axis of the rule and yields a repeating, physically
degenerate panel. When q1 = q2 = 1 the rule coincides with the QRD-sourced
Skyline grid `(S(i) + S(j)) mod p`.

Formulas: see FORMULAS.md
