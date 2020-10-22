<img src="assets/logo.jpg" align="center" />

# Cloudinary BlurHash

## Introduction

Cloudinary BlurHash is a project that will generate a JSON file mappig your Cloudinary images, with their blurhash equivalent.

## How it works

This project consist of 3 scripts:

- `transformer/index.js` ( AKA the server ).
- `map.js` will map your cloudinary images to their blurhash
- `context.js` will add the blurhash as context of your image meta-data

_⚠️ For the `map.js`, you'll have to create the file `data/map.json` manually before running the project._

## Run the project

You'll need to have a Cloudinary account, and you'll need get your Cloudinary `CLOUD_NAME`, `API_KEY` and `API_SECRET` and add them to the `.env` ( See `.env.example`).

You can also add a `PORT` variable, if you have any preference, otherwise it'll fallback on the port `5000`.

Once you've got your `.env` ready, open two terminals:

- 1️⃣ Start the server: `yarn server`
- 2️⃣ Start the fetch `yarn start`

## SERVER

The server is a simple express server that got 2 different endpoints:

- `/transform` will process your image live ( beware, it's slow )
- `/context` will return the blurhash metadata from your image

To pass it an image, use the `q` parameter:
`localhost:8080/transform/?q=<imageUrl>` or `localhost:8080/context/?q=<imageUrl>`

for this query: `http://localhost:8080/context/?q=https://res.cloudinary.com/hilnmyskv/image/upload/v1528201739/algolia_logo.png`;
the `/context` endpoint will respond with:

```
"Ug97[f%Qx{tUj=j]j^j?M[R=WGWZbKaxa$ax"
```

for this query: `http://localhost:8080/transform/?q=https://res.cloudinary.com/hilnmyskv/image/upload/v1528201739/algolia_logo.png`;
the `/transform` endpoint will respond with:

```
{
  "hash": "Ug97[f%Qx{tUj=j]j^j?M[R=WGWZbKaxa$ax",
  "processed_in_ms": 95
}
```

## Informations

### BlurHash?

Learn more about [BlurHash](https://blurha.sh)

### Credits

This project uses the [Cloudinary](https://cloudinary.com) NodeJS [SDK](https://github.com/cloudinary/cloudinary_npm) and [BlurHash (TypeScript)](https://github.com/woltapp/blurhash/tree/master/TypeScript).

Thanks to my dear colleague [@Haroenv](https://github.com/haroenv) for his help on improving the final script.
