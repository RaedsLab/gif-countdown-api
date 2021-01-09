const fs = require("fs");
const rimraf = require("rimraf");
const { createCanvas } = require("canvas");
const { execSync } = require("child_process");
const { formatDistanceToNow } = require("date-fns");

Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};

const generateImage = (uuid, text, index) => {
  const width = 300;
  const height = 80;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);

  context.font = "bold 25pt Menlo";
  context.textAlign = "center";
  context.fillStyle = "#000";
  context.fillText(text, 155, 50);

  fs.writeFileSync(`./generated/${uuid}/frame-${index}.png`, canvas.toBuffer());
};

const differenceFormatter = (difference) => {
  const timeLeft = {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  timeLeft.hours += timeLeft.days * 24;
  delete timeLeft.days;

  return timeLeft;
};

const getTimeUntilEndTime = (endTime) => {
  const difference = new Date(endTime).getTime() - Date.now();
  return { difference, timeLeft: differenceFormatter(difference) };
};

const getNextFrame = (difference, index) =>
  differenceFormatter(difference + index * 1000);

const getFrames = (endTime) => {
  const { timeLeft, difference } = getTimeUntilEndTime(endTime);
  const frames = [timeLeft];
  // 60 frames (1 per second)
  for (let i = 1; i < 60; i++) {
    const nextFrame = getNextFrame(difference, i);
    frames.push(nextFrame);
  }
  return frames;
};

const frameToText = ({ days, hours, minutes, seconds }) =>
  `${hours.pad()}:${minutes.pad()}:${seconds.pad()}`;

const getGif = (endDate, uuid) => {
  rimraf.sync(`./generated/${uuid}/*`);

  if (!fs.existsSync(`./generated/${uuid}`)) {
    fs.mkdirSync(`./generated/${uuid}`);
  }

  getFrames(endDate)
    .map(frameToText)
    .forEach((frame, index) => generateImage(uuid, frame, index.pad()));

  // Generate gif from frames
  execSync(
    `engiffen ./generated/${uuid}/*.png -f 1 -q naive -o ./output/large-${uuid}.gif`
  );

  return execSync(`gifsicle -i ./output/large-${uuid}.gif -O1 --colors 124`);
};

const cleanUp = (uuid) => {
  rimraf.sync(`./generated/${uuid}`);
  rimraf.sync(`./output/large-${uuid}.gif`);
};

module.exports = { getGif, cleanUp };
