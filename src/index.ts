import { rmSync } from "fs";
import { globSync } from "glob";
import path from "path";
import pc from "picocolors";
import sharp from "sharp";
import { Plugin, PluginOption } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { z } from "zod";
import { absolutePathTo, getInputs } from "./utlis.ts";

const PluginOptionsSchema = z
  .object({
    emptyAssetsDir: z
      .boolean()
      .optional()
      .default(true)
      .describe("Empty public assets directory before building."),
    publicDir: z
      .string()
      .nonempty()
      .optional()
      .default("public")
      .describe("CodeIgniter's public directory"),
    assetsDir: z
      .string()
      .nonempty()
      .optional()
      .default("assets")
      .describe(
        "The public subdirectory where compiled assets should be written.",
      ),
    resourcesDir: z
      .string()
      .nonempty()
      .optional()
      .default("resources")
      .describe("The directory in which source files live."),
    jsDir: z
      .string()
      .nonempty()
      .optional()
      .default("js")
      .describe(
        "The resources subdirectory where JavaScript/TypeScript files live.",
      ),
    stylesDir: z
      .string()
      .nonempty()
      .optional()
      .default("styles")
      .describe("The resources subdirectory where CSS files live."),
    staticDir: z
      .string()
      .nonempty()
      .optional()
      .default("static")
      .describe(
        "The resources subdirectory where static files live. Static files are copied as is in the public's assets folder.",
      ),
    manifest: z
      .string()
      .nonempty()
      .optional()
      .default(".vite/manifest.json")
      .describe(
        "The path to vite's manifest file inside the public directory.",
      ),
    imageVariants: z
      .array(
        z.object({
          src: z
            .string()
            .describe("A glob pattern inside the static directory."),
          sizes: z.record(
            z
              .string()
              .describe(
                "File name of the variant with extension. You may include %NAME% directive to be replaced with the original filename.",
              ),
            z
              .number()
              .positive()
              .describe(
                "The width of the image. The variant image preserves the same ratio as the original.",
              ),
          ),
        }),
      )
      .optional()
      .default([])
      .describe(
        "Define image variants to be generated based on your static images.",
      ),
  })
  .default({})
  .transform((config) => ({
    ...config,
    publicDirAbs: absolutePathTo(config.publicDir),
    assetsDirAbs: absolutePathTo(`${config.publicDir}/${config.assetsDir}`),
    resourcesDirAbs: absolutePathTo(config.resourcesDir),
    staticDirAbs: absolutePathTo(`${config.resourcesDir}/${config.staticDir}`),
    jsDirAbs: absolutePathTo(`${config.resourcesDir}/${config.jsDir}`),
    stylesDirAbs: absolutePathTo(`${config.resourcesDir}/${config.stylesDir}`),
  }));

type PluginOptionsInput = z.input<typeof PluginOptionsSchema>;
type PluginOptions = z.infer<typeof PluginOptionsSchema>;

const resolveCodeIgniterConfig = (pluginOptions: PluginOptions): Plugin => ({
  name: "codeigniter",
  config: () => {
    const jsInputs: [string, string][] = getInputs(
      pluginOptions.resourcesDirAbs,
      `${pluginOptions.jsDirAbs}/**/!(*.d).{js,ts}`,
    );
    const cssInputs: [string, string][] = getInputs(
      pluginOptions.resourcesDirAbs,
      `${pluginOptions.stylesDirAbs}/**/*.css`,
    );

    return {
      root: pluginOptions.resourcesDirAbs,
      publicDir: false,
      build: {
        outDir: pluginOptions.publicDirAbs,
        assetsDir: pluginOptions.assetsDir,
        manifest: pluginOptions.manifest,
        rollupOptions: {
          input: Object.fromEntries([...jsInputs, ...cssInputs]),
        },
      },
    };
  },
});

const generateImageVariants = (pluginOptions: PluginOptions): Plugin => ({
  name: "codeigniter:optimize-images",
  apply: "build",
  closeBundle: async () => {
    if (pluginOptions.imageVariants.length === 0) {
      console.log(
        `\n${pc.bold(`${pc.yellow("No image variants defined.")} Skipping generation!`)}\n`,
      );

      return;
    }

    console.log(`${pc.bold("Generating image variants…")}`);

    pluginOptions.imageVariants.forEach((imageVariants) => {
      globSync(`${pluginOptions.assetsDirAbs}/${imageVariants.src}`).forEach(
        (imagePath) => {
          console.log(`\n${imagePath}`);

          const parsedImagePath = path.parse(imagePath);

          for (const [key, value] of Object.entries(imageVariants.sizes)) {
            const outputPath = key.replace(
              "%NAME%",
              path.join(parsedImagePath.dir, parsedImagePath.name),
            );

            sharp(imagePath).resize(value).toFile(outputPath);

            const parsedOutputPath = path.parse(outputPath);

            console.log(
              pc.green(`+ ${parsedOutputPath.name + parsedOutputPath.ext}`),
            );
          }
        },
      );
    });
  },
});

const emptyAssetsDir = (pluginOptions: PluginOptions): Plugin => ({
  name: "codeigniter:empty-assets-dir",
  apply: "build",
  buildStart: () => {
    if (!pluginOptions.emptyAssetsDir) {
      return;
    }

    console.log(
      `${pc.bold("Emptying assets directory:")} ${pluginOptions.assetsDirAbs}\n`,
    );

    rmSync(pluginOptions.assetsDirAbs, { recursive: true, force: true });

    console.log(`${pc.bold("Done!")}\n`);
  },
});

const codeigniter = (options?: PluginOptionsInput): PluginOption => {
  const pluginOptions = PluginOptionsSchema.parse(options);

  return [
    viteStaticCopy({
      targets: [
        {
          src: `${pluginOptions.staticDirAbs}/*`,
          dest: pluginOptions.assetsDirAbs,
        },
      ],
    }),
    resolveCodeIgniterConfig(pluginOptions),
    generateImageVariants(pluginOptions),
    emptyAssetsDir(pluginOptions),
  ];
};

export default codeigniter;
