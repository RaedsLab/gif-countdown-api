const uuid = require("uuid");
const express = require("express");
const { parseISO } = require("date-fns");
const { getGif, cleanUp } = require("./helpers");

const router = express.Router();

/* GET GIF */
router.get("/gif", (req, res, next) => {
  const endDateStr = req.query.end_date + "";
  const endDate = parseISO(endDateStr);
  if (!endDateStr || endDate.toString() === "Invalid Date") {
    return res
      .status(400)
      .send("Provide 'end_date' in ISO format (example: 2021-01-15T11:30:30)");
  }

  const id = uuid.v4();
  const gif = getGif(endDate, id);
  res.setHeader("content-type", "image/gif");
  res.send(gif);
  cleanUp(id);
});

module.exports = router;
