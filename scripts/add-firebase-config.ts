/**
 * Helper script to format Firebase configuration for .env.local
 * This script reads the service account JSON and formats it correctly
 */

import * as fs from "fs";
import * as path from "path";

const serviceAccountPath = "/Users/fasahatferoze/Downloads/startege-firebase-adminsdk-fbsvc-3f5a0d40fd.json";

console.log("📋 Firebase Configuration for .env.local\n");
console.log("=" .repeat(60));
console.log("\nAdd these lines to your .env.local file:\n");
console.log("# Firebase Client SDK (Public)");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=startege.firebaseapp.com");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=startege");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=startege.firebasestorage.app");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=785373873454");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID=1:785373873454:web:ea2aa58440389c78eda6bf");
console.log("\n# Firebase Admin SDK (Private - Service Account Key)");

// Read and format service account JSON
try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
  const serviceAccountString = JSON.stringify(serviceAccount);
  
  console.log(`FIREBASE_SERVICE_ACCOUNT_KEY='${serviceAccountString}'`);
  
  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Configuration ready!");
  console.log("\n📝 Next steps:");
  console.log("  1. Copy the lines above");
  console.log("  2. Paste them into your .env.local file");
  console.log("  3. Run: npx prisma migrate dev --name add_firebase_fields");
  console.log("  4. Run: npx prisma generate");
  console.log("  5. Test: npm run dev");
  console.log("  6. Visit: http://localhost:3000/auth/signup-firebase");
} catch (error: any) {
  console.error("❌ Error reading service account file:", error.message);
  console.log("\n⚠️  Manual format required. Here's the service account JSON:");
  console.log("   (Convert to single line and wrap in single quotes)");
}

