const http = require("http");
http.get("http://localhost:3000/en/admin/gallery", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      if (json.err) console.log("ERROR JSON:", json.err);
    }
    const rscMatch = data.match(/Error: [^<"]+/g);
    if (rscMatch) {
      console.log("RSC Errors:", [...new Set(rscMatch)]);
    }
    const digestMatch = data.match(/digest:"([^"]+)"/);
    if (digestMatch) console.log("Digest:", digestMatch[1]);
  });
}).on("error", (err) => console.log("Req err:", err.message));
