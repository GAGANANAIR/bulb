# Bulb

A raymarched Mandelbulb — a 3D fractal rendered live in the browser using WebGL, by sphere-tracing a signed distance field. No polygons, no mesh: every pixel is computed directly from a distance function evaluated on the GPU.

**[View it live](https://gagananair.github.io/bulb/)** 

## What it does

- Renders a Mandelbulb fractal using raymarching / sphere tracing
- Real-time controls: **Power** (reshapes the fractal), **Depth** (iteration count vs. speed), **Hue** (color palette)
- Soft shadows, ambient occlusion, and a filmic tonemap for a moody, cinematic look
- Mouse/touch orbit camera with scroll/pinch zoom
- Auto-drift camera motion (toggleable)
- Live telemetry: rays per frame, average march steps, frame time
- Optoion for save also

## Running it

Just open `index.html` in any modern browser with WebGL support — no build step, no dependencies.

```bash
git clone https://github.com/GAGANANAIR/bulb.git
cd bulb
open index.html   # or just double-click it
```
## Controls

| Action | Effect |
|---|---|
| Drag | Orbit the camera |
| Scroll / pinch | Zoom in and out |
| Power slider | Changes the fractal's exponent (its "bulbiness") |
| Depth slider | Trades rendering detail for performance |
| Hue slider | Shifts the color palette between warm and cool |
| Drift button | Toggles automatic camera rotation |
| Reset button | Restores default camera and parameters |

**Images**

<img width="946" height="410" alt="image" src="https://github.com/user-attachments/assets/dbb365fa-986b-4791-8f0b-8bb2ab60905b" />

<img width="931" height="404" alt="image" src="https://github.com/user-attachments/assets/8be29be9-39ad-4bf8-a3f9-45591a9bd8e8" />


## How it works

The fractal is defined by an iterative formula in spherical coordinates (the classic Mandelbulb power-8 formula, but adjustable). Instead of building a mesh, the fragment shader marches a ray from the camera through 3D space, using a distance estimator (DE) to know how far it can safely step forward without missing the surface — this is sphere tracing. When the ray gets close enough to the surface, that point is shaded using a normal estimated from the DE gradient, plus soft shadows and ambient occlusion sampled the same way.

## The Math

The Mandelbulb is the 3D analogue of the Mandelbrot set. Instead of iterating $z \leftarrow z^2 + c$ over complex numbers, we iterate over $\mathbb{R}^3$ using a spherical-coordinate generalization of the power operation.

**Iteration.** For a point $c \in \mathbb{R}^3$, starting from $z_0 = c$:

$$z_{n+1} = z_n^{\,p} + c$$

where the power operation $z^p$ is defined by converting $z = (x, y, z)$ to spherical coordinates,

$$r = |z|, \qquad \theta = \cos^{-1}\!\left(\frac{z_z}{r}\right), \qquad \phi = \operatorname{atan2}(z_y, z_x)$$

then scaling the radius and multiplying the angles by the power $p$:

$$z^{p} = r^{\,p} \big(\sin(p\theta)\cos(p\phi),\ \sin(p\theta)\sin(p\phi),\ \cos(p\theta)\big)$$

A point $c$ belongs to the set if this sequence stays bounded (in `index.html` the loop bails out once $r > 2.2$). The **Power** slider is literally the exponent $p$ in this formula — at $p=8$ you get the "classic" Mandelbulb.

**Sphere tracing needs a distance, not just in/out.** Since there's no mesh, the shader needs to know how far it can safely march the camera ray without stepping through the surface. This comes from a *distance estimator* (DE) derived from how fast the iteration's derivative grows. Alongside $z_n$, the shader tracks a running derivative magnitude $dr$:

$$dr_0 = 1, \qquad dr_{n+1} = p \, r_n^{\,p-1} \, dr_n + 1$$

and after $N$ iterations (or an early escape), the estimated distance to the fractal surface is:

$$\text{DE}(c) \approx \frac{1}{2} \, \frac{r_N \ln r_N}{dr_N}$$

That's the exact `0.5 * log(r) * r / dr` line in `mapDE()`. Sphere tracing then repeatedly steps the ray forward by this safe distance — never overshooting the surface, never wasting steps in empty space — until it converges (or the ray runs out of steps/distance).

**Surface normals**, needed for shading, shadows, and ambient occlusion, come for free from the same DE: they're just its numerical gradient, sampled with tiny offsets around the hit point.

## Author

**Gagan A Nair**
- [Profile](https://gagagananair.netlify.app/)
- gagananair1@gmail.com
