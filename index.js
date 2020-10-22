const cloudinary = require("cloudinary");
const fetch = require("node-fetch");
const fs = require("fs").promises;
const chalk = require("chalk");
const logUpdate = require("log-update");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const jsonFile = "./data/map.json";

// Helper functions
const percentage = (partialValue, totalValue) =>
  ((100 * partialValue) / totalValue).toFixed(2);

const parseHrtimeToSeconds = (hrtime) => {
  var seconds = (hrtime[0] + hrtime[1] / 1e9).toFixed(3);
  return seconds;
};

const updateLogs = (a, b, c, d) =>
  logUpdate(
    `\n${a} Processed.\n\n${b} images remaining to process\n\n${c} images processed ✅\n\nProcess started ${d}s ago`
  );

// Main function
async function main() {
  var startTime = process.hrtime();
  const folder = await cloudinary.v2.api.sub_folders(
    "Algolia_com_Website_assets/images"
  );
  const allFolders = folder.folders.map((folderItem) => {
    return folderItem.path;
  });
  await fs.writeFile(jsonFile, "");
  const results = await Promise.all(
    allFolders.map((folder) => {
      console.log(`Folder: ${folder}`);
      return cloudinary.v2.search
        .expression(`folder:${folder} AND resource_type:image AND -format=webp`)
        .max_results(1000)
        .execute();
    })
  );

  const resources = results.flatMap((result) => result.resources);
  const localResources = [];

  console.clear();
  console.log(
    `About to process ${chalk.green(
      resources.length
    )} images from ${chalk.green(results.length)} folders`
  );

  for (item of resources) {
    const resource = await fetch(
      `http://localhost:${process.env.PORT || 5000}/?q=${item.url}`
    )
      .then((res) => res.json())
      .then((data) => ({
        data,
        item,
      }));
    localResources.push(resource);
    const elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));

    updateLogs(
      chalk.green.bold(
        `${percentage(localResources.length, resources.length)}%`
      ),
      chalk.green.bold(`${resources.length - localResources.length}`),
      chalk.green.bold(`${localResources.length}`),
      chalk.green.bold(elapsedSeconds)
    );
  }
  const resourceData = localResources.map(({ data, item }, index) => {
    const cleanUrl = item.url.split("/");
    return {
      objectID: `cloudinary_${item.folder}_image[${index}]`,
      blur_hash: data.hash,
      path: item.folder,
      filename: item.filename,
      format: item.format,
      fullPath: `${item.folder}/${item.filename}.${item.format}`,
      sitePath: `${cleanUrl[cleanUrl.length - 2]}/${
        cleanUrl[cleanUrl.length - 1]
      }`,
      url: item.secure_url,
      width: item.width,
      height: item.height,
      aspect_ratio: item.aspect_ratio,
    };
  });
  return await fs
    .appendFile(jsonFile, `${JSON.stringify(resourceData)},`)
    .then(() => {
      console.log(
        chalk.green(`Done, your data is now available at ${jsonFile}`)
      );
    });
}
main().catch((err) => {
  console.log(err);
});
