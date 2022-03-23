# Avatar WebKit

This project contains the Avatar WebKit and a demo application.

The demo application will use the built module from the parent directory.

When developing this must be actively recompilled if working on the module.
So run `npm run start` from both the parent and the `demo` folder in two seperate terminals.

## NPM Setup

```bash
# Set URL for your scoped packages.
# For example package with name `@foo/bar` will use this URL for download
npm config set @quarkworks-inc/avatar-webkit-rendering https://gitlab.com/api/v4/projects/33101379/packages/npm/

# Add the token for the scoped packages URL with the project where your package is located.
# REPLACE <your_token>
npm config set @quarkworks-inc/avatar-webkit-rendering '//gitlab.com/api/v4/projects/33101379/packages/npm/:_authToken' "2BXjcxaUnW2dNBXhgt9U"
```

## Releases

`yarn release`

1. Pick bump type
2. say yes to commit,tag,push
