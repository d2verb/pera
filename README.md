# pera

[![JSR](https://jsr.io/badges/@d2verb/pera)](https://jsr.io/@d2verb/pera)
![CI](https://github.com/d2verb/pera/workflows/CI/badge.svg)

Running frontend code without bundling - a super thin library to try out preact
with just a single `.tsx` file. The name pera comes from the Japanese word
"ペライチ" (one-paper)

## Features

- 🚀 No bundler required – import Preact directly from esm.sh
- ⚡ Run with Deno – start a server with a single command
- 🧩 Minimal API – only one function: serve()
- 📝 Write plain TSX – no config, just /** @jsxImportSource ... */

## Quick Start

```bash
deno run -A jsr:@d2verb/pera/cli new page.tsx
deno run -A page.tsx
```

### Example

```tsx
/** @jsxImportSource https://esm.sh/preact@10 */
import { useEffect, useState } from "https://esm.sh/preact@10/hooks";
import { serve } from "https://esm.sh/jsr/@d2verb/pera";

type Props = { initial?: number };

export function App({ initial = 0 }: Props) {
  const [counter, setCounter] = useState(initial);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch(`/_pera/api/users/deno`);
      const data = await response.text();
      setMessage(data);
    };
    fetchMessage();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Message From API: {message}</h1>
      <h1 className="text-4xl font-bold">Counter: {counter}</h1>
      <div className="flex gap-4">
        <button
          type="button"
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={() => setCounter(counter - 1)}
        >
          -
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => setCounter(counter + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

await serve(App, {
  port: 8080,
  title: "Counter Sample",
  moduleUrl: import.meta.url,
  props: { initial: 4 },
  api: {
    "/users/:name": {
      GET: (_, ctx) => new Response(`Hello, ${ctx.params.name}!`),
    },
  },
});
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
