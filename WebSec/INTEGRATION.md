# How to Connect WebSec (`index.html`) into Another Project

This guide provides concrete, copy-paste instructions for connecting and integrating this WebSec project into any other website or application.

---

## Architecture Overview
The project is organized into self-contained directories:
```
WebSec/
├── index.html           # Main Entry Point & Dashboard Hub
├── guides/              # 23 Vulnerability Explanations & Theory Guides
├── labs/                # 44 Interactive Attack & Exploit Simulations
├── checklists/          # Pentester & Field Audit Checklists
└── coming-soon.html     # Roadmap & Upcoming Labs
```
All internal links use relative paths (`guides/`, `../labs/`, `../index.html`). This means the entire `WebSec` folder can be moved or embedded anywhere without breaking!

---

## 1. Static HTML Site / Portfolio
If your other project is a regular website:

### Step 1: Copy Folder
Copy the entire `WebSec/` directory into your project:
```
my-website/
├── index.html
├── about.html
└── websec/              <-- Place WebSec folder here
    ├── index.html
    ├── guides/
    ├── labs/
    └── checklists/
```

### Step 2: Add Navigation Link
In your main site's navigation or homepage (`my-website/index.html`):
```html
<!-- Open in same tab -->
<a href="./websec/index.html">Security Hub</a>

<!-- OR Open in new tab -->
<a href="./websec/index.html" target="_blank" rel="noopener noreferrer">Security Hub ↗</a>
```

---

## 2. Next.js (App Router or Pages Router)

### Step 1: Copy to `public/`
Copy the `WebSec` folder into your Next.js `public/` directory:
```
my-next-app/
├── app/ (or pages/)
├── components/
└── public/
    └── websec/
        ├── index.html
        ├── guides/
        ├── labs/
        └── checklists/
```

### Step 2: Link to It
In any Next.js React component:
```tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      {/* Next.js automatically serves static files in public/ from the root URL */}
      <Link href="/websec/index.html" target="_blank" className="font-semibold text-indigo-500">
        Security Hub
      </Link>
    </nav>
  );
}
```
*Note: Visiting `http://localhost:3000/websec/` will directly load `index.html`.*

---

## 3. React / Vite / Vue / Angular

### Step 1: Copy to `public/`
Drop the `WebSec` directory into the `public/` directory:
```
my-vite-app/
├── src/
└── public/
    └── websec/
        ├── index.html
        ├── guides/
        ├── labs/
        └── checklists/
```

### Step 2: Link to It
```jsx
<a href="/websec/index.html" target="_blank" rel="noreferrer">
  Explore Security Hub
</a>
```

---

## 4. Node.js / Express Backend
If your main project is a Node.js Express server:

### Step 1: Serve Statically
In your `server.js` or `app.js`:
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve the WebSec directory under the '/security' route
app.use('/security', express.static(path.join(__dirname, 'WebSec')));

app.get('/', (req, res) => {
  res.send('<a href="/security">Go to Security Hub</a>');
});

app.listen(3000, () => {
  console.log('App running on http://localhost:3000');
  console.log('WebSec Hub available at http://localhost:3000/security');
});
```

---

## 5. Embed as an In-App Iframe (Modal or Dedicated View)
If you want the Security Hub to appear seamlessly inside another website's layout without opening a new tab:

```html
<div style="width: 100%; height: 90vh; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
  <iframe 
    src="/websec/index.html" 
    title="Security Hub" 
    width="100%" 
    height="100%" 
    style="border: none;"
    loading="lazy">
  </iframe>
</div>
```

---

## 6. Python (Django / Flask / FastAPI)

### Flask
```python
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='WebSec')

@app.route('/security/')
def security_hub():
    return send_from_directory('WebSec', 'index.html')

@app.route('/security/<path:path>')
def security_assets(path):
    return send_from_directory('WebSec', path)
```

### FastAPI
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/security", StaticFiles(directory="WebSec", html=True), name="websec")
# Access at http://localhost:8000/security/
```

---

## 7. Standalone Deployment (Subdomain / Cloud)
You can also host WebSec independently on GitHub Pages, Netlify, or Vercel:
- Simply deploy the `WebSec` repository as a static site.
- In your main project, link directly to it:
  ```html
  <a href="https://security.yourdomain.com" target="_blank">Security Hub</a>
  ```
