import listBank from '../../config/bancoBrasil';

export default async (req, res, next) => {
  const {
    params: { banco = 'idental' },
  } = req;

  const checkBankRegister = listBank.find((b) => b.nome === banco.toLowerCase());

  if (!checkBankRegister) {
    throw new Error('Bank not registered in our application.');
  }

  const isProd = process.env.NODE_ENV === 'production';

  const bank = {
    ...checkBankRegister,
    api: checkBankRegister[isProd ? 'production' : 'development'],
  };

  req.bank = bank;

  return next();
};
