import { globSync } from "glob";
import { fileURLToPath } from "url";
import path from "path";

export const getInputs = (resourcesDir: string, globPattern: string) => {
  const inputs: [string, string][] = [];
  globSync(globPattern).forEach((file) => {
    // This removes resourcesDir as well from each
    // file, so e.g. resources/dir/nested/foo.js becomes nested/foo.js
    const fileKey = path.relative(resourcesDir, file.slice(0, file.length));

    // discard excluded files and folders (starting with underscore)
    if (fileKey.includes("/_")) {
      return;
    }

    // This expands the relative paths to absolute paths, so e.g.
    // resources/dir/nested/foo becomes /project/resources/dir/nested/foo.js
    const filePath = fileURLToPath(new URL(file, import.meta.url));

    inputs.push([fileKey, filePath]);
  });

  return inputs;
};

export const absolutePathTo = (pathTo: string): string => {
  return path.resolve(process.cwd(), pathTo);
};
