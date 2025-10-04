const args = Deno.args;

const help = () => {
  console.log(`
Pera - Run frontend code in a single file

USAGE:
      deno run -A jsr:@d2verb/pera/cli new [FILE]

COMMANDS:
      new [FILE]     Create a new Pera application file
                     Default: app.tsx

EXAMPLES:
    # Create app.tsx with counter example
    deno run -A jsr:@d2verb/pera/cli new

    # Create my-app.tsx
    deno run -A jsr:@d2verb/pera/cli new my-app.tsx

    # Run the created app
    deno run -A app.tsx
`);
  Deno.exit(1);
};

const fileExists = async (path: string) => {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
};

if (args.length === 0 || args[0] !== "new" || args.length > 2) {
  help();
}

const path = args.length === 2 ? args[1] : "app.tsx";
const content = `/** @jsxImportSource https://esm.sh/preact@10 */
import { useState } from "https://esm.sh/preact@10/hooks";

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

if (import.meta.main) {
  const { serve } = await import("jsr:@d2verb/pera");

  await serve({
    port: 8080,
    title: "Counter",
    moduleUrl: import.meta.url,
  });
}`;

if (await fileExists(path)) {
  console.error(`File ${path} already exists`);
  Deno.exit(1);
}

await Deno.writeTextFile(path, content);
console.log(`Created ${path}. Run it with: deno run -A ${path}`);
Deno.exit(0);
