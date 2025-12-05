import fs from 'fs';
import https from 'https';
import official from '../data/h2maps_official_state_data.json';

function head(url: string): Promise<number> {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => resolve(res.statusCode || 0));
        req.on('error', () => resolve(0));
        req.end();
    });
}

(async () => {
    const links: string[] = [];
    links.push(official.legal_framework.laws[0].source);
    links.push(official.legal_framework.laws[1].source);
    links.push(official.legal_framework.decree_status.source);
    links.push(official.legal_framework.regulator.manual);
    if (official.international.corridor_netherlands) links.push(official.international.corridor_netherlands.report);
    for (const uf of Object.keys(official.states)) {
        const s = official.states[uf];
        if (s.projects) s.projects.forEach((p) => links.push(p.source));
        if (s.grid?.source) links.push(s.grid.source);
        if (s.grid_deliveries_2024) links.push(s.grid_deliveries_2024);
        if (s.regulator) links.push(s.regulator);
        if (s.sources?.epe_painel) links.push(s.sources.epe_painel);
        if (s.sources?.ons_open_data) links.push(s.sources.ons_open_data);
    }
    const results: Record<string, number> = {};
    for (const url of links) {
        results[url] = await head(url);
    }
    fs.writeFileSync('data/last_verified.json', JSON.stringify({ ts: new Date().toISOString(), results }, null, 2));
})();
