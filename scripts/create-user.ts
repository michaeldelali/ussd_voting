#!/usr/bin/env ts-node

import { authService } from '../lib/utils/auth';

interface CreateUserOptions {
  email: string;
  password: string;
  name: string;
}

async function createUser(options: CreateUserOptions) {
  try {
    // Create the user
    console.log(`Creating user with email: ${options.email}`);
    const user = await authService.createUser(
      options.email,
      options.password,
      options.name
    );

    console.log('✅ User created successfully!');
    console.log('User details:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Active: ${user.isActive}`);
    console.log(`- Created: ${user.createdAt}`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        console.error('💡 This email is already registered. Please use a different email.');
      }
    }
    
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs(): CreateUserOptions {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: npm run create-user <email> <password> <name>');
    console.log('Example: npm run create-user admin@example.com mypassword "Admin User"');
    process.exit(1);
  }

  return {
    email: args[0],
    password: args[1],
    name: args[2]
  };
}

// Interactive mode for prompting user input
async function interactiveMode(): Promise<CreateUserOptions> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    console.log('📝 Creating a new user (Interactive mode)');
    console.log('Press Ctrl+C to cancel\n');

    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    const name = await question('Enter full name: ');

    rl.close();

    // Basic validation
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    return { email: email.trim(), password, name: name.trim() };

  } catch (error) {
    rl.close();
    throw error;
  }
}

// Main execution
async function main() {
  try {
    let options: CreateUserOptions;

    // Check if arguments were provided
    if (process.argv.length >= 5) {
      // Command line mode
      options = parseArgs();
    } else {
      // Interactive mode
      options = await interactiveMode();
    }

    await createUser(options);
    process.exit(0);

  } catch (error) {
    if (error instanceof Error && error.message !== 'All fields are required') {
      console.error('❌', error.message);
    }
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Operation cancelled by user');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

export { createUser };
