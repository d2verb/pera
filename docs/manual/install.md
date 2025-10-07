# Installation

Pera requires **no explicit installation** — it runs directly with Deno. All you
need is to create a `.tsx` file and execute it.

If you want to start quickly, use the built-in CLI command:

```sh
deno run -A jsr:@d2verb/pera/cli new my-app.tsx
```

This will generate a new Pera app file:

```tsx
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

Run it directly:

```bash
deno run -A my-app.tsx
```

That’s it — your frontend is running at
[http://localhost:8080](http://localhost:8080). No npm, no bundler, no
configuration files.

> [!NOTE]
> Pera is distributed via [JSR] and designed for **Deno only**. You don’t need
> to install it globally — everything runs from the command line.

> [!TIP]
> The `pera` CLI is just a shortcut. You can always use
> `https://esm.sh/jsr/@d2verb/pera` directly from your `.tsx` files.
