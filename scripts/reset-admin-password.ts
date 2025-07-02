import { hashPassword } from '../server/auth.js';
import { storage } from '../server/storage.js';

async function resetAdminPassword() {
  try {
    // Set admin password to 'admin123'
    const hashedPassword = await hashPassword('admin123');
    
    // Update the admin user's password
    await storage.updateUser(11, { 
      password: hashedPassword,
      isVerified: true,
      isActive: true 
    });
    
    console.log('Admin password reset successfully!');
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Email: admin@keru.ai');
    console.log('Password: admin123');
    console.log('Role: superuser');
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
  
  process.exit(0);
}

resetAdminPassword();