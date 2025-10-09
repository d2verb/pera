import { Command } from "@cliffy/command";
import { newCommand } from "./commands/new.ts";
import denoJson from "../deno.json" with { type: "json" };

await new Command()
  .name("pera")
  .version(denoJson.version)
  .description("⚡ Pera - Run your frontend instantly")
  .action(function () {
    this.showHelp();
  })
  .command("new", newCommand)
  .parse(Deno.args);
