export default ({ tamanho = 21, numero }) => {
  let numeroString = typeof numero === 'string' ? numero : numero.toString(10);
  numeroString = numeroString.replace(/\D/gim, '');

  if (numeroString.length < tamanho) {
    const diff = tamanho - numeroString.length;

    for (let i = diff; i > 0; i -= 1) {
      numeroString = `0${numeroString}`;
    }
  }

  return numeroString;
};
