function errorHandler(err, req, res, next) {
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
}

export default errorHandler;
