# Helmholtz Resonator

Appearance: a sealed cavity with a small opening (neck) — the classic "bass
trap" or bottle-shaped resonator. Often a perforated panel or a slot cut into a
sealed box.

- Material: rigid enclosure (wood, MDF, plastic); the cavity must be sealed.
- Effect: strongly absorbs sound near its resonant frequency, with a narrow to
  moderate bandwidth set by the neck and cavity geometry.
- Use: low-frequency absorption where thick porous absorbers are impractical.

## Formulas

Resonant (design) frequency — lumped-parameter mass–spring model:

```text
f = (c / 2π) × √(A / (V × L_eff))
```

Where:

```text
L_eff = L + 1.7r
```

Definitions:

- `c` ≈ 343 m/s — speed of sound in air (~20 °C)
- `ρ₀` ≈ 1.204 kg/m³ — air density at 20 °C (`Z₀ = ρ₀ · c` ≈ 413)
- `A` = π r² — neck cross-sectional area
- `V` — cavity volume
- `L` — physical neck length (plate thickness)
- `r` — neck radius
- `1.7r` — end correction (the oscillating air column behaves as slightly longer)

### Absorption

The resonator presents a specific acoustic impedance `z = r + jx`, normalized by
the characteristic impedance of air `Z₀ = ρ₀·c`:

```text
r = A · Ra / Z₀
x(ω) = ω·L_eff / c − A·c / (ω·V)
α = 4r / ((r + 1)² + x²)
```

- `Ra` — acoustic resistance of the neck (rayls/m⁴). When the neck is
  critically matched (`r = 1`), absorption peaks at `α = 1` at resonance.
- `α` peaks at the resonant frequency where `x = 0`.

### Bandwidth

The −3 dB (half-power) bandwidth is the spacing between the two frequencies at
which `α = 0.5`, obtained analytically from the impedance model.

Constraints:

- All of `A`, `V`, and `L_eff` — and `Ra` when supplied — must be positive.
- The narrower the neck relative to the cavity, the higher the resonant
  frequency and the higher the (sharper) Q.

See `docs/FORMULAS.md` for the shared notation used across panel types.
