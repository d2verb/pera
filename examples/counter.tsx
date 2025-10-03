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
    const { serve } = await import("jsr:@d2verb/pera");
    await serve({
        port: 8080,
        title: "Counter Sample",
        moduleUrl: import.meta.url,
    });
}