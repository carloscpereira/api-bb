import * as VMask from 'vanilla-masker';
import puppeteer from 'puppeteer';
import moment from 'moment';
import generateLinhaDigitavel from '../services/generateLinhaDigitavel';
import ZeroLeft from '../services/completarZeroEsquerda';

class BoletoController {
  async index(req, res) {
    const {
      params: { id },
      query: { format, instrucoes },
      api,
      bank: {
        convenio,
        logotipo,
        razaoSocial,
        cnpj,
        agencia,
        conta,
        digitoAgencia,
        api: { developer_application_key },
      },
    } = req;

    const { data: boleto } = await api.get(`/boletos/${id}`, {
      params: {
        'gw-dev-app-key': developer_application_key,
        numeroConvenio: convenio,
      },
    });

    const linhaDigitavel = generateLinhaDigitavel({
      codigoBarras: boleto.textoCodigoBarrasTituloCobranca,
      vencimento: moment(boleto.dataVencimentoTituloCobranca, 'DD.MM.YYYY').format('DD/MM/YYYY'),
      valor: boleto.valorOriginalTituloCobranca,
    });

    const codigoFormatado = VMask.toPattern(linhaDigitavel, '99999.99999 99999.999999 99999.999999 9 99999999999999');
    const varPug = {
      ...boleto,
      linhaDigitavelFormatado: codigoFormatado,
      linhaDigitavel,
      vencimentoBoleto: moment(boleto.dataVencimentoTituloCobranca, 'DD.MM.YYYY').format('MM/YYYY'),
      logotipo,
      razaoSocial,
      cnpj,
      agencia,
      conta,
      digitoAgencia,
      instrucoes,
      nossoNumero: id,
      sacado: {
        ...boleto.sacado,
        numeroCepSacadoCobranca: VMask.toPattern(
          ZeroLeft({ numero: boleto.sacado.numeroCepSacadoCobranca, tamanho: 8 }),
          '99999-999'
        ),
        numeroInscricaoSacadoCobranca: ZeroLeft({ tamanho: 11, numero: boleto.sacado.numeroInscricaoSacadoCobranca }),
        numeroInscricaoSacadoCobrancaFormatado:
          boleto.sacado.codigoTipoInscricaoSacado === 1
            ? VMask.toPattern(
                ZeroLeft({ numero: boleto.sacado.numeroInscricaoSacadoCobranca, tamanho: 11 }),
                '999.999.999-99'
              )
            : VMask.toPattern(boleto.sacado.numeroInscricaoSacadoCobranca.toString(), '99.999.999/9999-99'),
      },
    };

    if (!format) {
      return res.render('boleto', varPug);
    }

    return res.render('boleto', varPug, async (err, html) => {
      if (err) {
        throw err;
      }

      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '40px',
          bottom: '20px',
          left: '40px',
          right: '20px',
        },
      });

      await browser.close();

      if (format === 'pdf') {
        res.header('Content-Type', 'application/pdf');
        res.header('Content-Transfer-Encoding', 'binary');
        res.header('Content-Disposition', `inline; filename=boleto.pdf`);
        res.send(pdf);
      } else {
        res.json({ data: pdf.toString('base64') });
      }
    });
  }
}

export default new BoletoController();
