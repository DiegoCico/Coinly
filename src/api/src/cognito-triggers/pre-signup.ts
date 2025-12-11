import type { PreSignUpTriggerEvent, PreSignUpTriggerHandler } from 'aws-lambda';

/**
 * Pre-signup trigger for Cognito User Pool
 * This function runs before a user is created in the user pool
 */
export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  console.log('Pre-signup trigger event:', JSON.stringify(event, null, 2));

  try {
    // Auto-confirm email if it's from a trusted domain (optional)
    const email = event.request.userAttributes.email;
    const trustedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    
    if (email) {
      const domain = email.split('@')[1]?.toLowerCase();
      
      // Auto-confirm email for trusted domains
      if (trustedDomains.includes(domain)) {
        event.response.autoConfirmUser = false; // Still require email verification
        event.response.autoVerifyEmail = false; // Still require email verification
      }
    }

    // Set default custom attributes (this is handled in post-confirmation instead)
    // event.response.userAttributes is not available in pre-signup trigger

    // Validate email format (additional validation)
    if (email && !isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate name fields
    const givenName = event.request.userAttributes.given_name;
    const familyName = event.request.userAttributes.family_name;
    
    if (!givenName || givenName.trim().length < 1) {
      throw new Error('First name is required');
    }
    
    if (!familyName || familyName.trim().length < 1) {
      throw new Error('Last name is required');
    }

    // Log successful pre-signup
    console.log(`Pre-signup validation passed for user: ${email}`);

    return event;
  } catch (error) {
    console.error('Pre-signup trigger error:', error);
    throw error; // This will prevent user creation
  }
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}