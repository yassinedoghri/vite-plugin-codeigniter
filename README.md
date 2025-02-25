# vite-plugin-codeigniter

A vite plugin to configure CodeIgniter4 apps. To be used in conjunction with
https://github.com/yassinedoghri/codeigniter-vite

```
npm install --save-dev vite-plugin-codeigniter

pnpm add --save-dev vite-plugin-codeigniter

yarn add --dev vite-plugin-codeigniter
```

```js
// vite.config.js
import codeigniter from "vite-plugin-codeigniter";

export default {
  plugins: [codeigniter()],
};
```

## 🛠️ Options

```ts
interface Options {
  /**
   * Empty public assets directory before building.
   * @default true
   */
  emptyAssetsDir?: boolean;

  /**
   * CodeIgniter's public directory.
   * @default "public"
   */
  publicDir?: string;

  /**
   * The public subdirectory where compiled assets should be written.
   * @default "assets"
   */
  assetsDir?: string;

  /**
   * The directory in which source files live.
   * @default "resources"
   */
  resourcesDir?: string;

  /**
   * The resources subdirectory where JavaScript/TypeScript files live.
   * @default "js"
   */
  jsDir?: string;

  /**
   * The resources subdirectory where CSS files live.
   * @default "styles"
   */
  stylesDir?: string;

  /**
   * The resources subdirectory where static files live. Static files are copied as is in the public's assets folder.
   * @default "static"
   */
  staticDir?: string;

  /**
   * The path to vite's manifest file inside the public directory.
   * @default ".vite/manifest.json"
   */
  manifest?: string;

  /**
   * Define image variants to be generated based on your static images.
   * @default []
   */
  imageVariants?: ImageVariant[];
}

interface ImageVariant {
  src: string; // A glob pattern inside the static directory.
  sizes: Record<
    string, // File name of the variant with extension. You may include %NAME% directive to be replaced with the original filename.
    number // The width of the image. The variant image preserves the same ratio as the original.
  >;
}
```

## 📜 License

Code released under the [MIT License](https://choosealicense.com/licenses/mit/).

Copyright (c) 2025-present, Yassine Doghri
([@yassinedoghri](https://yassinedoghri.com/)).
