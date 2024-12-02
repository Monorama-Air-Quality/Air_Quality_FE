const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/v1",
    createProxyMiddleware({
      target: "http://localhost:8080/api/v1",
      changeOrigin: true,
    })
  );

  // WebSocket 프록시
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      ws: true,
      changeOrigin: true
    })
  );
};