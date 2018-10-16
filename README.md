# picl 🥒

Picl is an image manipulation server which is largely inspired by Cloudinary's auto-upload implementation.

## Setup

Copy the `config.sample.json` to `config.json` and add in the cloud names, just like you would on Cloudinary, and the port number for the server.

Run `node index.js` to start the server.

## What it Does

Host your own image manipulation server!

This server has been designed to work exactly like Cloudinary's auto-upload implementation, so that it can be used either as a replacement, or even for local development.

All URLs work exactly as you'd expect:

`https://yourpiclserver.com/<cloud_name>/w_500,h_500,c_fit/<folder_name>/2018/12/my-image.jpg`

`https://yourpiclserver.com/<cloud_name>/images/w_500,h_500,c_fit/<folder_name>/2018/12/my-image/whatver-file-name-you-want.jpg`

## How it Works

1. It first reads the URL and tries to figure out the path to the original image.
1. It looks for a previously downloaded version of the original image.
	1. If the original version is found on the server, it uses it.
	1. If the original version does not exist on the server:
		1. It looks for the original image URL based on the remote URL in the configuration.
		1. It downloads and stores a copy of the image on the server for faster manipulation the next time around.
1. It perfoms the manipulation on the downloaded original image and serves it.

## Best Practices

Picl is meant to sit behind a CDN. Although it is super fast, it would be best to cache the generated images and serve them via a CDN.
