import '@babel/polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import elasticsearch from 'elasticsearch';
import checkEmptyPayload from './middlewares/check-empty-payload';
import checkContentTypeIsSet from './middlewares/check-content-type-is-set';
import checkContentTypeIsJson from './middlewares/check-content-type-is-json';
import errorHandler from './middlewares/error-handler';

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`,
  log: {
    type: 'stream',
    level: 'error',
    stream: process.stdout,
  },
});

const app = express();

app.use(bodyParser.json({ limit: Number(process.env.PAYLOAD_LIMIT) }));

app.use(checkEmptyPayload);
app.use(checkContentTypeIsSet);
app.use(checkContentTypeIsJson);
app.use(errorHandler);

app.post('/users', (req, res) => {
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'email')
    || !Object.prototype.hasOwnProperty.call(req.body, 'password')
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload must contain at least the email and password fields',
    });
  }

  if (
    typeof req.body.email !== 'string'
    || typeof req.body.password !== 'string'
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email and password fields must be of type string',
    });
    return;
  }

  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email field must be a valid email.',
    });
    return;
  }

  client.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: req.body,
  }).then((result) => {
    res.status(201);
    res.set('Content-Type', 'text/plain');
    res.send(result._id);
  }).catch(() => {
    res.status(500);
    res.set('Content-Type', 'application/json');
    res.json({ message: 'Internal Server Error' });
  });
});

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`);
});
