# pera

Running frontend code without bundling - a super thin library to try out preact
with just a single `.tsx` file. The name pera comes from the japanese word
"ペライチ" (one-paper)

## Features

- 🚀 No bundler required – import Preact directly from esm.sh
- ⚡ Run with Deno – start a server with a single command
- 🧩 Minimal API – only one function: serve()
- 📝 Write plain TSX – no config, just /** @jsxImportSource ... */

## Quick Start

```bash
deno run --allow-net --allow-read --allow-env page.tsx
```

### Example

```tsx
/** @jsxImportSource https://esm.sh/preact */
import { useState } from "https://esm.sh/preact/hooks";

type Props = { initial?: number };

export function App({ initial = 0 }: Props) {
  const [counter, setCounter] = useState(initial);
  return (
    <div>
      <h1>{counter}</h1>
      <button type="button" onClick={() => setCounter(counter + 1)}>+</button>
    </div>
  );
}

if (import.meta.main) {
  const { serve } = await import("jsr:pera");
  await serve({
    port: 8080,
    title: "Counter Sample",
    moduleUrl: import.meta.url,
  });
}
```

Open your browser at http://localhost:8080 and see your Preact app running.

## Use Cases

- Quickly prototype small UI ideas with Preact
- Learn/teach Preact without complex setup
- Share tiny demos as a single .tsx file

## Limitations

- Currently designed for simple, single-page apps
- Not optimized for production use (no SSR, no routing, etc.)
- Requires Deno

## License

MIT
