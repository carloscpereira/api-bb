export default ({ nossoNumero, convenio }) => {
  let numRand = nossoNumero || Math.floor(Math.random() * 9999999999 + 1).toString();

  /**
   * Garante que o número randomico sempre terá 10 dígitos
   */
  if (numRand.length < 10) {
    const diff = 10 - numRand.length;
    for (let i = 0; i < diff; i += 1) {
      numRand = `0${numRand}`;
    }
  }

  return `000${convenio || process.env.BB_CONVENIO}${numRand}`;
};
