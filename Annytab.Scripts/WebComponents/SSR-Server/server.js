import http from 'http';
import fs from 'fs';
import url from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

/* =========================
   CACHE
========================= */
const cache = new Map();

function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.data;
}

function setCache(key, data, ttl = 5000) {
    cache.set(key, { data, expiry: Date.now() + ttl });
}

/* =========================
   FILE LOADER
========================= */
function getAllFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            results = results.concat(getAllFiles(full));
        } else if (file.endsWith('.js')) {
            results.push(full);
        }
    });

    return results;
}

/* =========================
   LOADERS (ASYNC!)
========================= */
const middlewareDir = path.join(__dirname, 'middleware');
const layoutsDir = path.join(__dirname, 'layouts');
const pagesDir = path.join(__dirname, 'pages');

async function loadMiddleware() {
    const middleware = {};
    const files = getAllFiles(middlewareDir);

    for (const file of files) {
        const name = path.basename(file, '.js');
        const mod = await import('file://' + file + '?t=' + Date.now());
        middleware[name] = mod.default;
    }

    return middleware;
}

async function loadLayouts() {
    const layouts = {};
    const files = getAllFiles(layoutsDir);

    for (const file of files) {
        const name = path.basename(file, '.js');
        const mod = await import('file://' + file + '?t=' + Date.now());
        layouts[name] = mod.default;
    }

    return layouts;
}

async function loadRoutes() {
    const files = getAllFiles(pagesDir);
    let routes = [];

    for (const file of files) {
        const mod = await import('file://' + file + '?t=' + Date.now());

        if (!mod.routes) continue;

        for (const [key, config] of Object.entries(mod.routes)) {
            const [method, route] = key.split(' ');

            routes.push({
                method,
                route,
                handler: config.handler,
                middleware: config.middleware || [],
                layout: config.layout || 'DefaultLayout'
            });
        }
    }

    return routes;
}

/* =========================
   INIT
========================= */
let globalMiddleware = await loadMiddleware();
let layouts = await loadLayouts();
let routes = await loadRoutes();

const defaultLayout = layouts['DefaultLayout'];

/* =========================
   HOT RELOAD
========================= */
fs.watch(pagesDir, { recursive: true }, async () => {
    console.log('🔄 Reload routes');
    routes = await loadRoutes();
    cache.clear();
});

/* =========================
   ROUTER
========================= */
function matchRoute(pattern, pathname) {
    const keys = [];

    const regex = new RegExp(
        '^' +
        pattern.replace(/:([^/]+)/g, (_, k) => {
            keys.push(k);
            return '([^/]+)';
        }) +
        '$'
    );

    const match = pathname.match(regex);
    if (!match) return null;

    const params = {};
    keys.forEach((k, i) => (params[k] = match[i + 1]));

    return params;
}

/* =========================
   MIDDLEWARE RUNNER
========================= */
async function runMiddleware(stack, ctx) {
    let i = 0;

    async function next() {
        const fn = stack[i++];
        if (fn) await fn(ctx, next);
    }

    await next();
}

/* =========================
   ISLAND DETECTION
========================= */
function detectIslands(html) {
    const regex = /<([a-z]+-[a-z0-9-]*)\b/g;
    const set = new Set();
    let match;

    while ((match = regex.exec(html))) {
        set.add(match[1]);
    }

    return [...set];
}

function createHydrationScript(components) {
    return `
<script type="module">
const components = ${JSON.stringify(components)};
for (const name of components) {
  try { await import('/plugins/' + name + '.js'); }
  catch { try { await import('/components/' + name + '.js'); } catch {} }
}
</script>`;
}

/* =========================
   SERVER
========================= */
http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // Set cache key
    const cacheKey = req.method + ' ' + req.url;

    const cached = getCache(cacheKey);
    if (cached) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(cached);
    }

    // serve JS files
    if (pathname.endsWith('.js')) {
        const file = path.join(__dirname, pathname);
        if (fs.existsSync(file)) {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            return fs.createReadStream(file).pipe(res);
        }
    }

    let matched = null;
    let params = {};

    for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = matchRoute(r.route, pathname);
        if (m) {
            matched = r;
            params = m;
            break;
        }
    }

    if (!matched) {
        res.writeHead(404);
        return res.end('Not found');
    }

    const ctx = {
        method: req.method,
        path: pathname,
        params,
        query: parsed.query
    };

    // middleware
    const stack = matched.middleware
        .map(name => globalMiddleware[name])
        .filter(Boolean);

    await runMiddleware(stack, ctx);

    const result = await matched.handler(ctx);

    // layout
    const layoutFn = layouts[matched.layout] || defaultLayout;

    let html = layoutFn(result);

    // islands
    const islands = detectIslands(html);
    html = html.replace(
        '</body>',
        createHydrationScript(islands) + '</body>'
    );

    setCache(cacheKey, html);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

}).listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
});
