/** @jsxImportSource https://esm.sh/preact@10.27.2 */
// deno-lint-ignore-file no-import-prefix
import { useEffect, useState } from "https://esm.sh/preact@10.27.2/hooks";
import {
  defineApi,
  serve,
} from "https://esm.sh/jsr/@d2verb/pera?deps=preact@10.27.2,preact-render-to-string@6.6.2";

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
  api: defineApi({
    "/users/:name": {
      GET: (_, ctx) => new Response(`Hello, ${ctx.params.name}!`),
    },
  }),
});
