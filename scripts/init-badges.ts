import { db } from "../server/db";
import { badges } from "@shared/schema";
import { PREDEFINED_BADGES } from "@shared/badgeSystem";
import { eq } from "drizzle-orm";

async function initializeBadges() {
  console.log("Initializing badge system with predefined badges...");
  
  try {
    for (const badgeData of PREDEFINED_BADGES) {
      // Check if badge already exists
      const existingBadge = await db
        .select()
        .from(badges)
        .where(eq(badges.badgeKey, badgeData.badgeKey))
        .limit(1);
      
      if (existingBadge.length === 0) {
        // Create new badge
        await db.insert(badges).values(badgeData);
        console.log(`Created badge: ${badgeData.name}`);
      } else {
        console.log(`Badge already exists: ${badgeData.name}`);
      }
    }
    
    console.log("Badge system initialization completed!");
    
    // Display summary
    const totalBadges = await db.select().from(badges);
    console.log(`Total badges in system: ${totalBadges.length}`);
    
  } catch (error) {
    console.error("Error initializing badges:", error);
  }
}

// Run the initialization
initializeBadges().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Failed to initialize badges:", error);
  process.exit(1);
});