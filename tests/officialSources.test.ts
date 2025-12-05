import { describe, expect, it } from 'vitest';
import { officialSources } from '../src/data/officialSources';
import { auxiliaryServices } from '../src/data/auxiliaryServices';
import { getLinkManifest } from '../src/data/linkManifest';

const isHttps = (value: string) => value.startsWith('https://');

describe('officialSources', () => {
    it('has entries with unique ids', () => {
        expect(officialSources.length).toBeGreaterThan(0);
        const ids = officialSources.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('uses https links', () => {
        officialSources.forEach(item => {
            expect(isHttps(item.url)).toBe(true);
        });
    });
});

describe('auxiliaryServices', () => {
    it('has entries with unique ids', () => {
        expect(auxiliaryServices.length).toBeGreaterThan(0);
        const ids = auxiliaryServices.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('uses https links when present', () => {
        auxiliaryServices.forEach(item => {
            if (item.datasetUrl) expect(isHttps(item.datasetUrl)).toBe(true);
            if (item.docsUrl) expect(isHttps(item.docsUrl)).toBe(true);
        });
    });
});

describe('link manifest', () => {
    it('deduplicates urls', () => {
        const manifest = getLinkManifest();
        const urls = manifest.map(item => item.url);
        expect(new Set(urls).size).toBe(urls.length);
    });

    it('contains every official source url', () => {
        const manifestUrls = new Set(getLinkManifest().map(item => item.url));
        officialSources.forEach(source => {
            expect(manifestUrls.has(source.url)).toBe(true);
        });
    });
});
