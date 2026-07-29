/**
 * Catálogo complementar de nichos (Dias 1–30).
 * Mantido separado de resources.ts para reduzir conflitos de merge.
 */
export const nicheResources = [
  // Finanças (~12)
  {
    name: 'Calculadora do Cidadão (BCB)',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Simule financiamentos, aplicações, valor futuro e correção de valores com a ferramenta oficial do Banco Central.',
    url: 'https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores',
    tags: ['#Finanças', '#BCB', '#Juros', '#Simulação', '#Oficial']
  },
  {
    name: 'Educação Financeira BCB',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Conteúdos oficiais do Banco Central sobre crédito, poupança, endividamento e cidadania financeira.',
    url: 'https://www.bcb.gov.br/cidadaniafinanceira',
    tags: ['#EducaçãoFinanceira', '#BCB', '#Crédito', '#Oficial']
  },
  {
    name: 'Portal do Investidor CVM',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Orientações da CVM para investidores iniciantes, alertas de golpe e educação sobre o mercado de capitais.',
    url: 'https://www.gov.br/investidor/pt-br',
    tags: ['#Investimentos', '#CVM', '#Educação', '#Oficial']
  },
  {
    name: 'IRPF Receita Federal',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Declare o Imposto de Renda, consulte restituição e baixe o programa oficial da Receita Federal.',
    url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda',
    tags: ['#IRPF', '#Imposto', '#Receita', '#Oficial']
  },
  {
    name: 'Restituição IRPF',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Consulte se sua restituição do Imposto de Renda já foi liberada pela Receita Federal.',
    url: 'https://www.restituicao.receita.fazenda.gov.br/',
    tags: ['#Restituição', '#IRPF', '#Receita', '#Oficial']
  },
  {
    name: 'Serasa Limpa Nome',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Consulte dívidas negativadas e negocie acordos para limpar o nome com descontos.',
    url: 'https://www.serasa.com.br/limpa-nome-online/',
    tags: ['#Dívidas', '#Score', '#Negociação', '#NomeLimpo']
  },
  {
    name: 'Cadastro Positivo',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Entenda o Cadastro Positivo e como o histórico de pagamentos influencia o score de crédito.',
    url: 'https://www.gov.br/anpd/pt-br/assuntos/noticias/cadastro-positivo',
    tags: ['#Score', '#Crédito', '#CadastroPositivo']
  },
  {
    name: 'Portal do Empréstimo Consignado',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Informações oficiais sobre consignado para aposentados, pensionistas e servidores.',
    url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/emprestimo-consignado',
    tags: ['#Consignado', '#Empréstimo', '#INSS', '#Oficial']
  },
  {
    name: 'Poupança e Tesouro Direto',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Invista em títulos públicos pelo Tesouro Direto com orientação oficial do Tesouro Nacional.',
    url: 'https://www.tesourodireto.com.br/',
    tags: ['#TesouroDireto', '#Investimentos', '#Poupança', '#Oficial']
  },
  {
    name: 'Meu Crédito Habitacional Caixa',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Simule financiamento habitacional e conheça linhas de crédito da Caixa para compra de imóvel.',
    url: 'https://www.caixa.gov.br/voce/habitacao/Paginas/default.aspx',
    tags: ['#Financiamento', '#Caixa', '#Habitação', '#Crédito']
  },
  {
    name: 'Open Finance Brasil',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Saiba como o Open Finance permite compartilhar dados bancários com segurança e comparar ofertas.',
    url: 'https://openfinancebrasil.org.br/',
    tags: ['#OpenFinance', '#Bancos', '#Dados', '#Oficial']
  },
  {
    name: 'Procon Financeiro Senacon',
    category: 'financas',
    categoryLabel: 'Finanças',
    description: 'Orientações da Secretaria Nacional do Consumidor sobre cobranças abusivas, cartão e crédito.',
    url: 'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor',
    tags: ['#Consumidor', '#Crédito', '#Procon', '#Oficial']
  },

  // Imóveis (~8)
  {
    name: 'Minha Casa Minha Vida',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Consulte regras, faixas de renda e como participar do programa habitacional federal.',
    url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida',
    tags: ['#Habitação', '#MCMV', '#Imóvel', '#Oficial']
  },
  {
    name: 'Caixa Habitação',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Simule e acompanhe financiamento, FGTS na compra e serviços habitacionais da Caixa.',
    url: 'https://habitacao.caixa.gov.br/',
    tags: ['#Financiamento', '#Caixa', '#FGTS', '#Imóvel']
  },
  {
    name: 'ONR Registro de Imóveis',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Encontre cartórios de registro de imóveis e serviços digitais de matrícula em todo o Brasil.',
    url: 'https://www.registrodeimoveis.org.br/',
    tags: ['#Cartório', '#Matrícula', '#Registro', '#Oficial']
  },
  {
    name: 'SPU Patrimônio da União',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Consulte ocupação, taxa de ocupação e regularização de imóveis da União pela SPU.',
    url: 'https://www.gov.br/economia/pt-br/assuntos/patrimonio-da-uniao',
    tags: ['#SPU', '#União', '#Regularização', '#Oficial']
  },
  {
    name: 'ITBI e IPTU (orientação federal)',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Entenda impostos municipais sobre transmissão e propriedade de imóveis e onde pagar na sua cidade.',
    url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/itbi',
    tags: ['#IPTU', '#ITBI', '#Imposto', '#Imóvel']
  },
  {
    name: 'CEF Extrato FGTS Habitação',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Use o FGTS para compra, amortização ou liquidação de financiamento habitacional conforme regras da Caixa.',
    url: 'https://www.caixa.gov.br/voce/habitacao/fgts/Paginas/default.aspx',
    tags: ['#FGTS', '#Habitação', '#Amortização', '#Caixa']
  },
  {
    name: 'Portal de Serviços Cartorários',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Localize cartórios e tipos de ato para escritura, inventário e documentação imobiliária.',
    url: 'https://www.cnj.jus.br/corregedoria/justica-aberta/',
    tags: ['#Cartório', '#Escritura', '#CNJ', '#Oficial']
  },
  {
    name: 'Aluguel social e moradia (Cidades)',
    category: 'imoveis',
    categoryLabel: 'Imóveis',
    description: 'Conheça políticas de habitação de interesse social e programas do Ministério das Cidades.',
    url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao',
    tags: ['#Habitação', '#Aluguel', '#Moradia', '#Oficial']
  },

  // Concursos (~10)
  {
    name: 'ENEM Inep',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Inscrição, datas, cartão de confirmação e resultados do Exame Nacional do Ensino Médio.',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
    tags: ['#ENEM', '#Inep', '#Vestibular', '#Oficial']
  },
  {
    name: 'SISU',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Use a nota do ENEM para ingressar em universidades públicas pelo Sistema de Seleção Unificada.',
    url: 'https://www.gov.br/mec/pt-br/sisu',
    tags: ['#SISU', '#Universidade', '#ENEM', '#Oficial']
  },
  {
    name: 'Prouni',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Bolsas integrais e parciais em universidades privadas com base na nota do ENEM.',
    url: 'https://www.gov.br/mec/pt-br/prouni',
    tags: ['#Prouni', '#Bolsa', '#Universidade', '#Oficial']
  },
  {
    name: 'FIES',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Financiamento estudantil do governo federal para cursos superiores em instituições privadas.',
    url: 'https://www.gov.br/mec/pt-br/fies',
    tags: ['#FIES', '#Faculdade', '#Financiamento', '#Oficial']
  },
  {
    name: 'PCI Concursos',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Acompanhe editais, vagas e notícias de concursos públicos em todo o Brasil.',
    url: 'https://www.pciconcursos.com.br/',
    tags: ['#Concursos', '#Editais', '#Vagas', '#Servidor']
  },
  {
    name: 'Cebraspe',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Banca organizadora de concursos: editais, inscrições e resultados oficiais.',
    url: 'https://www.cebraspe.org.br/',
    tags: ['#Cebraspe', '#Banca', '#Concursos', '#Editais']
  },
  {
    name: 'FCC Concursos',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Fundação Carlos Chagas: concursos, processos seletivos e acompanhamento de provas.',
    url: 'https://www.fcc.org.br/',
    tags: ['#FCC', '#Concursos', '#Banca', '#Editais']
  },
  {
    name: 'FGV Concursos',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Concursos e seleções organizados pela Fundação Getulio Vargas.',
    url: 'https://conhecimento.fgv.br/concursos',
    tags: ['#FGV', '#Concursos', '#Banca', '#Editais']
  },
  {
    name: 'Concursos gov.br',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Portal oficial com informações sobre concursos e seleções no governo federal.',
    url: 'https://www.gov.br/servidor/pt-br/concursos',
    tags: ['#Concursos', '#Servidor', '#Federal', '#Oficial']
  },
  {
    name: 'CNU Concursos Unificados',
    category: 'concursos',
    categoryLabel: 'Concursos',
    description: 'Acompanhe o Concurso Nacional Unificado e demais seleções federais unificadas.',
    url: 'https://www.gov.br/gestao/pt-br/concursonacional',
    tags: ['#CNU', '#Concursos', '#Federal', '#Oficial']
  },

  // Transporte (~10)
  {
    name: 'Senatran Serviços Digitais',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Portal nacional de trânsito: CRLV digital, transferência, consulta de veículos e mais.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito',
    tags: ['#Senatran', '#Trânsito', '#CRLV', '#Oficial']
  },
  {
    name: 'DETRAN Rio de Janeiro',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'CNH, IPVA, licenciamento, multas e agendamentos do DETRAN-RJ.',
    url: 'https://www.detran.rj.gov.br/',
    tags: ['#DETRAN', '#RJ', '#CNH', '#IPVA', '#Oficial']
  },
  {
    name: 'DETRAN São Paulo',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Serviços de CNH, veículo, IPVA e atendimento do DETRAN-SP.',
    url: 'https://www.detran.sp.gov.br/',
    tags: ['#DETRAN', '#SP', '#CNH', '#IPVA', '#Oficial']
  },
  {
    name: 'IPVA Rio de Janeiro',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Consulte e pague o IPVA do estado do Rio de Janeiro pelo portal da SEFAZ-RJ.',
    url: 'https://www.fazenda.rj.gov.br/sefaz/faces/menu_structure/servicos/menu-ipva',
    tags: ['#IPVA', '#RJ', '#Imposto', '#Veículo', '#Oficial']
  },
  {
    name: 'IPVA São Paulo',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Consulta e pagamento do IPVA paulista pela Secretaria da Fazenda de SP.',
    url: 'https://www.ipva.fazenda.sp.gov.br/IPVANET_Consulta/',
    tags: ['#IPVA', '#SP', '#Imposto', '#Veículo', '#Oficial']
  },
  {
    name: 'SNE Sistema de Notificação Eletrônica',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Receba notificações de trânsito por e-mail e SMS e evite perder prazos de recurso.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/sne',
    tags: ['#Multas', '#Notificação', '#Trânsito', '#Oficial']
  },
  {
    name: 'Primeira habilitação (orientação)',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Passo a passo nacional para tirar a primeira CNH: exames, aulas e prova teórica.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-Senatran/condutores',
    tags: ['#CNH', '#Habilitação', '#PrimeiraHabilitação', '#Oficial']
  },
  {
    name: 'Riocard Mais',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Recarga, bilhete único e informações do transporte público da Região Metropolitana do Rio.',
    url: 'https://www.riocardmais.com.br/',
    tags: ['#Ônibus', '#Metrô', '#Rio', '#Bilhete']
  },
  {
    name: 'SPTrans / Bilhete Único',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Bilhete Único, linhas e atendimento do transporte público de São Paulo.',
    url: 'https://www.sptrans.com.br/',
    tags: ['#Ônibus', '#SP', '#BilheteÚnico', '#Transporte']
  },
  {
    name: 'ANTT Passageiros',
    category: 'transporte',
    categoryLabel: 'Transporte',
    description: 'Regulação de transporte rodoviário interestadual: direitos do passageiro e reclamações.',
    url: 'https://www.gov.br/antt/pt-br/assuntos/passageiros',
    tags: ['#ANTT', '#Ônibus', '#Viagem', '#Oficial']
  },

  // Casa e consumo (~10)
  {
    name: 'Aneel Consumidor',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Direitos do consumidor de energia elétrica, tarifas e canais de reclamação da Aneel.',
    url: 'https://www.gov.br/aneel/pt-br/assuntos/consumidor',
    tags: ['#Energia', '#Aneel', '#ContaDeLuz', '#Oficial']
  },
  {
    name: 'Anatel Consumidor',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Reclamações e direitos em telefonia, internet e TV por assinatura junto à Anatel.',
    url: 'https://www.gov.br/anatel/pt-br/consumidor',
    tags: ['#Internet', '#Telefone', '#Anatel', '#Oficial']
  },
  {
    name: 'Senacon Direitos do Consumidor',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Portal do Ministério da Justiça com direitos do consumidor, Procon e legislação.',
    url: 'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor',
    tags: ['#Procon', '#Consumidor', '#Direitos', '#Oficial']
  },
  {
    name: 'Procon SP',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Orientação, reclamação e pesquisa de preços do Procon do estado de São Paulo.',
    url: 'https://www.procon.sp.gov.br/',
    tags: ['#Procon', '#SP', '#Reclamação', '#Oficial']
  },
  {
    name: 'Procon Rio',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Atendimento ao consumidor no estado do Rio de Janeiro: reclamações e mediação.',
    url: 'https://www.procon.rj.gov.br/',
    tags: ['#Procon', '#RJ', '#Reclamação', '#Oficial']
  },
  {
    name: 'Plano Nacional de Resíduos Sólidos',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Orientações sobre descarte correto, logística reversa e resíduos eletrônicos.',
    url: 'https://www.gov.br/mma/pt-br/assuntos/agendaambientalurbana/lixo-zero',
    tags: ['#Descarte', '#MeioAmbiente', '#Reciclagem', '#Oficial']
  },
  {
    name: 'Casa Verde e Amarela (histórico e habitação)',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Informações do governo sobre programas de habitação e reforma residencial de interesse social.',
    url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao',
    tags: ['#Habitação', '#Reforma', '#Casa', '#Oficial']
  },
  {
    name: 'Água e saneamento (MDR)',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Políticas de saneamento básico e acesso à água tratada no Brasil.',
    url: 'https://www.gov.br/cidades/pt-br/assuntos/saneamento',
    tags: ['#Água', '#Saneamento', '#Conta', '#Oficial']
  },
  {
    name: 'Gasolina e GLP (ANP)',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Pesquisa de preços de combustíveis e GLP pela Agência Nacional do Petróleo.',
    url: 'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos',
    tags: ['#Combustível', '#GLP', '#ANP', '#Preços', '#Oficial']
  },
  {
    name: 'Reclame Aqui (consulta pública)',
    category: 'casa',
    categoryLabel: 'Casa e consumo',
    description: 'Consulte reputação de empresas e acompanhe reclamações de consumo antes de comprar.',
    url: 'https://www.reclameaqui.com.br/',
    tags: ['#Reclamação', '#Consumidor', '#Empresas', '#Avaliação']
  }
] as const;
