const rateLimit = new Map();

export default function checkRateLimit(req, limit = 20, windowMs = 60 * 1000) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, startTime: now });
    return true;
  }

  const data = rateLimit.get(ip);
  if (now - data.startTime > windowMs) {
    rateLimit.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (data.count >= limit) {
    return false;
  }

  data.count += 1;
  return true;
}