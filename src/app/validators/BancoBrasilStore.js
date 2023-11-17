import * as Yup from 'yup';

const tipoBoleto = [
  { cod: 1, descricao: 'CHEQUE' },
  { cod: 2, descricao: 'DUPLICATA MERCANTIL' },
  { cod: 3, descricao: 'DUPLICATA MTIL POR INDICACAO' },
  { cod: 4, descricao: 'DUPLICATA DE SERVICO' },
  { cod: 5, descricao: 'DUPLICATA DE SRVC P/INDICACAO' },
  { cod: 6, descricao: 'DUPLICATA RURAL' },
  { cod: 7, descricao: 'LETRA DE CAMBIO' },
  { cod: 8, descricao: 'NOTA DE CREDITO COMERCIAL' },
  { cod: 9, descricao: 'NOTA DE CREDITO A EXPORTACAO' },
  { cod: 10, descricao: 'NOTA DE CREDITO INDULTRIAL' },
  { cod: 11, descricao: 'NOTA DE CREDITO RURAL' },
  { cod: 12, descricao: 'NOTA PROMISSORIA' },
  { cod: 13, descricao: 'NOTA PROMISSORIA RURAL' },
  { cod: 14, descricao: 'TRIPLICATA MERCANTIL' },
  { cod: 15, descricao: 'TRIPLICATA DE SERVICO' },
  { cod: 16, descricao: 'NOTA DE SEGURO' },
  { cod: 17, descricao: 'RECIBO' },
  { cod: 18, descricao: 'FATURA' },
  { cod: 19, descricao: 'NOTA DE DEBITO' },
  { cod: 20, descricao: 'APOLICE DE SEGURO' },
  { cod: 21, descricao: 'MENSALIDADE ESCOLAR' },
  { cod: 22, descricao: 'PARCELA DE CONSORCIO' },
  { cod: 23, descricao: 'DIVIDA ATIVA DA UNIAO' },
  { cod: 24, descricao: 'DIVIDA ATIVA DE ESTADO' },
  { cod: 25, descricao: 'DIVIDA ATIVA DE MUNICIPIO' },
  { cod: 31, descricao: 'CARTAO DE CREDITO' },
  { cod: 32, descricao: 'BOLETO PROPOSTA' },
  { cod: 99, descricao: 'OUTROS' },
];

export default async (req, res, next) => {
  try {
    const regTipoBoleto = new RegExp(`^(${tipoBoleto.map((el) => el.cod).join('|')})$`);

    const schema = Yup.object().shape({
      Identificador: Yup.number().integer(),
      Modalidade: Yup.string()
        .matches(/^(1|4)$/, {
          message: 'Informe 1 para Simples e 4 para Vinculada',
        })
        .default('1'),
      DataVencimento: Yup.date().required(),
      ValorBruto: Yup.number().required(),
      ValorAbatimento: Yup.number(),
      QuantidadeDiasProtesto: Yup.number().integer().min(1),
      PagamentoAtrasado: Yup.string().matches(/^(S|N)$/, {
        message: 'Informe S para permitir pagamento após o prazo de Validade ou N para não permitir',
      }),
      LimiteRecebimento: Yup.number()
        .integer()
        .min(1)
        .when('PagamentoAtrasado', (pa, s) => (pa === 'S' ? s.required() : s)),
      CodigoAceite: Yup.string().matches(/^(A|N)$/, {
        message: 'Informe A para Aceite e N para Não aceite',
      }),
      TipoTitulo: Yup.string()
        .matches(regTipoBoleto, {
          message: `Valores possíveis: ${tipoBoleto.map((el) => `${el.cod} - ${el.descricao}`).join(';')}`,
        })
        .required(),
      DescricaoTitulo: Yup.string(),
      PagamentoParcial: Yup.string().matches(/^(S|N)$/, {
        message: 'Informe `S` para Sim e `N` para não',
      }),
      InfoBeneficiario: Yup.string().max(30),
      NossoNumero: Yup.string().max(10),
      TextoBoleto: Yup.string().max(30),
      DiasNegativacao: Yup.number().integer().min(1),
      Email: Yup.array().of(Yup.string().email()),
      JurosMora: Yup.object({
        Tipo: Yup.string()
          .matches(/^(0|1|2|3)$/, {
            message: 'Valores possíveis: 0 - Dispensar; 1 - Valor dia atraso; 2 - Taxa mensal; 3 - Isento.',
          })
          .default('0'),
        Porcentagem: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 2 ? s.required() : s)),
        Valor: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 1 ? s.required() : s)),
      }),
      Multa: Yup.object({
        Tipo: Yup.string()
          .matches(/^(0|1|2)$/, {
            message: 'Valores possíveis: 0 - Sem multa; 1 - Valor da multa; 2 - Percentual da multa',
          })
          .default('0'),
        Data: Yup.date().when('Tipo', (t, s) => (parseInt(t, 10) > 0 ? s.required() : s)),
        Porcentagem: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 2 ? s.required() : s)),
        Valor: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 1 ? s.required() : s)),
      }),
      Desconto: Yup.object({
        Tipo: Yup.string().matches(/^(0|1|2)$/, {
          message:
            'Valores possíveis: 0 - Sem desconto; 1 - Valor fixo até a data informada; 2 - Percentual até a data informada',
        }),
        Expiracao: Yup.date().when('Tipo', (t, s) => (parseInt(t, 10) > 0 ? s.required() : s)),
        Porcentagem: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 2 ? s.required() : s)),
        Valor: Yup.number().when('Tipo', (t, s) => (parseInt(t, 10) === 1 ? s.required() : s)),
      }),
      Pagador: Yup.object({
        Tipo: Yup.string().matches(/^(1|2)$/, {
          message: 'Informe 1 para Pessoa Física e 2 para Pessoa Jurídica',
        }),
        Nome: Yup.string().required(),
        Documento: Yup.string().required(),
        Estado: Yup.string().max(2).required(),
        Cidade: Yup.string().required(),
        Bairro: Yup.string().required(),
        Endereco: Yup.string().required(),
        Cep: Yup.string()
          .length(8)
          .matches(/^(\d){8}$/)
          .required(),
        Telefone: Yup.string().max(30),
      }),
      Avalista: Yup.object({
        Tipo: Yup.string()
          .matches(/^(1|2)$/, {
            message: 'Informe 1 para Pessoa Física e 2 para Pessoa Jurídica',
          })
          .required(),
        Documento: Yup.string().required(),
        RazaoSocial: Yup.string().max(30).required(),
      })
        .notRequired()
        .default(null)
        .nullable(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (error) {
    return res.status(401).json({
      error: 401,
      data: {
        error: 'Validation fails',
        message: error.inner,
      },
    });
  }
};
