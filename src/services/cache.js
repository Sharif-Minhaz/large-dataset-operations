import Redis from "ioredis";
import config from "../config/index.js";

let redis = null;
let available = false;

try {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  await redis.connect();
  available = true;
  console.log("[cache] Redis connected");
} catch {
  available = false;
  console.warn("[cache] Redis unavailable — running without cache");
}

if (redis) {
  redis.on("error", () => {
    if (available) {
      available = false;
      console.warn("[cache] Redis connection lost — cache disabled");
    }
  });

  redis.on("connect", () => {
    if (!available) {
      available = true;
      console.log("[cache] Redis reconnected — cache enabled");
    }
  });
}

const DEFAULT_TTL = 60; // seconds

export async function cacheGet(key) {
  if (!available) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttl = DEFAULT_TTL) {
  if (!available) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // silent fail — cache is optional
  }
}

export async function cacheDel(pattern) {
  if (!available) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silent fail
  }
}
