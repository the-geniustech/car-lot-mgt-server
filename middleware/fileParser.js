import formidable from 'formidable';

const fileParser = (req, res, next) => {
  if (!req.headers['content-type'].startsWith('multipart/form-data;'))
    return res.status(422).json({ message: 'Only accepts form-data!' });

  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    req.body = fields;
    req.files = files;

    next();
  });
};

export default fileParser;
