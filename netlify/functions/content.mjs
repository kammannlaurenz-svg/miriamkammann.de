import { loadOverrides, mergedContent, json } from "./_shared.mjs";

export default async () => {
  const overrides = await loadOverrides();
  return json(200, mergedContent(overrides));
};
