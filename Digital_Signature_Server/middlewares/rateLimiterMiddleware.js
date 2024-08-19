const setRateLimit = require("express-rate-limit");

const rateLimiter = setRateLimit({
  windowMs: 60 * 1000, // window size || time frame size
  max: 1000, // Maximum number of requests which can be allowed in the given window size.
  message:
    "You have exceeded your requests limit per minute. please try again later.",
  headers: true,
  keyGenerator: (req) => `${req.ip}:${req.originalUrl}`, // Generate key based on IP address and endpoint
});

module.exports = rateLimiter;
