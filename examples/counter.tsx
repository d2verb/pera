/** @jsxImportSource https://esm.sh/preact@10 */
import { useEffect, useState } from "https://esm.sh/preact@10/hooks";

type Props = { initial?: number };

export function App({ initial = 0 }: Props) {
  const [counter, setCounter] = useState(initial);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch(`/_pera/api/students/deno`);
      const data = await response.text();
      setMessage(data);
    };
    fetchMessage();
  }, [message]);

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

if (import.meta.main) {
  const { serve } = await import("jsr:@d2verb/pera");
  type ApiContext = import("jsr:@d2verb/pera").ApiContext;

  await serve({
    port: 8080,
    title: "Counter Sample",
    moduleUrl: import.meta.url,
    props: { initial: 4 },
    api: {
      "/students/:name": {
        GET: (ctx: ApiContext) => new Response(`Hello, ${ctx.params.name}!`),
      },
    },
  });
}
