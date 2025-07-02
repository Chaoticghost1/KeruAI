import { db } from "../server/db";
import { storage } from "../server/storage";

async function testBadgeSystem() {
  console.log("Testing badge system functionality...");
  
  try {
    // Get or create test user with unique email
    const timestamp = Date.now();
    let testUser = await storage.getUserByUsername('test_student');
    if (!testUser) {
      testUser = await storage.createUser({
        username: 'test_student',
        password: 'test123',
        email: `test_${timestamp}@example.com`
      });
    }
    console.log(`Created test user: ${testUser.username} (ID: ${testUser.id})`);
    
    // Get a tutor agent
    const agents = await storage.getTutorAgents();
    if (agents.length === 0) {
      console.log("No tutor agents found. Please run tutor initialization first.");
      return;
    }
    
    const mathAgent = agents.find(agent => agent.agentKey === 'math_buddy');
    if (!mathAgent) {
      console.log("Math Buddy agent not found.");
      return;
    }
    
    // Simulate completing a few sessions to earn badges
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Session ${i} ---`);
      
      // Create session
      const session = await storage.createTutorSession({
        userId: testUser.id,
        agentId: mathAgent.id,
        subject: 'mathematics',
        topic: 'algebra',
        difficultyLevel: 2,
        isActive: true
      });
      
      // Simulate some messages
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'student',
        message: 'Can you help me with quadratic equations?',
        messageType: 'question'
      });
      
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'agent',
        message: 'Of course! Let\'s start with the standard form...',
        messageType: 'explanation'
      });
      
      // End session
      await storage.endTutorSession(session.id);
      
      // Award session rewards
      const rewards = await storage.awardSessionRewards(testUser.id, {
        sessionId: session.id,
        subject: 'mathematics',
        duration: 10 + i * 5, // Increasing duration
        messagesExchanged: 4 + i * 2, // Increasing messages
        difficulty: 2
      });
      
      console.log(`Points earned: ${rewards.pointsEarned} XP`);
      console.log(`Level up: ${rewards.levelUp ? 'YES' : 'NO'}`);
      console.log(`New badges: ${rewards.badgesEarned.length}`);
      
      if (rewards.badgesEarned.length > 0) {
        for (const badge of rewards.badgesEarned) {
          console.log(`  🏆 ${badge.icon} ${badge.name} - ${badge.description}`);
        }
      }
    }
    
    // Check final profile
    console.log("\n--- Final Profile ---");
    const finalProfile = await storage.getStudentProfile(testUser.id);
    if (finalProfile) {
      console.log(`Level: ${finalProfile.level}`);
      console.log(`Experience: ${finalProfile.experiencePoints} XP`);
      console.log(`Sessions completed: ${finalProfile.totalSessionsCompleted}`);
      console.log(`Current streak: ${finalProfile.currentStreak}`);
    }
    
    // Check earned badges
    const userBadges = await storage.getUserBadges(testUser.id);
    const allBadges = await storage.getBadges();
    
    console.log(`\n--- Earned Badges (${userBadges.length}) ---`);
    for (const userBadge of userBadges) {
      const badge = allBadges.find(b => b.id === userBadge.badgeId);
      if (badge) {
        console.log(`${badge.icon} ${badge.name} (${badge.rarity})`);
      }
    }
    
    console.log("\n✅ Badge system test completed successfully!");
    
  } catch (error) {
    console.error("Error testing badge system:", error);
  }
}

// Run the test
testBadgeSystem().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});