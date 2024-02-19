import dotenv from "dotenv";
dotenv.config();

import express from "express";
import httpProxy from "http-proxy";

const BASE_URL = process.env.AMAZON_S3_BUCKET_BASE_URL!;
const REVERSE_PROXY_PORT = process.env.REVERSE_PROXY_PORT || 8000;

const app = express();

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];

  // Can also Add Custom Domain Support;

  const target = `${BASE_URL}/${subdomain}`;
  return proxy.web(req, res, { target, changeOrigin: true });
});

// remove the need of 'index.html' everytime in the url
proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }

  return proxyReq;
});

app.listen(REVERSE_PROXY_PORT, () => {
  console.log(`Reverse Proxy Up on PORT:${REVERSE_PROXY_PORT}`);
});
