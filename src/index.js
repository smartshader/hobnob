import '@babel/polyfill';
import express from 'express';
import bodyParser from 'body-parser';


function checkEmptyPayload(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method)
    && req.headers['content-length'] === '0'
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload should not be empty',
    });
  }
  next();
}

function checkContentTypeIsSet(req, res, next) {
  if (
    req.headers['content-length']
    && req.headers['content-length'] !== '0'
    && !req.headers['content-type']
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The "Content-Type" header must be set for requests with a non-empty payload',
    });
  }
  next();
}

function checkContentTypeIsJson(req, res, next) {
  if (!req.headers['content-type'].includes('application/json')) {
    res.status(415);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The "Content-Type" header must always be "application/json"',
    });
  }
  next();
}

const app = express();

app.use(bodyParser.json({ limit: Number(process.env.PAYLOAD_LIMIT) }));

app.use(checkEmptyPayload);
app.use(checkContentTypeIsSet);
app.use(checkContentTypeIsJson);

app.post('/users', (req, res, next) => {
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

  next();
});

app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError
    && err.type === 'entity.parse.failed'
    && err.status === 400
    && 'body' in err
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload should be in JSON format',
    });
    return;
  }
  next();
});

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`);
});
