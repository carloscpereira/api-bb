import 'dotenv/config';

import App from './app';

const port = process.env.PORT || '3337';

App.listen(port, () => {
  console.log(`Server is running to port ${port}. Environment ${process.env.NODE_ENV || 'development'}`);
});
