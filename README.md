# ts-script-starter

A starter project for TypeScript scripts, using suggested configuration from [Total TypeScript](https://www.totaltypescript.com/typescript-and-node).

## Usage

Running `pnpm dev` will start the TypeScript compiler in watch mode and run the script in node. It will re-run the script when changes are made to the source file.

```bash
pnpm dev
```

The `--enable-source-maps` flag in the `dev:node` script is used to point to the TS files if any errors occur.

Running `pnpm build` will compile the TypeScript files and output the JavaScript files to the `dist` directory.

```bash
pnpm build
```

Running `pnpm start` will run the compiled JavaScript file.

```bash
pnpm start
```
