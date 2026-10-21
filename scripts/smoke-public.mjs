/**
 * Modest concurrency smoke against a running server (dev or `next start`).
 * Usage: BASE_URL=http://localhost:3000 npm run smoke:public
 */
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const concurrency = Number(process.env.SMOKE_CONCURRENCY ?? 8);
const paths = ["/api/health", "/", "/shop", "/contact"];

async function hit(path) {
  const started = Date.now();
  const response = await fetch(`${base}${path}`, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  return {
    path,
    status: response.status,
    ms: Date.now() - started,
    ok: response.ok,
  };
}

async function main() {
  console.log(
    JSON.stringify({
      base,
      concurrency,
      paths,
    }),
  );

  const jobs = [];
  for (let i = 0; i < concurrency; i += 1) {
    for (const path of paths) {
      jobs.push(hit(path));
    }
  }

  const results = await Promise.all(jobs);
  const failed = results.filter((r) => !r.ok);
  const byPath = Object.fromEntries(
    paths.map((path) => {
      const subset = results.filter((r) => r.path === path);
      const ms = subset.map((r) => r.ms).sort((a, b) => a - b);
      return [
        path,
        {
          samples: subset.length,
          ok: subset.filter((r) => r.ok).length,
          p50: ms[Math.floor(ms.length * 0.5)] ?? null,
          p95: ms[Math.floor(ms.length * 0.95)] ?? null,
        },
      ];
    }),
  );

  console.log(JSON.stringify({ byPath, failed: failed.length }, null, 2));
  if (failed.length) {
    console.error(failed.slice(0, 10));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
