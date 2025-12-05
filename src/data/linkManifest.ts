import { listOfficialLinks, officialSources } from './officialSources';
import { listAuxiliaryLinks, auxiliaryServices } from './auxiliaryServices';

export type LinkRecord = {
    id: string;
    url: string;
    source: 'official' | 'auxiliary';
    label: string;
};

export function getLinkManifest(options?: { checkableOnly?: boolean }): LinkRecord[] {
    const official = listOfficialLinks({ checkableOnly: options?.checkableOnly }).map(link => ({
        id: link.id,
        url: link.url,
        source: 'official' as const,
        label: `${link.owner} - ${link.category}`,
    }));

    const auxiliary = listAuxiliaryLinks({ checkableOnly: options?.checkableOnly }).map(link => ({
        id: link.id,
        url: link.url,
        source: 'auxiliary' as const,
        label: `${link.provider} - ${link.kind}`,
    }));

    const seen = new Set<string>();
    const deduped: LinkRecord[] = [];
    [...official, ...auxiliary].forEach(link => {
        const key = `${link.url}`;
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(link);
    });

    return deduped;
}

export function describeSources() {
    return {
        officialCount: officialSources.length,
        auxiliaryCount: auxiliaryServices.length,
        linksCount: getLinkManifest().length,
    };
}

// TODO: Usar este manifest para exibir status de links em componentes quando a integração visual for liberada.
