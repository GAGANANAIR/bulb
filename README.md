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

## Author

**Gagan A Nair**
- [Profile](https://gagagananair.netlify.app/)
- gagananair1@gmail.com
