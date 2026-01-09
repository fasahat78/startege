import { prisma } from "../lib/db";
import { DiscountCodeType, DiscountCodeStatus, EarlyAdopterTier } from "@prisma/client";

async function createSampleDiscountCodes() {
  console.log("Creating sample discount codes...");

  const codes = [
    {
      id: "sample_founding_1",
      code: "FOUNDING100",
      description: "Founding Member - 50% off forever",
      type: DiscountCodeType.PERCENTAGE,
      value: 50, // 50% off
      status: DiscountCodeStatus.ACTIVE,
      maxUses: 100,
      maxUsesPerUser: 1,
      applicableToPlanTypes: ["both"], // Both monthly and annual
      earlyAdopterTier: EarlyAdopterTier.FOUNDING_MEMBER,
    },
    {
      id: "sample_early_1",
      code: "EARLYBIRD40",
      description: "Early Bird - 40% off first year",
      type: DiscountCodeType.PERCENTAGE,
      value: 40,
      status: DiscountCodeStatus.ACTIVE,
      maxUses: 400,
      maxUsesPerUser: 1,
      applicableToPlanTypes: ["both"],
      earlyAdopterTier: EarlyAdopterTier.EARLY_ADOPTER,
    },
    {
      id: "sample_launch_1",
      code: "LAUNCH20",
      description: "Launch Special - 20% off first year",
      type: DiscountCodeType.PERCENTAGE,
      value: 20,
      status: DiscountCodeStatus.ACTIVE,
      maxUses: null, // Unlimited
      maxUsesPerUser: 1,
      applicableToPlanTypes: ["both"],
      earlyAdopterTier: EarlyAdopterTier.LAUNCH_USER,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
    },
  ];

  for (const codeData of codes) {
    try {
      const existing = await prisma.discountCode.findUnique({
        where: { code: codeData.code },
      });

      if (existing) {
        console.log(`✅ Code ${codeData.code} already exists, skipping...`);
        continue;
      }

      await prisma.discountCode.create({
        data: {
          ...codeData,
          validFrom: new Date(),
        },
      });

      console.log(`✅ Created discount code: ${codeData.code} (${codeData.value}% off)`);
    } catch (error: any) {
      console.error(`❌ Error creating ${codeData.code}:`, error.message);
    }
  }

  console.log("\n✅ Sample discount codes created!");
  console.log("\nAvailable codes:");
  const allCodes = await prisma.discountCode.findMany({
    select: {
      code: true,
      description: true,
      type: true,
      value: true,
      status: true,
    },
  });

  allCodes.forEach((code) => {
    const discountText = code.type === DiscountCodeType.PERCENTAGE 
      ? `${code.value}% off` 
      : `$${(code.value / 100).toFixed(2)} off`;
    console.log(`  - ${code.code}: ${code.description} (${discountText}, ${code.status})`);
  });
}

createSampleDiscountCodes()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

