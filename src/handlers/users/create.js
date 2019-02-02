import ValidationError from '../../validators/errors/validation-error';
import create from '../../engines/users/create';

function createUser(req, res, db) {
  create(req, db).then((result) => {
    res.status(201)
      .set('Content-Type', 'text/plain')
      .send(result._id);
  }, (err) => {
    if (err instanceof ValidationError) {
      res.status(400)
        .set('Content-Type', 'application/json')
        .json({ message: err.message });
    }
  }).catch(() => {
    res.status(500)
      .set('Content-Type', 'application/json')
      .json({ message: 'Internal Server Error' });
  });
}

export default createUser;
