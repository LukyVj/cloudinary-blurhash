const cloudinary = require("cloudinary");
const fetch = require("node-fetch");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Will add the blur_hash to the image context
async function main() {
  const allObjects = [];
  const promises = [];

  await cloudinary.v2.search
    .expression(
      `folder:${process.env.CLOUDINARY_CONTEXT_FOLDER} AND resource_type:image AND -format=webp`
    )
    .max_results(600)
    .execute()
    .then((result) => {
      result.resources.map((res) => allObjects.push(res));
    })
    .catch((err) => console.log(err));

  allObjects.map((item) => {
    const toPush = async () => {
      await fetch(
        `http://localhost:${process.env.PORT || 5000}/transform/?q=${item.url}`
      )
        .then((res) => res.json())
        .then(async (data) => {
          console.log(`Add context to: ${item.url}`);
          await cloudinary.v2.uploader.add_context(
            `blur_hash=${data.hash}`,
            item.public_id,
            (err, res) => {
              console.log(res, err);
            }
          );
        });
    };
    promises.push(toPush());
  });

  console.log("Await started", promises.length);
  await Promise.all(promises).catch((err) => console.log(err));

  console.log("Done Finished");
}

main().catch((err) => console.log(err));
