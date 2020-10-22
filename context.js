const cloudinary = require("cloudinary");
const fetch = require("node-fetch");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONTEXT_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONTEXT_API_KEY,
  api_secret: process.env.CLOUDINARY_CONTEXT_API_SECRET,
});

// Will add the blur_hash to the image context
async function main() {
  const allObjects = [];
  await cloudinary.v2.search
    .expression("resource_type=image")
    .sort_by("public_id", "desc")
    .execute()
    .then((result) => {
      result.resources.map((res) => allObjects.push(res));
    });

  allObjects.map(async (item) => {
    await fetch(`http://localhost:${process.env.PORT || 5000}/?q=${item.url}`)
      .then((res) => res.json())
      .then((data) => {
        cloudinary.v2.uploader.add_context(
          `blur_hash=${data.hash}`,
          item.public_id,
          (err, res) => {
            console.log(res, err);
          }
        );
      });
  });
}

main().catch((err) => console.log(err));
