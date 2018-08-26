const router = require("express").Router();
const model = require("./model.js");

const handleResponse = (err, results, res) => {
  if (err) console.error(err);
  res.statusCode = err ? 400 : 200;
  res.send(err || results);
};

router.get("/api/blocks", (req, res) => {
  const {
    query: { llLatitude, llLongitude, urLatitude, urLongitude }
  } = req;
  model.getBlocksByPosition(
    llLatitude,
    llLongitude,
    urLatitude,
    urLongitude,
    (err, results) => handleResponse(err, results, res)
  );
});

module.exports = router;