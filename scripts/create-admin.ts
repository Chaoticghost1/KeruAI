/**
 * Create or reset an admin (superuser) account for local development.
 * Run: npx tsx scripts/create-admin.ts
 *
 * Default credentials:
 *   Username: admin
 *   Email: admin@keru.ai
 *   Password: admin123
 */

import "dotenv/config";
import { hashPassword } from '../server/auth';
import { storage } from '../server/storage';

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@keru.ai';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin() {
  try {
    let user = await storage.getUserByUsername(ADMIN_USERNAME);

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    if (user) {
      // User exists - ensure they're a superuser and reset password
      await storage.updateUser(user.id, {
        password: hashedPassword,
        role: 'superuser',
        email: ADMIN_EMAIL,
        isVerified: true,
        isActive: true,
      });
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      user = await storage.createUser({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'superuser',
        isVerified: true,
        isActive: true,
      });
      console.log('Admin user created successfully!');
    }

    console.log('\n--- Admin credentials ---');
    console.log('Username:', ADMIN_USERNAME);
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Role: superuser');
    console.log('------------------------\n');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
