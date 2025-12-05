#!/usr/bin/env node
import { getLinkManifest } from '../src/data/linkManifest.ts';

const manifest = getLinkManifest({ checkableOnly: true });
async function probe(url: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
        clearTimeout(timer);
        return { ok: res.ok, status: res.status, statusText: res.statusText, finalUrl: res.url };
    } catch (error) {
        clearTimeout(timer);
        return { ok: false, status: 0, statusText: (error as Error).message, finalUrl: url };
    }
}

async function run() {
    if (!manifest.length) {
        console.warn('No links registered. Nothing to check.');
        return;
    }

    console.log(`Checking ${manifest.length} links...`);

    const results = await Promise.all(
        manifest.map(async entry => {
            const result = await probe(entry.url);
            return { ...entry, ...result };
        })
    );

    const failures = results.filter(r => !r.ok);
    failures.forEach(failure => {
        console.error(`FAIL ${failure.id} ${failure.url} -> ${failure.status} ${failure.statusText}`);
    });

    const successes = results.length - failures.length;
    console.log(`Done. Success: ${successes}, Failures: ${failures.length}`);

    if (failures.length) {
        process.exitCode = 1;
    }
}

run();

// TODO: Conectar a saída deste verificador com notificações na UI quando a integração visual for autorizada.
