const express = require("../node_modules/express");
const cloudinary = require("cloudinary");
const { encode } = require("../node_modules/blurhash");
const { createCanvas, loadImage } = require("../node_modules/canvas");
require("dotenv").config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONTEXT_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONTEXT_API_KEY,
  api_secret: process.env.CLOUDINARY_CONTEXT_API_SECRET,
});

require("../node_modules/dotenv").config();

const getImageData = (image) => {
  const canvas = createCanvas(image.width, image.height);
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

const encodeImageToBlurhash = async (imageUrl, res, start) => {
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);

  await res.json({
    hash: encode(imageData.data, imageData.width, imageData.height, 4, 4),
    processed_in_ms: Date.now() - start,
  });
};

app.get("/transform", async (req, res, next) => {
  console.log(`Request ➡️ ${req.originalUrl}`);
  req.setTimeout(2147483647);
  var start = Date.now();

  try {
    await encodeImageToBlurhash(req.originalUrl.split("/?q=")[1], res, start);
  } catch (err) {
    next(err);
  }

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
});

app.get("/context", async (req, res, next) => {
  console.log(`Request ➡️ ${req.originalUrl}`);
  req.setTimeout(2147483647);
  var start = Date.now();

  try {
    cloudinary.v2.search
      .expression("")
      .max_results(1000)
      .execute()
      .then(async (result) => {
        const url = req.originalUrl.split("/?q=")[1];
        result.resources.find((item) => {
          if (item.secure_url === url || item.url === url) {
            cloudinary.v2.api
              .resource(item.public_id)
              .then((data) => {
                res.json(data.context.custom.blur_hash);
              })
              .catch((err) => console.log(err));
          }
        });
      });
  } catch (err) {
    next(err);
  }

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`listen on http://localhost:${process.env.PORT || 5000}`);
});
