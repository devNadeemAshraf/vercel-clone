const express = require('express');
const httpProxy = require('http-proxy');

const BASE_URL = "https://amazon_s3_bucket_url.com/__outputs";

const app = express();

const proxy = httpProxy.createProxy();

app.use((req, res) => {
    const hostname = req.hostname
    const subdomain = hostname.split(".")[0]

    // Can also Add Custom Domain Support;

    const target = `${BASE_URL}/${subdomain}`;
    return proxy.web(req, res, { target, changeOrigin: true });
})

// remove the need of 'index.html' everytime in the url
proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === "/") {
        proxyReq.path += "index.html"
    }

    return proxyReq
})

app.listen(8000, () => {
    console.log('Reverse Proxy Up on PORT:8000')
})