import ValidationError from '../errors/validation-error';

function validate(req) {
  // Payload must contain email and passwords fields
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'email')
    || !Object.prototype.hasOwnProperty.call(req.body, 'password')
  ) {
    return new ValidationError('Payload must contain at least the email and password fields');
  }

  // Fields email and password must be of type string
  if (
    typeof req.body.email !== 'string'
    || typeof req.body.password !== 'string'
  ) {
    return new ValidationError('The email and password fields must be of type string');
  }

  // Field email must be valid
  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    return new ValidationError('The email field must be a valid email.');
  }

  return undefined;
}

export default validate;
