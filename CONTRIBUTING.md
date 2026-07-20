# Contributing to BULB

Thank you for your interest in contributing to BULB! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please check the existing issues to avoid duplicates.

**To submit a bug report:**

1. Use a clear, descriptive title
2. Include your environment (browser, OS, device type)
3. Describe the exact steps to reproduce the issue
4. Provide specific examples to demonstrate the steps
5. Describe the behavior you observed and what you expected
6. Include screenshots or screen recordings if applicable

**Example bug report:**
```
Title: Audio reactivity not working on Firefox

Environment: Firefox 120, Windows 11, AMD GPU

Steps to reproduce:
1. Click the Mic button
2. Allow microphone access
3. Play music
4. Observe the fractal

Expected: Fractal parameters change based on audio
Actual: No response, Mic button shows "live" but no effect
```

### Suggesting Enhancements

**To submit a feature request:**

1. Use a clear, descriptive title
2. Provide a detailed description of the suggested enhancement
3. Explain why this would be useful
4. List some examples of how this feature would work
5. Include mockups or diagrams if helpful

### Submitting Pull Requests

#### Development Setup

1. **Fork the repository**
   ```bash
   # Create a fork on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bulb.git
   cd bulb
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Edit files as needed
   - Test thoroughly in multiple browsers
   - Follow the code style guide below

5. **Commit your changes**
   ```bash
   git commit -m "feat: add feature description"
   git commit -m "fix: resolve issue description"
   git commit -m "docs: update documentation"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to https://github.com/GAGANANAIR/bulb
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template (see below)
   - Submit!

#### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (fixes #issue_number)
- [ ] New feature (adds functionality)
- [ ] Breaking change (affects existing functionality)
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- Tested in Chrome/Firefox/Safari
- Verified on mobile/desktop
- Performance impact: minimal/moderate/significant

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] No new console warnings/errors
- [ ] Tested in multiple browsers
- [ ] Documentation updated if needed
```

## Code Style Guide

### General Principles
- Write **readable, self-documenting code**
- Prefer **clarity over cleverness**
- Keep functions **small and focused**
- Add **comments for "why", not "what"**

### JavaScript Style

**Indentation & Formatting**
```javascript
// Use 2-space indentation
function exampleFunction() {
  const variable = value;
  return variable;
}

// Use const by default, let when needed, avoid var
const immutable = 42;
let mutable = 0;

// Space after keywords
if (condition) {
  // code
}
```

**Naming Conventions**
```javascript
// Functions: camelCase, verb-first
function calculateDistance(a, b) { }
function parseJSON(data) { }

// Variables & constants: camelCase
const maxIterations = 14;
let currentFrame = 0;

// Private variables: prefixed with underscore (convention)
const _internalCache = [];

// Classes/Constructors: PascalCase
class FractalRenderer { }
```

**Comments**
```javascript
// Good: explains WHY
const renderScale = 0.8; // Scale down for low-end devices

// Bad: explains WHAT
const renderScale = 0.8; // Set render scale to 0.8

// Complex logic: add comment block
/**
 * Adapt render scale based on frame time history.
 * If frames drop below 13ms, increase quality (supersampling).
 * If frames exceed 26ms, reduce quality for stability.
 */
function maybeAdaptScale(now, dt) {
  // ...
}
```

**Error Handling**
```javascript
// Be explicit about error cases
try {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported');
  }
} catch (error) {
  showError('Failed to initialize: ' + error.message);
  return;
}
```

### GLSL Shader Style

**Comments**
```glsl
// Clear, descriptive comments for shader logic
// Compute signed distance estimate to Mandelbulb surface
float mapDE(vec3 pos, out float trapOut) {
  // ...
}

// Soft shadow computation with cone stepping
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  // ...
}
```

**Naming**
```glsl
// Uniforms: u_ prefix
uniform vec3 u_camPos;
uniform float u_power;

// Attributes: a_ prefix
attribute vec2 a_pos;

// Varyings: v_ prefix
varying vec3 v_normal;

// Local variables: camelCase
vec3 rayOrigin = u_camPos;
float distance = mapDE(position, trap);
```

### CSS Style

**Organization**
```css
/* Use CSS custom properties (variables) */
:root {
  --color-primary: #c9903f;
  --color-text: #ece6da;
  --spacing-unit: 8px;
}

/* Group related rules */
#deck {
  /* Layout */
  display: flex;
  gap: var(--spacing-unit);
  
  /* Styling */
  background: var(--panel);
  border: 1px solid var(--line);
  
  /* Effects */
  backdrop-filter: blur(6px);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
}
```

**Selectors**
```css
/* Avoid deep nesting */
.dial label .v { }  /* OK */
#deck .dial .toggles button.active span { }  /* Too deep */

/* Use semantic class names */
.toggle-btn--active { }  /* Better than .btn-red */
```

## Performance Considerations

When contributing code, consider:

1. **GPU Performance**
   - Minimize shader branching
   - Reuse calculations when possible
   - Use appropriate precision (highp vs mediump)

2. **CPU Performance**
   - Avoid allocating objects in render loop
   - Cache DOM queries
   - Use requestAnimationFrame efficiently

3. **Memory**
   - Clean up textures/buffers when resizing
   - Release event listeners when needed
   - Minimize texture memory footprint

4. **Browser Compatibility**
   - Test WebGL implementations across browsers
   - Provide fallbacks for unsupported features
   - Use feature detection, not user-agent detection

## Testing Your Changes

### Manual Testing Checklist

- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works on desktop resolution
- [ ] Works on mobile resolution
- [ ] Touch controls respond properly
- [ ] No console errors or warnings
- [ ] Performance remains stable
- [ ] Audio reactivity functional (if applicable)
- [ ] URL sharing works correctly

### Performance Testing

Use browser DevTools:

```javascript
// Profile rendering performance
console.time('frame');
// ... render logic ...
console.timeEnd('frame');

// Monitor memory usage
console.memory.usedJSHeapSize / 1e6; // MB

// Check WebGL stats
gl.getParameter(gl.RENDERER); // GPU info
```

## Documentation

When updating code, update documentation:

- **Code comments** for complex algorithms
- **README.md** for user-facing changes
- **API documentation** if adding new functions
- **Examples** for new features

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no functional change)
- `refactor:` Code refactor
- `perf:` Performance improvement
- `test:` Tests
- `chore:` Build, dependencies, etc.

**Examples:**
```
feat(audio): add frequency band analysis
fix(rendering): resolve bloom texture binding issue
docs: update shader parameter documentation
perf(rendering): optimize sphere tracing step size
```

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** File an issue with reproduction steps
- **Design decision?** Open an issue for discussion before PR
- **Communication?** Email gagananair1@gmail.com

## Recognition

Contributors will be recognized in:
- This CONTRIBUTING.md file
- Project release notes
- README.md contributors section

---

Thank you for contributing to making BULB better! 🎨
