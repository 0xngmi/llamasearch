# LlamaSearch

## Installation (prepare for chrome web store)

Run these commands to prepare a zip file to be uploaded to the Chrome Web Store.

```bash
yarn
yarn prep

# Firefox build
BROWSER="FIREFOX" yarn prep
```

You will find the prepared zip file at `./packed/extension.zip`.

## Installation (dev)

First, run these command to install deps and build bundle.

```bash
yarn
yarn dev
```

Then, go to your browser's extensions page, enable `Developer Mode`.

Then, click `Load unpacked` to navigate to the `/dist` directory and load it up.

Now when you open a new tab, you should be prompted whether you want to use this extension or not.

Have fun!
