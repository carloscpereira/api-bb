import moment from 'moment';

const getDigitoVerificador = ({ campo, multiplicadorInicial: init, multiplicadorFinal: end }) => {
  const fixCampo = typeof campo === 'string' ? campo.replace(/\D/gim, '') : campo.toString(10).replace(/\D/, '');
  const asc = init < end;
  let ctrCount = init;
  const arrCampo = fixCampo.split('');

  const multiply = arrCampo
    .map((el) => {
      let value = el;
      if (asc) {
        ctrCount = ctrCount <= end ? ctrCount : init;
        value = el * ctrCount;
        ctrCount += 1;
      } else {
        ctrCount = ctrCount >= end ? ctrCount : init;
        value = el * ctrCount;
        ctrCount -= 1;
      }

      return value;
    })
    .join('');

  const resultSoma = multiply
    .toString()
    .split('')
    .map((el) => parseInt(el, 10))
    .reduce((a, p) => a + p, 0);

  const restoDivisao = resultSoma % 10;
  const proximaDezena = (Math.floor(resultSoma / 10) + 1) * 10;

  return (proximaDezena - restoDivisao) % 10;
};

const getDigitoVerificadorCodigoBarras = (codigoBarras) => {
  const fixCodigoBarras =
    typeof codigoBarras === 'string' ? codigoBarras.replace(/\D/gim, '') : codigoBarras.toString(10).replace(/\D/, '');

  const init = 2;
  const end = 9;
  let ctrCount = init;
  const arrCampo = fixCodigoBarras.split('').reverse();

  if (arrCampo.length === 44) return arrCampo.reverse().join('').substring(4, 5);

  const multiply = arrCampo.map((el) => {
    ctrCount = ctrCount <= end ? ctrCount : init;
    const value = el * ctrCount;
    ctrCount += 1;
    return value;
  });

  const somaTotal = multiply.map((el) => parseInt(el, 10)).reduce((a, p) => a + p, 0);
  const restoDivisao = somaTotal % 11;
  const subtracao = 11 - restoDivisao;

  return subtracao > 0 && subtracao < 10 ? subtracao : 1;
};

const addZeroToLeft = (value, size) => {
  let newValue = value.toString();
  if (newValue.length === parseInt(size, 10)) return newValue;
  const sizeDiff = size - newValue.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sizeDiff; i++) {
    newValue = `0${newValue}`;
  }

  return newValue;
};

const fatorVencimento = (vencimento) => {
  const base = moment('07/10/1997', 'DD/MM/YYYY');
  const newVencimento = moment(vencimento, 'DD/MM/YYYY');

  const diference = newVencimento.diff(base, 'days');

  const inteiro = Math.trunc(diference / 10 ** (diference.toString().length - 4));

  const resto = diference % 10 ** (diference.toString().length - 4);

  return addZeroToLeft(inteiro + resto, 4);
};

export default ({ codigoBarras, vencimento, valor }) => {
  if (!codigoBarras || !vencimento || !valor) return 0;

  const fixCodigoBarras =
    typeof codigoBarras === 'string' ? codigoBarras.replace(/\D/gim, '') : codigoBarras.toString(10).replace(/\D/, '');

  if (fixCodigoBarras.length !== 44) {
    console.log('entrei aqui');
    throw new Error('O código de barras deve ser composto por exatamente 44 dígitos');
  }

  const primeiroCampo = `${fixCodigoBarras.substring(0, 4)}${fixCodigoBarras.substring(19, 24)}`;
  const primeiroCampoDV = getDigitoVerificador({
    campo: primeiroCampo,
    multiplicadorInicial: 2,
    multiplicadorFinal: 1,
  });
  const segundoCampo = `${fixCodigoBarras.substring(24, 34)}`;
  const segundoCampoDV = getDigitoVerificador({
    campo: segundoCampo,
    multiplicadorInicial: 1,
    multiplicadorFinal: 2,
  });
  const terceiroCampo = `${fixCodigoBarras.substring(34)}`;
  const terceiroCampoDV = getDigitoVerificador({
    campo: terceiroCampo,
    multiplicadorInicial: 1,
    multiplicadorFinal: 2,
  });
  const digitoVerificador = getDigitoVerificadorCodigoBarras(fixCodigoBarras);

  const valorBoleto = addZeroToLeft(parseFloat(valor).toFixed(2).replace(/\D/gim, ''), 10);
  const fVencimento = fatorVencimento(vencimento);

  return `${primeiroCampo}${primeiroCampoDV}${segundoCampo}${segundoCampoDV}${terceiroCampo}${terceiroCampoDV}${digitoVerificador}${fVencimento}${valorBoleto}`;
};
