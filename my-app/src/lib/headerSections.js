import headerApi from "@/lib/headerApi";

// Load one section of the single header config blob.
export async function loadHeaderSection(sectionKey) {
  const cfg = await headerApi.get();
  return cfg ? cfg[sectionKey] : undefined;
}

// Save one section by MERGING it into the latest full config (re-read first), so
// independent managers (logo / navigation / login) never clobber each other.
export async function saveHeaderSection(sectionKey, data) {
  const current = (await headerApi.get()) || {};
  return headerApi.save({ ...current, [sectionKey]: data });
}
