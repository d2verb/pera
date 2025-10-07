# Quick start

## Setting up

Pera lets you run frontend code instantly — no bundler, no config. Just write a
single `.tsx` file and run it with Deno.

Create a file, for example `page.tsx`:

```typescript twoslash
/** @jsxImportSource https://esm.sh/preact@10.27.2 */
// deno-lint-ignore-file no-import-prefix
import { useState } from "https://esm.sh/preact@10.27.2/hooks";
import { serve } from "https://esm.sh/jsr/@d2verb/pera?deps=preact@10.27.2";

export function App() {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <h1>{counter}</h1>
      <button type="button" onClick={() => setCounter(counter - 1)}>-</button>
      <button type="button" onClick={() => setCounter(counter + 1)}>+</button>
    </div>
  );
}

await serve(App, {
  port: 8080,
  title: "Counter",
  moduleUrl: import.meta.url,
});
```

Then simply run:

```bash
deno run -A page.tsx
```

Visit [http://localhost:8080](http://localhost:8080) — your frontend is already
running!

> [!TIP]
> No build step. No `vite`. No config. Just one file.

## Using API routes

Pera lets you define lightweight backend endpoints directly in your app —
perfect for quick prototypes and demos.

```typescript twoslash
/** @jsxImportSource https://esm.sh/preact@10.27.2 */
// deno-lint-ignore-file no-import-prefix
import { useEffect, useState } from "https://esm.sh/preact@10.27.2/hooks";
import { serve } from "https://esm.sh/jsr/@d2verb/pera?deps=preact@10.27.2";

export function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/_pera/api/hello").then(async (r) => setMessage(await r.text()));
  }, []);
  return <h1>{message}</h1>;
}

await serve(App, {
  moduleUrl: import.meta.url,
  api: (app) => {
    app.get("/hello", () => new Response("Hello from API!"));
  },
});
```

> [!NOTE]
> API routes are namespaced under `/_pera/api/`. Perfect for small utilities and
> test endpoints.

## How it works

Pera automatically handles both:

- **Frontend rendering** — using Preact’s JSX runtime
- **Backend serving** — through Deno’s native HTTP server

Under the hood, `serve()`:

1. Starts a lightweight local server
2. Renders your component with `preact-render-to-string`
3. Serves your static `.tsx` page instantly

## When to use Pera

Pera is ideal when you want to:

- Try **Preact** quickly without installing any bundler
- Build **interactive prototypes** or **component demos**
- Test hooks or SSR ideas in isolation
- Teach or experiment with **Deno + JSX** workflows
