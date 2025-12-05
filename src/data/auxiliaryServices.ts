export type AuxiliaryService = {
    id: string;
    name: string;
    provider: string;
    category: 'dataset' | 'guidance' | 'financing' | 'international-corridor';
    description: string;
    datasetUrl?: string;
    docsUrl?: string;
    geography?: string;
    language?: 'pt-BR' | 'en';
    tags?: string[];
    checkable?: boolean;
};

export const auxiliaryServices: AuxiliaryService[] = [
    {
        id: 'anp-autorizacoes',
        name: 'ANP - Autorizacoes e registros',
        provider: 'ANP',
        category: 'guidance',
        description: 'Consulta a autorizações, registros e atos administrativos de produção e movimentação de hidrogênio.',
        datasetUrl: 'https://www.gov.br/anp/pt-br/assuntos/producao-de-hidrogenio',
        docsUrl: 'https://www.gov.br/anp/pt-br/assuntos/producao-de-hidrogenio/manual-de-procedimentos-para-outorga-de-autorizacao-de-producao-de-hidrogenio.pdf',
        geography: 'Brasil',
        language: 'pt-BR',
        tags: ['registros', 'autorizacoes', 'anp'],
    },
    {
        id: 'epe-painel',
        name: 'EPE - Painel Potencial H2',
        provider: 'EPE',
        category: 'dataset',
        description: 'Painel interativo com potencial técnico, energético e localização de hubs de hidrogênio.',
        datasetUrl: 'https://h2.epe.gov.br/',
        docsUrl: 'https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/fact-sheet-hidrogenio-2014-2023',
        geography: 'Brasil',
        language: 'pt-BR',
        tags: ['potencial', 'painel', 'dados'],
    },
    {
        id: 'ons-open-data-transmissao',
        name: 'ONS - Dados Abertos de Transmissao',
        provider: 'ONS',
        category: 'dataset',
        description: 'Dados de rede de transmissão, fluxo e ativos para avaliar corredores de energia e H2.',
        datasetUrl: 'https://dados.ons.org.br/dataset/transmissao',
        docsUrl: 'https://dados.ons.org.br/',
        geography: 'Brasil',
        language: 'pt-BR',
        tags: ['transmissao', 'ons', 'infraestrutura'],
    },
    {
        id: 'world-bank-ceara',
        name: 'World Bank - Hub de Hidrogenio do Ceara',
        provider: 'World Bank',
        category: 'financing',
        description: 'Projeto de apoio a infraestrutura, sustentabilidade e governança do hub de hidrogênio do Ceará.',
        datasetUrl: 'https://projects.worldbank.org/en/projects-operations/project-detail/P178543',
        docsUrl: 'https://www.worldbank.org/en/country/brazil',
        geography: 'Ceará',
        language: 'en',
        tags: ['financiamento', 'ceara', 'hub'],
    },
    {
        id: 'govnl-corredor',
        name: 'Government.nl - Corredor Nordeste-Holanda',
        provider: 'Government of the Netherlands',
        category: 'international-corridor',
        description: 'Corredor logístico de hidrogênio entre portos do Nordeste e hubs holandeses.',
        datasetUrl: 'https://www.government.nl/latest/news/2023/10/09/green-hydrogen-corridor-between-brazil-and-the-netherlands',
        docsUrl: 'https://www.government.nl/topics/climate-change',
        geography: 'Brasil-Holanda',
        language: 'en',
        tags: ['corredor', 'logistica', 'parceria'],
    },
];

export function listAuxiliaryLinks(options?: { checkableOnly?: boolean }) {
    return auxiliaryServices
        .filter(service => (options?.checkableOnly ? service.checkable !== false : true))
        .flatMap(service => {
            const links = [] as { id: string; url: string; kind: 'dataset' | 'docs'; provider: string }[];
            if (service.datasetUrl) {
                links.push({ id: `${service.id}-dataset`, url: service.datasetUrl, kind: 'dataset', provider: service.provider });
            }
            if (service.docsUrl) {
                links.push({ id: `${service.id}-docs`, url: service.docsUrl, kind: 'docs', provider: service.provider });
            }
            return links;
        });
}

// TODO: Consumir estes serviços nos fluxos de busca e painéis quando for integrar fontes oficiais na UI.
