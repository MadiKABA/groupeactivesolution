/*
 * Test du compteur de « Notre impact » (/a-propos#impact), sans dépendance : Chrome headless piloté
 * par le protocole DevTools (WebSocket natif de Node ≥ 22).
 *
 *   pnpm test:impact [url]     (défaut : http://localhost:3000/a-propos ; serveur à lancer avant)
 *   CHROME_PATH=/chemin/vers/chrome pnpm test:impact
 *
 * Pour chaque largeur et chaque scénario, lit le texte VISIBLE de chaque repère 4 s après l'arrivée
 * sur la section et vérifie qu'il est strictement égal aux valeurs de src/content/impact.ts (avec
 * « + » quand il y en a un) : jamais un doublon (« 1010 »), jamais une valeur intermédiaire figée.
 * Vérifie aussi que la phrase pour lecteur d'écran est bien masquée visuellement (classe sr-only).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const URL_ARG = process.argv[2] ?? "http://localhost:3000/a-propos";
const CHROME = process.env.CHROME_PATH ?? "google-chrome";
const WAIT_MS = 4000;

// Valeurs attendues : lues dans les données (aucune valeur en dur ici).
const source = fileURLToPath(new URL("../src/content/impact.ts", import.meta.url));
const { outputText } = ts.transpileModule(readFileSync(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { impactContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const expected = impactContent.figures.map((figure) => `${figure.value}${figure.suffix ?? ""}`);

const profile = mkdtempSync(join(tmpdir(), "impact-test-"));
const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], {
  stdio: ["ignore", "ignore", "pipe"],
});
const wsUrl = await new Promise((resolve, reject) => {
  let buffer = "";
  chrome.stderr.on("data", (chunk) => {
    buffer += chunk;
    const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
    if (match) resolve(match[1]);
  });
  chrome.on("exit", () => reject(new Error(`Chrome introuvable ou arrêté (${CHROME}). Définir CHROME_PATH.`)));
});

const socket = new WebSocket(wsUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  } else if (message.method) {
    listeners.forEach((listener) => listener(message));
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
const once = (method, sessionId) =>
  new Promise((resolve) => {
    const listener = (message) => {
      if (message.method === method && message.sessionId === sessionId) {
        listeners.splice(listeners.indexOf(listener), 1);
        resolve(message.params);
      }
    };
    listeners.push(listener);
  });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Texte visible de chaque repère (innerText du chiffre : nombre + « + »). */
const READ = `JSON.stringify({
  shown: [...document.querySelectorAll("#impact .im-num")].map((el) => el.innerText.replace(/\\s+/g, "")),
  srHidden: [...document.querySelectorAll("#impact .im-figure .sr-only")].every((el) => {
    const r = el.getBoundingClientRect();
    return r.width <= 1 && r.height <= 1 && getComputedStyle(el).position === "absolute";
  }),
})`;

async function scenario({ width, reduce = false, label, before }) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 }, sessionId);
  if (reduce) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }, sessionId);
  const loaded = once("Page.loadEventFired", sessionId);
  await send("Page.navigate", { url: URL_ARG }, sessionId);
  await loaded;
  if (before) await before(sessionId);
  await send("Runtime.evaluate", { expression: `document.getElementById("impact").scrollIntoView({ block: "start", behavior: "instant" })` }, sessionId);
  await wait(WAIT_MS);
  const { result } = await send("Runtime.evaluate", { expression: READ, returnByValue: true }, sessionId);
  await send("Target.closeTarget", { targetId });
  const { shown, srHidden } = JSON.parse(result.value);
  const ok = shown.length === expected.length && shown.every((text, i) => text === expected[i]) && srHidden;
  console.log(`${ok ? "✓" : "✖"} ${label} (${width}px) : ${shown.join(" · ")}${srHidden ? "" : " — phrase sr-only visible !"}`);
  return ok;
}

let failures = 0;
try {
  for (const width of [390, 1440]) {
    if (!(await scenario({ width, label: "animation complète" }))) failures++;
    if (!(await scenario({ width, reduce: true, label: "animations réduites" }))) failures++;
  }
  // Aller-retour rapide : la section entre à l'écran, on la quitte pendant le comptage, on revient.
  const bounce = async (sessionId) => {
    await send("Runtime.evaluate", { expression: `document.getElementById("impact").scrollIntoView({ behavior: "instant" })` }, sessionId);
    await wait(700);
    await send("Runtime.evaluate", { expression: "scrollTo({ top: 0, behavior: 'instant' })" }, sessionId);
    await wait(300);
  };
  if (!(await scenario({ width: 1440, label: "sortie pendant le comptage", before: bounce }))) failures++;
} finally {
  socket.close();
  chrome.kill();
  await wait(200);
  rmSync(profile, { recursive: true, force: true });
}

console.log(failures ? `\n✖ ${failures} scénario(s) en échec ; attendu : ${expected.join(" · ")}` : `\n✓ Compteur conforme : ${expected.join(" · ")}`);
process.exit(failures ? 1 : 0);
