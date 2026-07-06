const { spawn } = require("child_process");
const cp = spawn("npx.cmd", ["next", "dev"], { stdio: ["ignore", "pipe", "pipe"], shell: true });
cp.stdout.on("data", d => console.log("OUT:", d.toString().trim()));
cp.stderr.on("data", d => console.log("ERR:", d.toString().trim()));

const fetch = require("node:fetch") || global.fetch;

async function check() {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const res = await fetch("http://localhost:3000/en/admin/gallery");
      const text = await res.text();
      if (res.status >= 500) {
        console.log("500 ERROR!");
        const rscMatch = text.match(/Error: [^<"]+/g);
        if (rscMatch) console.log("RSC Errors:", [...new Set(rscMatch)]);
        const digest = text.match(/digest:"([^"]+)"/);
        if (digest) console.log("Digest:", digest[1]);
        break;
      } else {
        console.log("STATUS:", res.status);
        if (text.includes("Something went wrong")) {
          console.log("ERROR BOUNDARY RENDERED!");
          const matches = text.match(/<script.*?>(.*?)<\/script>/g);
          console.log("Check for scripts with errors.");
          const rscMatch = text.match(/Error: [^<"]+/g);
          if (rscMatch) console.log("RSC Errors in 200?:", [...new Set(rscMatch)]);
        }
        break;
      }
    } catch (e) {
      console.log("Waiting for server...");
    }
  }
  cp.kill();
}
check();
