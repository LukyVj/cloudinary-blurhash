var cloudinary = require("cloudinary");
var fetch = require("node-fetch");
var fs = require("fs").promises;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const jsonFile = "./data/map.json";

async function main() {
  const folder = await cloudinary.v2.api.sub_folders(
    "Algolia_com_Website_assets/images"
  );
  const allFolders = folder.folders.map((folderItem) => {
    return folderItem.path;
  });
  await fs.writeFile(jsonFile, "");
  const results = await Promise.all(
    allFolders.map((folder) => {
      // Perform a search with the cloudinary API
      console.log(folder);

      return cloudinary.v2.search
        .expression(`folder:${folder} AND resource_type:image AND -format=webp`)
        .max_results(1000)
        .execute();
    })
  );
  // get all the resources from all folders in a single array
  const resources = results.flatMap((result) => result.resources);
  const localResources = [];
  for (item of resources) {
    const resource = await fetch(`http://localhost:8080/?q=${item.url}`)
      .then((res) => res.json())
      .then((data) => ({
        data,
        item,
      }));
    localResources.push(resource);
  }
  const resourceData = localResources.map(({ data, item }, index) => {
    console.log(data, item);
    return {
      object_ID: `cloudinary_${item.folder}_image[${index}]`,
      blur_hash: data.hash,
      path: item.folder,
      filename: item.filename,
      format: item.format,
      fullPath: `${item.folder}/${item.filename}.${item.format}`,
      url: item.secure_url,
    };
  });
  return await fs.appendFile(jsonFile, `${JSON.stringify(resourceData)},`);
}
main().catch((err) => {
  console.log(err);
});
