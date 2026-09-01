import footerApi from "@/lib/footerApi";

// Load the full footer config blob.
export async function loadFooter() {
  return (await footerApi.get()) || {};
}

// Footer fields live at the TOP LEVEL of the config (not nested), so each manager
// saves its slice by merging its fields into the latest full config (re-read
// first) — independent managers never clobber each other.
export async function saveFooterFields(partial) {
  const current = (await footerApi.get()) || {};
  return footerApi.save({ ...current, ...partial });
}
