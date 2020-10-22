<img src="assets/logo.jpg" align="center" />

# Cloudinary BlurHash

## Introduction

Cloudinary BlurHash is a project that will generate a JSON file mappig your Cloudinary images, with their blurhash equivalent.

## How it works

This project consist of 2 scripts. One being the `transformer/index.js` that will run an express server which will fetch your Cloudinary images, and encode them into a BlurHash.

Then, these data will be stored into `data/map.json`.

_⚠️ You'll have to create the file `data/map.json` manually before running the project._

## Run the project

You'll need to have a Cloudinary account, and you'll need get your Cloudinary `CLOUD_NAME`, `API_KEY` and `API_SECRET` and add them to the `.env` ( See `.env.example`).

You can also add a `PORT` variable, if you have any preference, otherwise it'll fallback on the port `5000`.

Once you've got your `.env` ready, open two terminals:

- 1️⃣ Start the server: `yarn server`
- 2️⃣ Start the fetch `yarn start`

# SERVER

The server can make two things.

- [Live computing](): It can compute the images directly and return the corresponding blurhash.
- [Get Cloudinary Context](): It can use the Cloudinary API to return image contexts.

## Informations

### BlurHash?

Learn more about [BlurHash](https://blurha.sh)

### Credits

This project uses the [Cloudinary](https://cloudinary.com) NodeJS [SDK](https://github.com/cloudinary/cloudinary_npm) and [BlurHash (TypeScript)](https://github.com/woltapp/blurhash/tree/master/TypeScript).

Thanks to my dear colleague [@Haroenv](https://github.com/haroenv) for his help on improving the final script.
