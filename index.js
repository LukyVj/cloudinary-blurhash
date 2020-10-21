var cloudinary = require("cloudinary");
var fetch = require("node-fetch");
var fs = require("fs").promises;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
async function main() {
  const folder = await cloudinary.v2.api.sub_folders(
    "Algolia_com_Website_assets/images"
  );
  const allFolders = folder.folders.map((folderItem) => {
    return folderItem.path;
  });
  await fs.writeFile("./data/data_1x1.json", "");
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
  return await fs.appendFile(
    "./data/data_1x1.json",
    `${JSON.stringify(resourceData)},`
  );
}
main().catch((err) => {
  console.log(err);
});

// var cloudinary = require("cloudinary");
// var fetch = require("node-fetch");
// var fs = require("fs");
// require("dotenv").config();

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// // Prepare folders Array
// const allFolders = [];

// cloudinary.v2.api
//   .sub_folders("Algolia_com_Website_assets/images")
//   .then(async (folder) => {
//     // For each folder, push it to the folders Array
//     folder.folders.map((folderItem, folderIndex) => {
//       allFolders.push(folderItem.path);
//     });
//   })
//   .then(() => {
//     // Then empty the data.json file
//     fs.writeFile("./data/data_1x1.json", "", function (err) {
//       if (err) throw err;
//       console.log("Data file created successfully.");
//     });

//     // For each folder in the Array
//     allFolders.map((folder, folderIndex) => {
//       console.log(folder, folderIndex);

//       // Prepare this folder data
//       const thisFolder = [];
//       const thisFolderData = [];

//       // Perform a search with the cloudinary API
//       cloudinary.v2.search
//         .expression(`folder:${folder} AND resource_type:image`)
//         .max_results(1000)
//         .execute()
//         .then(async (result) => {
//           // Images are inside result.resources ( Array  of objects )
//           result.resources.map(async (item, index) => {
//             fetch(`http://localhost:8080/?q=${item.url}`)
//               .then((res) => res.json())
//               .then((data) => {
//                 // For each item, prepare an object with wanted data
//                 const obj = {
//                   object_ID: `cloudinary_${item.folder}[${folderIndex}]_image[${index}]`,
//                   blur_hash: data.hash,
//                   path: item.folder,
//                   filename: item.filename,
//                   format: item.format,
//                   fullPath: `${item.folder}/${item.filename}.${item.format}`,
//                   url: item.secure_url,
//                 };

//                 // Push the object to thisFolderData ( line 38 )
//                 thisFolderData.push(obj);

//                 // Then push the thisFolderData to thisFolder with the name ( line 37 )
//                 thisFolder.push({ name: folder, data: thisFolderData });
//               })
//               .then(() => {
//                 console.log(thisFolder);

//                 // Then, append thisFolder to the data.json file
//                 fs.appendFile(
//                   "./data/data_1x1.json",
//                   `${JSON.stringify(...thisFolderData)},`,
//                   function (err) {
//                     if (err) throw err;
//                     console.log("line added successfully.");
//                   }
//                 );
//               })
//               .catch((err) => {
//                 console.log(err);
//               });
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     });
//   })
//   .catch((err) => console.log(err));
