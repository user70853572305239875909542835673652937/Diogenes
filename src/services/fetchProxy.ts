import axios from "axios";
import * as fs from "fs";

const CENSYS_URL = process.env.CENSYS_URL || "";
const CENSYS_ID = process.env.CENSYS_ID || "";
const CENSYS_SECRET = process.env.CENSYS_SECRET || "";

export async function fetchProxiesFromCensys() {
  const query =
    "(services.port:80 OR services.port:1080 OR services.port:3128 OR services.port:8080)";
  const response = await axios.get(CENSYS_URL, {
    params: {
      q: query,
      per_page: 50,
      page: 1,
    },
    auth: {
      username: CENSYS_ID,
      password: CENSYS_SECRET,
    },
  });

  const proxies: string[] = [];
  response.data.result.hits.forEach((host: any) => {
    const ip = host.ip;
    host.services.forEach((service: any) => {
      if ([80, 1080, 3128, 8080].includes(service.port)) {
        proxies.push(`${ip}:${service.port}`);
      }
    });
  });

  fs.writeFileSync("proxies.json", JSON.stringify(proxies, null, 2));
  return proxies;
}

fetchProxiesFromCensys();
