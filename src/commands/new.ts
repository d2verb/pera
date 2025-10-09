import { Command } from "@cliffy/command";
import { Confirm } from "@cliffy/prompt";
import { fileExists } from "../utils.ts";

const TEMPLATE = `/** @jsxImportSource https://esm.sh/preact@10.27.2 */
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
`;

export const newCommand = new Command()
  .description(
    "Create a new Pera application file. (default: `app.tsx`)",
  )
  .arguments("[filename:string]")
  .action(async (_, filename: string = "app.tsx") => {
    if (await fileExists(filename)) {
      console.error(`File ${filename} already exists`);
      Deno.exit(1);
    }

    const ok = await Confirm.prompt(`Create ${filename} in current directory?`);
    if (!ok) {
      Deno.exit(1);
    }

    await Deno.writeTextFile(filename, TEMPLATE);
    console.log(`\nCreated ${filename} \nRun it with: deno run -A ${filename}`);
  });
