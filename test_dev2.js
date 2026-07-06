const { spawn } = require("child_process");
const http = require("http");
const cp = spawn("npx.cmd", ["next", "dev"], { stdio: ["ignore", "pipe", "pipe"], shell: true });
let output = "";
cp.stdout.on("data", d => { output += d; console.log("OUT:", d.toString().trim()); });
cp.stderr.on("data", d => { output += d; console.log("ERR:", d.toString().trim()); });
setTimeout(() => {
  http.get("http://localhost:3000/en/admin/gallery", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      console.log("STATUS:", res.statusCode);
      if (res.statusCode >= 500) {
        console.log("500 ERROR!");
        const rscMatch = data.match(/Error: [^<"]+/g);
        if (rscMatch) console.log("RSC Errors:", [...new Set(rscMatch)]);
      }
      setTimeout(() => cp.kill(), 1000);
    });
  }).on("error", err => {
    console.log("Req err:", err.message);
    cp.kill();
  });
}, 10000);
