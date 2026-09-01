/**
 * One-time backfill for the header nav reorder (About Us -> Our Offerings ->
 * Clients -> Employees -> Contact). If an admin has already saved a `header`
 * row in site_config, that saved JSON blob fully overrides the bundled
 * fallback in my-app/src/data/headerData.js on every page load — so editing
 * the fallback alone does not add Clients/Employees to an already-configured
 * live site. This script patches the saved row directly.
 *
 * Safe to run more than once: it only adds Clients/Employees if a nav item
 * with that link isn't already present, and only re-orders items that were
 * already positioned after the dropdown, so a second run is a no-op.
 *
 * Run once, after deploying this change:
 *   npx ts-node prisma/backfill-header-nav.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

// Same per-item shape/styling NavigationManager already writes, so a new
// item looks identical to hand-added ones instead of standing out.
function buildNavItem(template: any, overrides: Record<string, any>) {
  return {
    ...template,
    hasDropdown: false,
    dropdownItems: [],
    ...overrides,
  };
}

async function main() {
  const row = await prisma.siteConfig.findUnique({ where: { key: 'header' } });
  if (!row || !row.data) {
    console.log('No saved `header` site-config row found — nothing to backfill. Fresh installs already get the updated defaults from headerData.js.');
    return;
  }

  const data: any = row.data;
  const primaryNavigation: any[] = Array.isArray(data.primaryNavigation) ? [...data.primaryNavigation] : [];
  if (primaryNavigation.length === 0) {
    console.log('Saved header config has no primaryNavigation array — nothing to backfill.');
    return;
  }

  const dropdownOrder: number = Number(data.dropdownNavigation?.order ?? 3);
  const hasClients = primaryNavigation.some((i) => i.link === '/clients');
  const hasEmployees = primaryNavigation.some((i) => i.link === '/employees');

  if (hasClients && hasEmployees) {
    console.log('Clients and Employees are both already present — nothing to backfill.');
    return;
  }

  // Use an existing simple link item as the styling template so the new
  // items visually match whatever the admin has already customized.
  const template =
    primaryNavigation.find((i) => !i.hasDropdown) ||
    { fontSize: 12, fontWeight: '900', fontColor: '#4B5563', hoverFontColor: '#1E3A8A', hoverBgColor: '#F9FAFB', activeFontColor: '#FFFFFF', activeBgColor: '#1E3A8A', status: true };

  const nextId = 1 + primaryNavigation.reduce((max, i) => Math.max(max, Number(i.id) || 0), 0);
  const additions: any[] = [];
  if (!hasClients) {
    additions.push(buildNavItem(template, { id: nextId, name: 'Clients', link: '/clients', order: dropdownOrder + 1 }));
  }
  if (!hasEmployees) {
    additions.push(buildNavItem(template, { id: nextId + 1, name: 'Employees', link: '/employees', order: dropdownOrder + 2 }));
  }

  // Shift any item that was already positioned after the dropdown (e.g.
  // Contact) so it lands after the newly-added items, preserving whatever
  // relative order those trailing items already had.
  const before = primaryNavigation.filter((i) => Number(i.order) < dropdownOrder);
  const after = primaryNavigation
    .filter((i) => Number(i.order) >= dropdownOrder)
    .sort((a, b) => Number(a.order) - Number(b.order));

  let nextOrder = dropdownOrder + 1 + additions.length;
  const reorderedAfter = after.map((item) => ({ ...item, order: nextOrder++ }));

  const updatedNavigation = [...before, ...additions, ...reorderedAfter];

  await prisma.siteConfig.update({
    where: { key: 'header' },
    data: { data: { ...data, primaryNavigation: updatedNavigation } },
  });

  console.log(`Backfilled header nav: added ${additions.map((a) => a.name).join(', ') || '(none)'}; reordered ${reorderedAfter.length} trailing item(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
