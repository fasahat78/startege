/**
 * Verify Stripe Products & Pricing Alignment
 * 
 * This script verifies that Stripe products and prices match the implemented logic:
 * - Subscription prices ($19/month, $199/year)
 * - Credit allocation (1,000/month, 1,250/month annual)
 * - Credit bundle pricing and API usage credits (50% allocation)
 */

import { readFileSync } from "fs";
import { join } from "path";

interface ProductRow {
  id: string;
  name: string;
  apiUsageCredits?: string;
  purchasePrice?: string;
  planType?: string;
  credits?: string;
  bonus?: string;
}

interface PriceRow {
  priceId: string;
  productId: string;
  productName: string;
  amount: string;
  currency: string;
  interval?: string;
}

// Expected values from implementation
const EXPECTED = {
  subscriptions: {
    monthly: {
      price: 19.00,
      creditsPerMonth: 1000,
      planType: "monthly",
    },
    annual: {
      price: 199.00,
      creditsPerMonth: 1250,
      creditsPerYear: 15000,
      planType: "annual",
      savings: 29,
      discount: 12, // 12% off
    },
  },
  creditBundles: {
    small: {
      price: 5.00,
      purchasePrice: 500, // $5.00 in cents
      apiUsageCredits: 250, // 50% of $5 = $2.50 API usage
    },
    standard: {
      price: 10.00,
      purchasePrice: 1000, // $10.00 in cents
      apiUsageCredits: 650, // $6.50 API usage (30% bonus on base 50% = 500 + 150)
    },
    large: {
      price: 25.00,
      purchasePrice: 2500, // $25.00 in cents
      apiUsageCredits: 1500, // $15.00 API usage (50% base = 1250 + 20% bonus = 1500)
      bonus: 20, // 20% bonus mentioned in CSV
    },
  },
};

function parseCSV(filePath: string): any[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  
  return lines.slice(1).map((line) => {
    // Handle CSV with quoted values that may contain commas
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });
    return row;
  });
}

function main() {
  console.log("🔍 Stripe Products & Pricing Alignment Verification\n");
  console.log("=".repeat(80));

  const productsPath = join(process.cwd(), "stripe", "products_live.csv");
  const pricesPath = join(process.cwd(), "stripe", "prices_live.csv");

  const products = parseCSV(productsPath);
  const prices = parseCSV(pricesPath);

  console.log(`\n📦 Found ${products.length} products`);
  console.log(`💰 Found ${prices.length} prices\n`);

  const issues: string[] = [];
  const warnings: string[] = [];

  // Verify subscriptions
  console.log("📋 VERIFYING SUBSCRIPTIONS");
  console.log("-".repeat(80));

  const monthlySub = products.find((p: ProductRow) => 
    p.Name?.includes("Monthly") || p["planType (metadata)"] === "monthly"
  );
  const annualSub = products.find((p: ProductRow) => 
    p.Name?.includes("Annual") || p["planType (metadata)"] === "annual"
  );

  if (monthlySub) {
    const monthlyPrice = prices.find((p: PriceRow) => p.productId === monthlySub.id);
    console.log(`\n✅ Monthly Subscription: ${monthlySub.Name}`);
    
    if (monthlyPrice) {
      const price = parseFloat(monthlyPrice.amount);
      if (price === EXPECTED.subscriptions.monthly.price) {
        console.log(`   ✅ Price: $${price}/month (correct)`);
      } else {
        issues.push(`Monthly price mismatch: Expected $${EXPECTED.subscriptions.monthly.price}, found $${price}`);
        console.log(`   ❌ Price: $${price}/month (expected $${EXPECTED.subscriptions.monthly.price})`);
      }
      
      if (monthlyPrice.interval === "month") {
        console.log(`   ✅ Interval: monthly (correct)`);
      } else {
        issues.push(`Monthly interval incorrect: Expected "month", found "${monthlyPrice.interval}"`);
        console.log(`   ❌ Interval: ${monthlyPrice.interval} (expected "month")`);
      }
    }

    const creditsMeta = monthlySub["credits (metadata)"] || monthlySub.credits;
    if (creditsMeta === "1000" || creditsMeta === "1000") {
      console.log(`   ✅ Credits metadata: ${creditsMeta} (correct)`);
    } else {
      warnings.push(`Monthly credits metadata: Expected "1000", found "${creditsMeta}"`);
      console.log(`   ⚠️  Credits metadata: ${creditsMeta} (expected "1000")`);
    }
  } else {
    issues.push("Monthly subscription product not found");
    console.log(`\n❌ Monthly subscription product not found`);
  }

  if (annualSub) {
    const annualPrice = prices.find((p: PriceRow) => p.productId === annualSub.id);
    console.log(`\n✅ Annual Subscription: ${annualSub.Name}`);
    
    if (annualPrice) {
      const price = parseFloat(annualPrice.amount);
      if (price === EXPECTED.subscriptions.annual.price) {
        console.log(`   ✅ Price: $${price}/year (correct)`);
      } else {
        issues.push(`Annual price mismatch: Expected $${EXPECTED.subscriptions.annual.price}, found $${price}`);
        console.log(`   ❌ Price: $${price}/year (expected $${EXPECTED.subscriptions.annual.price})`);
      }
      
      if (annualPrice.interval === "year") {
        console.log(`   ✅ Interval: yearly (correct)`);
      } else {
        issues.push(`Annual interval incorrect: Expected "year", found "${annualPrice.interval}"`);
        console.log(`   ❌ Interval: ${annualPrice.interval} (expected "year")`);
      }
    }

    const creditsMeta = annualSub["credits (metadata)"] || annualSub.credits;
    // Annual should show 1250/month or 15000/year
    if (creditsMeta === "1250" || creditsMeta === "15000") {
      console.log(`   ✅ Credits metadata: ${creditsMeta} (correct)`);
    } else if (creditsMeta === "1000") {
      warnings.push(`Annual credits metadata: Found "1000", should be "1250" (user may need to update)`);
      console.log(`   ⚠️  Credits metadata: ${creditsMeta} (expected "1250" or "15000")`);
    } else {
      warnings.push(`Annual credits metadata: Expected "1250" or "15000", found "${creditsMeta}"`);
      console.log(`   ⚠️  Credits metadata: ${creditsMeta} (expected "1250" or "15000")`);
    }

    const savingsMeta = annualSub["savings (metadata)"] || annualSub.savings;
    if (savingsMeta === "29" || savingsMeta === "29") {
      console.log(`   ✅ Savings metadata: $${savingsMeta} (correct)`);
    } else {
      warnings.push(`Annual savings metadata: Expected "29", found "${savingsMeta}"`);
      console.log(`   ⚠️  Savings metadata: $${savingsMeta} (expected "29")`);
    }
  } else {
    issues.push("Annual subscription product not found");
    console.log(`\n❌ Annual subscription product not found`);
  }

  // Verify credit bundles
  console.log("\n\n📋 VERIFYING CREDIT BUNDLES");
  console.log("-".repeat(80));

  const creditBundles = {
    small: products.find((p: ProductRow) => 
      p.Name?.includes("Small") || p["bundle (metadata)"] === "small"
    ),
    standard: products.find((p: ProductRow) => 
      p.Name?.includes("Standard") || p["bundle (metadata)"] === "standard"
    ),
    large: products.find((p: ProductRow) => 
      p.Name?.includes("Large") || p["bundle (metadata)"] === "large"
    ),
  };

  for (const [bundleType, product] of Object.entries(creditBundles)) {
    if (!product) {
      issues.push(`${bundleType} credit bundle product not found`);
      console.log(`\n❌ ${bundleType} credit bundle not found`);
      continue;
    }

    const expected = EXPECTED.creditBundles[bundleType as keyof typeof EXPECTED.creditBundles];
    const price = prices.find((p: PriceRow) => p.productId === product.id);
    
    console.log(`\n✅ ${bundleType.charAt(0).toUpperCase() + bundleType.slice(1)} Credits: ${product.Name}`);
    
    if (price) {
      const priceAmount = parseFloat(price.amount);
      if (priceAmount === expected.price) {
        console.log(`   ✅ Price: $${priceAmount} (correct)`);
      } else {
        issues.push(`${bundleType} price mismatch: Expected $${expected.price}, found $${priceAmount}`);
        console.log(`   ❌ Price: $${priceAmount} (expected $${expected.price})`);
      }

      if (!price.interval || price.interval === "") {
        console.log(`   ✅ One-time purchase (correct)`);
      } else {
        issues.push(`${bundleType} should be one-time purchase, but has interval: ${price.interval}`);
        console.log(`   ❌ Should be one-time purchase, but has interval: ${price.interval}`);
      }
    }

    // Check metadata
    const apiUsageCredits = product["apiUsageCredits (metadata)"] || product.apiUsageCredits;
    const purchasePrice = product["purchasePrice (metadata)"] || product.purchasePrice;
    
    if (apiUsageCredits === String(expected.apiUsageCredits)) {
      console.log(`   ✅ API Usage Credits: ${apiUsageCredits} (correct)`);
    } else {
      issues.push(`${bundleType} API usage credits mismatch: Expected "${expected.apiUsageCredits}", found "${apiUsageCredits}"`);
      console.log(`   ❌ API Usage Credits: ${apiUsageCredits} (expected "${expected.apiUsageCredits}")`);
    }

    if (purchasePrice === String(expected.purchasePrice)) {
      console.log(`   ✅ Purchase Price (cents): ${purchasePrice} (correct)`);
    } else {
      warnings.push(`${bundleType} purchase price metadata: Expected "${expected.purchasePrice}", found "${purchasePrice}"`);
      console.log(`   ⚠️  Purchase Price (cents): ${purchasePrice} (expected "${expected.purchasePrice}")`);
    }

    // Verify allocation matches expected (may include bonuses)
    if (parseInt(apiUsageCredits) === expected.apiUsageCredits) {
      const baseAllocation = Math.floor(expected.purchasePrice * 0.5);
      if (expected.apiUsageCredits > baseAllocation) {
        const bonusPercent = Math.round(((expected.apiUsageCredits / baseAllocation) - 1) * 100);
        console.log(`   ✅ Allocation verified: $${expected.price} → ${apiUsageCredits} credits (${bonusPercent}% bonus)`);
      } else {
        console.log(`   ✅ Allocation verified: $${expected.price} → ${apiUsageCredits} credits`);
      }
    } else {
      issues.push(`${bundleType} allocation mismatch: Expected ${expected.apiUsageCredits} credits, found ${apiUsageCredits}`);
      console.log(`   ❌ Allocation: Expected ${expected.apiUsageCredits} credits, found ${apiUsageCredits}`);
    }
  }

  // Summary
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(80));

  if (issues.length === 0 && warnings.length === 0) {
    console.log("\n✅ All checks passed! Stripe products and pricing are aligned with implementation.\n");
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ Found ${issues.length} issue(s) that need to be fixed:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  Found ${warnings.length} warning(s):`);
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    console.log("\n");
  }

  // Generate fix recommendations
  if (issues.length > 0) {
    console.log("🔧 RECOMMENDED FIXES:");
    console.log("-".repeat(80));
    
    if (issues.some(i => i.includes("Annual credits metadata"))) {
      console.log("\n1. Update Annual Subscription Product Metadata:");
      console.log("   - Go to Stripe Dashboard → Products → Startege Premium Annual");
      console.log("   - Update 'credits' metadata from '1000' to '1250'");
      console.log("   - Or add note: '1250/month (15,000/year)'");
    }

    if (issues.some(i => i.includes("API usage credits"))) {
      console.log("\n2. Verify Credit Bundle Metadata:");
      console.log("   - Small: apiUsageCredits should be '250'");
      console.log("   - Standard: apiUsageCredits should be '500'");
      console.log("   - Large: apiUsageCredits should be '1500' (with 20% bonus)");
    }

    console.log("\n");
  }
}

main();

