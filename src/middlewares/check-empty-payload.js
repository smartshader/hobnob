function checkEmptyPayload(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method)
    && req.headers['content-length'] === '0'
  ) {
    res.status(400)
      .set('Content-Type', 'application/json')
      .json({
        message: 'Payload should not be empty',
      });
    return;
  }

  next();
}

export default checkEmptyPayload;
