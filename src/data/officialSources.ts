export type OfficialSource = {
    id: string;
    owner: 'MME' | 'ANP' | 'EPE' | 'ONS' | 'World Bank' | 'Government of the Netherlands';
    title: string;
    url: string;
    category: 'law' | 'regulation' | 'guidance' | 'dashboard' | 'planning' | 'international';
    summary: string;
    geography?: string;
    coverage?: string;
    updated?: string;
    language?: 'pt-BR' | 'en';
    tags?: string[];
    checkable?: boolean;
};

export const officialSources: OfficialSource[] = [
    {
        id: 'mme-lei-14948-2024',
        owner: 'MME',
        title: 'Lei 14.948/2024 - Política Nacional do Hidrogênio',
        url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14948.htm',
        category: 'law',
        summary: 'Institui a Política Nacional do Hidrogênio e diretrizes para incentivos e governança.',
        geography: 'Brasil',
        coverage: 'Regulação federal',
        updated: '2024-08',
        language: 'pt-BR',
        tags: ['PNH2', 'incentivos', 'governanca'],
    },
    {
        id: 'mme-lei-14990-2024',
        owner: 'MME',
        title: 'Lei 14.990/2024 - Diretrizes para mercado de H2',
        url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14990.htm',
        category: 'law',
        summary: 'Estabelece diretrizes para desenvolvimento do mercado de hidrogênio de baixo carbono e instrumentos de planejamento.',
        geography: 'Brasil',
        coverage: 'Regulação federal',
        updated: '2024-10',
        language: 'pt-BR',
        tags: ['mercado', 'planejamento', 'baixo carbono'],
    },
    {
        id: 'anp-manual-hidrogenio',
        owner: 'ANP',
        title: 'ANP - Manual para autorização de produção de hidrogênio',
        url: 'https://www.gov.br/anp/pt-br/assuntos/producao-de-hidrogenio/manual-de-procedimentos-para-outorga-de-autorizacao-de-producao-de-hidrogenio.pdf',
        category: 'guidance',
        summary: 'Procedimentos oficiais para outorga de autorização de produção de hidrogênio.',
        geography: 'Brasil',
        coverage: 'Autorização de produção',
        updated: '2024-09',
        language: 'pt-BR',
        tags: ['anp', 'outorga', 'producao'],
    },
    {
        id: 'anp-pagina-tecnica-h2',
        owner: 'ANP',
        title: 'ANP - Página técnica de hidrogênio',
        url: 'https://www.gov.br/anp/pt-br/assuntos/producao-de-hidrogenio',
        category: 'regulation',
        summary: 'Centraliza normas, autorizações e consultas públicas sobre hidrogênio.',
        geography: 'Brasil',
        coverage: 'Referências técnicas',
        updated: '2024-11',
        language: 'pt-BR',
        tags: ['anp', 'regulacao', 'referencia'],
    },
    {
        id: 'epe-painel-potencial-h2',
        owner: 'EPE',
        title: 'EPE - Painel Potencial do Hidrogênio',
        url: 'https://h2.epe.gov.br/',
        category: 'dashboard',
        summary: 'Painel interativo com potencial técnico e oferta de H2 em diferentes regiões.',
        geography: 'Brasil',
        coverage: '2014-2023',
        updated: '2024-07',
        language: 'pt-BR',
        tags: ['potencial', 'painel', 'epe'],
    },
    {
        id: 'epe-fact-sheet-2014-2023',
        owner: 'EPE',
        title: 'EPE - Fact Sheet Hidrogênio 2014-2023',
        url: 'https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/fact-sheet-hidrogenio-2014-2023',
        category: 'dashboard',
        summary: 'Ficha resumida com séries históricas de produção e uso de hidrogênio.',
        geography: 'Brasil',
        coverage: '2014-2023',
        updated: '2024-06',
        language: 'pt-BR',
        tags: ['series historicas', 'fato', 'epe'],
    },
    {
        id: 'ons-dados-abertos-transmissao',
        owner: 'ONS',
        title: 'ONS - Dados abertos de transmissão',
        url: 'https://dados.ons.org.br/dataset/transmissao',
        category: 'planning',
        summary: 'Dados de rede de transmissão úteis para corredores logísticos de H2.',
        geography: 'Brasil',
        coverage: 'Rede de transmissao',
        updated: '2024-11',
        language: 'pt-BR',
        tags: ['ons', 'transmissao', 'infraestrutura'],
    },
    {
        id: 'ons-par-pel',
        owner: 'ONS',
        title: 'ONS - PAR e PEL',
        url: 'https://portal.ons.org.br/planejamento-da-operacao/plano-da-operacao',
        category: 'planning',
        summary: 'Planos Anual e de Expansão de Longo Prazo para operação do sistema interligado.',
        geography: 'Brasil',
        coverage: 'Planejamento do SIN',
        updated: '2024-10',
        language: 'pt-BR',
        tags: ['planejamento', 'par', 'pel'],
    },
    {
        id: 'world-bank-projeto-ceara',
        owner: 'World Bank',
        title: 'World Bank - Projeto hub de hidrogênio no Ceará',
        url: 'https://projects.worldbank.org/en/projects-operations/project-detail/P178543',
        category: 'international',
        summary: 'Projeto focado em infraestrutura e governança para o hub de hidrogênio do Ceará.',
        geography: 'Ceará',
        coverage: 'Investimento e governanca',
        updated: '2024-05',
        language: 'en',
        tags: ['financiamento', 'infraestrutura', 'ceara'],
    },
    {
        id: 'govnl-corredor-ne-holanda',
        owner: 'Government of the Netherlands',
        title: 'Government.nl - Corredor Nordeste-Holanda',
        url: 'https://www.government.nl/latest/news/2023/10/09/green-hydrogen-corridor-between-brazil-and-the-netherlands',
        category: 'international',
        summary: 'Iniciativa bilateral para corredor logístico de hidrogênio entre o Nordeste brasileiro e portos holandeses.',
        geography: 'Brasil-Holanda',
        coverage: 'Logistica internacional',
        updated: '2023-10',
        language: 'en',
        tags: ['corredor', 'logistica', 'parceria'],
    },
];

export function findSourceById(id: string): OfficialSource | undefined {
    return officialSources.find(source => source.id === id);
}

export function listOfficialLinks(options?: { checkableOnly?: boolean }) {
    return officialSources
        .filter(source => (options?.checkableOnly ? source.checkable !== false : true))
        .map(source => ({
            id: source.id,
            url: source.url,
            owner: source.owner,
            category: source.category,
        }));
}

// TODO: Conectar estas fontes aos cards de informação ou filtros existentes quando for hora de exibir os links oficiais na UI.
