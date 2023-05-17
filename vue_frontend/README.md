# Mythic Table - Webapp

The Mythic Table frontend is a Vue.js single page app. See the main [README.md](../README.md) for setup instructions.

## Architecture

TODO

## Development

Development of the Mythic Table webapp requires node 12.17.0 or later within the 12 series. Higher and lower major versions of node may have inconsistent test and build results.

## Testing

TODO

## Directory Layout

Within the `html` directory, the layout is as follows:

Root of `html/` - Files used to bootstrap the app, and the following directories.

`dist/` - Reserved for build artifacts.

`node_modules/` - Reserved for dependencies.

`public/` - Files used to serve the built app.

`public/static/` - Files such as images and fonts to be served with the app.

`src/` - Scaffolding for the app.

`tests/` - Test files. The directory structure mirrors that of `src` exactly, so that the path of a given test file is the same as that of the file it tests but with `src` replaced with `tests`.
