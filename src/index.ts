import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './utils/middleware/error.middleware';
import { mongoose } from '@typegoose/typegoose';
import { ConnectOptions } from 'mongoose';
const eFileUpload = require('express-fileupload');
import path from 'path';
import fs from 'fs';


(async () => {
  const mainRoutes = require('./mainRoutes');

  const app: Application = express();

  // Ensure 'uploads' directory exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  app.use(cors({ origin: '*' }));
  app.use(helmet());
  app.use(express.json({ limit: '5000mb' }));
  app.use(
    express.urlencoded({
      limit: '5000mb',
      extended: true,
      parameterLimit: 50000000,
    })
  );

  mongoose
    .connect(
      "mongodb+srv://techiteeha:WeYl8zXdBqLsUaku@cluster0.xzhtsar.mongodb.net/Iteeha?retryWrites=true&w=majority",
      // // "mongodb+srv://techiteeha:WeYl8zXdBqLsUaku@cluster0.xzhtsar.mongodb.net/Zanes?retryWrites=true&w=majority",
      // "mongodb+srv://vikasraj:Future@cluster0.8gnmr.mongodb.net/Iteeha_DB?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
      } as ConnectOptions
    )
    .then(() => {
      console.log('Connected to database!');
    })
    .catch((error) => {
      console.log('Connection failed!', error);
    });

  mongoose.set('debug', false);

  app.use(eFileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));


  app.use('/status', (req, res, next) => {
    res.send({ success: true, message: 'Success' });
  });

  app.use('/api', mainRoutes);

  app.use(errorHandler);

  const port = process.env.PORT || 4060;

  var server = app.listen(port, () =>
    console.log(`API server started at http://localhost:${port}`)
  );
})();
