# ABFUSOR — Absorbing Binary Diffuser

A hybrid absorber and diffuser that combines the scattering properties of a QRD with the absorption properties of a porous material.

## Overview

The ABFUSOR is built upon the Quadratic Residue Diffuser (QRD) infrastructure. It uses the same residue sequence and well depths as a standard QRD. However, a certain fraction of the wells are converted from purely diffusive wells into absorptive wells.

## Design Principle

To maximize acoustic performance, the shallowest wells are chosen to be the absorptive ones. Shallow wells contribute less to the phase-modulation (diffusion) than deep wells, so filling them with material results in a minimal loss of diffusion performance while providing significant broadband absorption.

The `absorptiveRatio` (a value in $[0, 1)$) determines the fraction of wells, sorted by ascending depth, that become `ABSORPTIVE`.

- **DIFFUSIVE wells**: Plain QRD depth, providing scattering.
- **ABSORPTIVE wells**: Filled with an absorptive material (e.g., foam) to a depth equal to the well's QRD depth.

## Formulas

### Hybrid Profile

The overall absorption profile is calculated as the average absorption across all wells:

$$\alpha_{total}(f) = \frac{1}{N} \sum_{i=1}^{N} \alpha_i(f)$$

Where:
- $N$ is the total number of wells.
- $\alpha_i(f)$ is the absorption coefficient of well $i$.
- For **DIFFUSIVE** wells, $\alpha_i(f) = 0$.
- For **ABSORPTIVE** wells, $\alpha_i(f)$ is calculated using a rigid-backed porous absorber model.

### Absorptive Wells (Porous Absorber)

The absorption is modeled using the Delany–Bazley equivalent fluid approach for a rigid-backed porous layer.

Let $\sigma$ be the complex flow resistivity, $\rho_0$ the air density, $\gamma = 1.4$ the adiabatic index, $c$ the speed of sound, $Z_0 = \rho_0 c$ the air characteristic impedance, $L$ the layer thickness, and $f$ the frequency:

$$\hat{\rho} = \rho_0 \cdot \alpha_\infty + \frac{\hat{\sigma}}{j\omega}$$
(where $\alpha_\infty \approx 1$ is the tortuosity and $\hat{\sigma}$ is the complex flow resistivity)

$$\hat{c} = \frac{\gamma p_0}{\gamma - (\gamma - 1) \cdot F}, \quad F = \frac{1}{\sqrt{1 + (0.59 - j0.124) \cdot (100/f)^{0.5}}}$$

$$\hat{Z}_c = \sqrt{\hat{\rho} \cdot \hat{c}} \quad \text{(characteristic impedance)}$$
$$\hat{k} = \omega \cdot \sqrt{\hat{\rho} / \hat{c}} \quad \text{(wavenumber)}$$
$$\hat{Z}_s = R_s + \hat{Z}_c \cdot \coth(j \cdot \hat{k} \cdot L) \quad \text{(surface impedance, with } R_s \approx 0 \text{ for rigid backing)}$$

The normal-incidence power absorption coefficient $\alpha$ is:

$$\alpha = 1 - \frac{|\hat{Z}_s - Z_0|}{|\hat{Z}_s + Z_0|}$$

## Constraints

- The order $p$ must be a prime number.
- The `absorptiveRatio` must be in the range $[0, 1)$.
- The material's flow resistivity must be positive.
