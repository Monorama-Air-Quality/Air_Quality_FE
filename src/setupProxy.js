const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080/api",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      },
      onError: function (err, req, res) {
        console.log("Proxy Error:", err);
        res.writeHead(500, {
          "Content-Type": "text/plain",
        });
        res.end("Something went wrong with the proxy.");
      },
    })
  );
};
