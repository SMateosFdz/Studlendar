/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  browserNodeBuiltinsPolyfill: {
    modules: {
      events: true, 
      url: true,
      util: true,
      fs: true,
      http: true,
      https: true,
      zlib: true,
      stream: true,
      net: true,
      dns: true,
      os: true,
      path: true,
      crypto: true,
      tls: true,
      child_process: true,
      timers: true,
      process: true,
      "fs/promises": true,
      "timers/promises": true,
  }}
};
