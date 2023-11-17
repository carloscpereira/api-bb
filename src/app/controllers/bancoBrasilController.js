import moment from 'moment';

import generatorNossoNumero from '../services/generateNossoNumero';

class BancoBrasilController {
  async index(req, res) {
    const {
      query: {
        boletoVencido,
        estadoBoleto = '01',
        dataFimMovimento,
        dataInicioMovimento,
        dataFimRegistro,
        dataInicioRegistro,
        dataFimVencimento,
        dataInicioVencimento,
        digitoCPFPagador,
        cpfPagador,
        digitoCNPJPagador,
        indicadorSituacao = 'A',
        cnpjPagador,
        modalidadeCobranca = '01',
        variacaoCarteiraConvenio,
        carteiraConvenio,
        indice = 0,
        tipo,
      },
      bank: {
        agencia,
        conta,
        api: { developer_application_key },
      },
      api,
    } = req;

    console.time('Requisição Lista Boletos');
    const { data: listBoleto } = await api.get('/boletos', {
      params: {
        'gw-dev-app-key': developer_application_key,
        agenciaBeneficiario: agencia,
        contaBeneficiario: conta,
        indice,
        ...(indicadorSituacao ? { indicadorSituacao } : {}),
        ...(boletoVencido ? { boletoVencido } : {}),
        ...(estadoBoleto ? { codigoEstadoTituloCobranca: estadoBoleto } : {}),
        ...(dataFimMovimento ? { dataFimMovimento } : {}),
        ...(dataInicioMovimento ? { dataInicioMovimento } : {}),
        ...(dataFimRegistro ? { dataFimRegistro } : {}),
        ...(dataInicioRegistro ? { dataInicioRegistro } : {}),
        ...(dataFimVencimento ? { dataFimVencimento } : {}),
        ...(dataInicioVencimento ? { dataInicioVencimento } : {}),
        ...(digitoCPFPagador ? { digitoCPFPagador } : {}),
        ...(cpfPagador ? { cpfPagador } : {}),
        ...(digitoCNPJPagador ? { digitoCNPJPagador } : {}),
        ...(cnpjPagador ? { cnpjPagador } : {}),
        ...(modalidadeCobranca ? { modalidadeCobranca } : {}),
        ...(variacaoCarteiraConvenio ? { variacaoCarteiraConvenio } : {}),
        ...(carteiraConvenio ? { carteiraConvenio } : {}),
        ...(tipo ? { tipo } : {}),
      },
    });
    console.timeEnd('Requisição Lista Boletos');
    return res.json({ error: null, data: listBoleto });
  }

  async show(req, res) {
    const {
      params: { id },
      bank: {
        convenio,
        api: { developer_application_key },
      },
      api,
    } = req;

    const { data: boleto } = await api.get(`/boletos/${id}`, {
      params: {
        'gw-dev-app-key': developer_application_key,
        numeroConvenio: convenio,
      },
    });

    return res.json({ error: null, data: boleto });
  }

  async store(req, res) {
    const {
      body: {
        Identificador = null,
        Modalidade = null,
        DataVencimento = null,
        ValorBruto = null,
        ValorAbatimento = null,
        QuantidadeDiasProtesto = null,
        PagamentoAtrasado = null,
        LimiteRecebimento = null,
        CodigoAceite = null,
        TipoTitulo = null,
        DescricaoTitulo = null,
        PagamentoParcial = null,
        InfoBeneficiario = null,
        NossoNumero = null,
        TextoBoleto = null,
        JurosMora = {},
        Multa = {},
        Desconto = {},
        Pagador = {},
        Avalista = {},
        DiasNegativacao = null,
        Email = [],
      },
      bank: {
        convenio,
        carteira,
        variacaoCarteira,
        api: { developer_application_key },
      },
    } = req;

    const {
      Tipo: multaTipo = 0,
      Data: multaData = null,
      Porcentagem: multaPorcentagem = null,
      Valor: multaValor = null,
    } = Multa;

    const {
      Tipo: descontoTipo = 0,
      Expiracao: descontoExpiracao = null,
      Porcentagem: descontoPorcentagem = null,
      Valor: descontoValor = null,
    } = Desconto;

    const { Tipo: jurosTipo = 0, Porcentagem: jurosPorcentagem = null, Valor: jurosValor = null } = JurosMora;

    const {
      Tipo: pagadorTipo = 1,
      Nome: pagadorNome = null,
      Documento: pagadorDocumento = null,
      Bairro: pagadorBairro = null,
      Estado: pagadorEstado = null,
      Cidade: pagadorCidade = null,
      Endereco: pagadorEndereco = null,
      Cep: pagadorCep = null,
      Telefone: pagadorTelefone = null,
    } = Pagador;

    const { Tipo: avalistaTipo, Documento: avalistaDocumento, RazaoSocial: avalistaRazaoSocial } = Avalista;

    const data = {
      numeroConvenio: convenio,
      numeroCarteira: carteira,
      numeroVariacaoCarteira: variacaoCarteira,
      codigoModalidade: Modalidade || 1,
      dataEmissao: moment(new Date()).format('DD.MM.YYYY'),
      dataVencimento: moment(DataVencimento).format('DD.MM.YYYY'),
      valorOriginal: ValorBruto,
      ...(ValorAbatimento ? { valorAbatimento: ValorAbatimento } : {}),
      ...(QuantidadeDiasProtesto ? { quantidadeDiasProtesto: QuantidadeDiasProtesto } : {}),
      ...(PagamentoAtrasado ? { indicadorNumeroDiasLimiteRecebimento: PagamentoAtrasado } : {}),
      ...(LimiteRecebimento ? { numeroDiasLimiteRecebimento: LimiteRecebimento } : {}),
      codigoAceite: CodigoAceite || 'A',
      codigoTipoTitulo: TipoTitulo,
      ...(DescricaoTitulo ? { descricaoTipoTitulo: DescricaoTitulo } : {}),
      indicadorPermissaoRecebimentoParcial: PagamentoParcial || 'N',
      ...(Identificador ? { numeroTituloBeneficiario: Identificador } : {}),
      ...(InfoBeneficiario ? { textoCampoUtilizacaoBeneficiario: InfoBeneficiario } : {}),
      numeroTituloCliente: generatorNossoNumero({ nossoNumero: NossoNumero, convenio }),
      ...(TextoBoleto ? { textoMensagemBloquetoOcorrencia: TextoBoleto } : {}),
      desconto: {
        tipo: descontoTipo,
        ...(descontoExpiracao ? { dataExpiracao: descontoExpiracao } : {}),
        ...(descontoPorcentagem ? { porcentagem: descontoPorcentagem } : {}),
        ...(descontoValor ? { valor: descontoValor } : {}),
      },
      jurosMora: {
        tipo: jurosTipo,
        ...(jurosPorcentagem ? { porcentagem: jurosPorcentagem } : {}),
        ...(jurosValor ? { valor: jurosValor } : {}),
      },
      multa: {
        tipo: multaTipo,
        ...(multaData ? { data: multaData } : {}),
        ...(multaPorcentagem ? { porcentagem: multaPorcentagem } : {}),
        ...(multaValor ? { valor: multaValor } : {}),
      },
      pagador: {
        tipoRegistro: pagadorTipo,
        numeroRegistro: pagadorDocumento,
        nome: pagadorNome,
        endereco: pagadorEndereco,
        cep: pagadorCep,
        cidade: pagadorCidade,
        bairro: pagadorBairro,
        uf: pagadorEstado,
        ...(pagadorTelefone ? { telefone: pagadorTelefone } : {}),
      },
      ...(avalistaTipo
        ? {
            avalista: {
              tipoRegistro: avalistaTipo,
              numeroRegistro: avalistaDocumento,
              nomeRegistro: avalistaRazaoSocial,
            },
          }
        : {}),
      ...(Email.length > 0 ? { email: Email.join(',') } : {}),
      ...(DiasNegativacao ? { quantidadeDiasNegativacao: DiasNegativacao } : {}),
    };

    const { data: boleto } = await req.api.post('/boletos', data, {
      params: {
        'gw-dev-app-key': developer_application_key,
      },
    });

    return res.json({ error: null, data: boleto });
  }

  async destroy(req, res) {
    const {
      params: { id },
      api,
      bank: {
        convenio,
        api: { developer_application_key },
      },
    } = req;

    const { data: response } = await api.post(
      `/boletos/${id}/baixar`,
      { numeroConvenio: convenio },
      {
        params: {
          'gw-dev-app-key': developer_application_key,
        },
      }
    );

    return res.json({ error: null, data: response });
  }
}

export default new BancoBrasilController();
