// scripts/seed-global-attributes.ts
import { prisma } from '../packages/db';

async function seedGlobalAttributes() {
  console.log('Seeding global attributes...');

  // Seed Size attribute
  const sizeAttribute = await prisma.productAttribute.upsert({
    where: {
      name_type: {
        name: 'Size',
        type: 'SIZE',
      },
    },
    update: {},
    create: {
      name: 'Size',
      type: 'SIZE',
      isGlobal: true,
      globalValues: {
        create: [
          { value: 'S' },
          { value: 'M' },
          { value: 'L' },
          { value: 'XL' },
          { value: 'XXL' },
        ],
      },
    },
  });

  // Get the count of global values for Size
  const sizeValuesCount = await prisma.productAttributeGlobalValue.count({
    where: { attributeId: sizeAttribute.id },
  });
  console.log(`Created Size attribute with ${sizeValuesCount} values`);

  // Seed Color attribute
  const colorAttribute = await prisma.productAttribute.upsert({
    where: {
      name_type: {
        name: 'Color',
        type: 'COLOR',
      },
    },
    update: {},
    create: {
      name: 'Color',
      type: 'COLOR',
      isGlobal: true,
      globalValues: {
        create: [
          { value: 'Black' },
          { value: 'White' },
          { value: 'Green' },
          { value: 'Blue' },
          { value: 'Red' },
          { value: 'Grey' },
        ],
      },
    },
  });

  // Get the count of global values for Color
  const colorValuesCount = await prisma.productAttributeGlobalValue.count({
    where: { attributeId: colorAttribute.id },
  });
  console.log(`Created Color attribute with ${colorValuesCount} values`);

  // Seed Material attribute
  const materialAttribute = await prisma.productAttribute.upsert({
    where: {
      name_type: {
        name: 'Material',
        type: 'MATERIAL',
      },
    },
    update: {},
    create: {
      name: 'Material',
      type: 'MATERIAL',
      isGlobal: true,
      globalValues: {
        create: [
          { value: 'Cotton' },
          { value: 'Polyester' },
          { value: 'Denim' },
          { value: 'Leather' },
        ],
      },
    },
  });

  // Get the count of global values for Material
  const materialValuesCount = await prisma.productAttributeGlobalValue.count({
    where: { attributeId: materialAttribute.id },
  });
  console.log(`Created Material attribute with ${materialValuesCount} values`);

  console.log('Global attributes seeding completed!');
}

seedGlobalAttributes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
