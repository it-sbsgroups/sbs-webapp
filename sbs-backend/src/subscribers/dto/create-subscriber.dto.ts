// src/subscribers/dto/create-subscriber.dto.ts

// ============================================================
// IMPORT SECTION - Understanding what each import does
// ============================================================

// VALIDATION DECORATORS from 'class-validator'
// These decorators automatically check incoming data before it reaches your service
// If validation fails, NestJS returns 400 Bad Request automatically
import {
  IsEmail,        // Validates email format (checks for @ symbol, domain, etc.)
                  // Example: "notanemail" fails, "user@example.com" passes
                  
  IsNotEmpty,     // Ensures the field is not: null, undefined, or empty string
                  // Example: "" fails, "hello" passes
                  
  IsString,       // Validates that the value is a JavaScript string type
                  // Example: 123 fails (number), "123" passes (string)
                  
  IsOptional,     // Marks a field as optional - if not provided, skips all other validation
                  // IMPORTANT: Without this, missing optional fields would throw errors
                  
  Matches,        // Validates against a Regular Expression pattern
                  // Example: @Matches(/^\+91/) ensures string starts with +91
                  
  MaxLength,      // Maximum string length validation
                  // Prevents overly long inputs that could cause buffer overflow
                  
  MinLength,      // Minimum string length validation
                  // Ensures the field isn't just whitespace
                  
  Validate,       // Used with CUSTOM validation classes
                  // Allows you to create reusable validation rules
                  
  ValidatorConstraint,           // Decorator for creating custom validation classes
  ValidatorConstraintInterface,  // Interface that custom validators must implement
  ValidationArguments,           // Provides metadata about the field being validated
                                 // (field name, constraints, object, etc.)
} from 'class-validator';

// TRANSFORMATION DECORATORS from 'class-transformer'
// These automatically CLEAN and MODIFY the data before validation runs
// This is your FIRST LINE OF DEFENSE against malicious input
import {
  Transform,  // Executes a function to transform the value
               // Example: @Transform(({ value }) => value.toLowerCase())
               // Changes "John@Example.com" to "john@example.com"
               
  Type,        // Converts the value to a specific JavaScript type
               // Query parameters come as strings, so ?page=1 is string "1"
               // @Type(() => Number) converts it to number 1
} from 'class-transformer';

// SWAGGER DOCUMENTATION DECORATORS
// These don't affect functionality but auto-generate API documentation
// They appear in Swagger UI at /api/docs when you set up Swagger
import {
  ApiProperty,         // Documents a REQUIRED field in Swagger
                       // Shows the field as required in the API docs
                       
  ApiPropertyOptional, // Documents an OPTIONAL field in Swagger
                       // Shows the field with "optional" badge in docs
} from '@nestjs/swagger';


// ============================================================
// CUSTOM VALIDATORS - Reusable validation rules
// ============================================================

/**
 * CUSTOM VALIDATOR: Indian Mobile Number Validation
 * 
 * This validator ensures mobile numbers follow India's format:
 * - Must start with +91 (India's country code)
 * - Followed by exactly 10 digits
 * - First digit after +91 must be 6-9 (valid Indian mobile prefixes)
 * 
 * Why custom validator? Because @Matches() alone doesn't provide
 * meaningful error messages for mobile-specific formats.
 */
@ValidatorConstraint({ 
  name: 'isIndianMobile',  // Name used to reference this validator
  async: false              // false = synchronous validation (no DB calls)
})
export class IsIndianMobile implements ValidatorConstraintInterface {
  
  /**
   * VALIDATE METHOD
   * This runs automatically when the decorator is applied
   * @param mobile - The actual value being validated (from user input)
   * @returns true if valid, false if invalid
   */
  validate(mobile: string) {
    // Check if value is provided (handles optional fields)
    if (!mobile) return true; // Let @IsOptional() handle required check
    
    // INDIAN MOBILE FORMAT: +91 followed by 10 digits
    // Pattern breakdown:
    // ^\+91    - Starts with +91 (^ means start, \+ escapes the +)
    // [6-9]    - First digit must be 6,7,8, or 9 (valid Indian prefixes)
    // \d{9}$   - Followed by exactly 9 more digits ($ means end)
    return /^\+91[6-9]\d{9}$/.test(mobile);
    
    // Valid examples:   +919876543210, +917654321098
    // Invalid examples:  +911234567890 (starts with 1), +91987654321 (11 digits)
  }

  /**
   * DEFAULT ERROR MESSAGE
   * This message is returned when validation fails
   * @param args - Contains metadata about the field being validated
   *               args.property = field name (e.g., "mobile")
   */
  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid Indian mobile number (+91 followed by 10 digits starting with 6-9)`;
    // Example output: "mobile must be a valid Indian mobile number..."
  }
}


/**
 * CUSTOM VALIDATOR: XSS & Script Injection Prevention
 * 
 * This validator blocks common Cross-Site Scripting (XSS) attempts.
 * It checks for patterns commonly used in XSS attacks.
 * 
 * IMPORTANT: This is just ONE LAYER of security.
 * You should also sanitize data in your service layer and
 * encode output when rendering in HTML.
 */
@ValidatorConstraint({ 
  name: 'noXssOrScript',  // Name for referencing this validator
  async: false             // Synchronous validation
})
export class NoXssOrScript implements ValidatorConstraintInterface {
  
  /**
   * VALIDATE METHOD
   * Checks if the input contains dangerous patterns
   */
  validate(text: string) {
    // If no value provided, skip check (let other validators handle required/optional)
    if (!text) return true;
    
    // LIST OF DANGEROUS XSS PATTERNS
    // Each pattern represents a common XSS attack vector
    const dangerousPatterns = [
      // Script tag injection - Most common XSS attack
      // Matches: <script>, <SCRIPT>, <script type="text/javascript">
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      
      // JavaScript protocol in URLs
      // Matches: javascript:alert(1), javascript://comment%0Aalert(1)
      /javascript:/gi,
      
      // HTML event handlers
      // Matches: onclick=, onerror=, onload=, onmouseover=
      // These execute JavaScript when events fire
      /on\w+\s*=/gi,
      
      // HTML elements that can contain malicious content
      /<iframe/gi,    // iframe can load external malicious pages
      /<embed/gi,     // embed can load malicious plugins
      /<object/gi,    // object can load ActiveX/Flash exploits
      /<style/gi,     // style can contain CSS expressions (IE vulnerability)
      
      // Data URI attacks - Embed malicious content directly in HTML
      // Matches: data:text/html,<script>alert(1)</script>
      /data:text\/html/gi,
      
      // CSS expression attacks (older IE browsers)
      // Matches: expression(alert(1))
      /expression\s*\(/gi,
      
      // JavaScript function calls that could be injected
      /eval\s*\(/gi,          // eval() executes string as code
      /document\.cookie/gi,   // Cookie theft attempts
      /document\.write/gi,    // Document manipulation
      /window\.location/gi,   // Redirect attacks
      
      // Encoded characters that bypass simple filters
      /&#x[0-9a-f]+;/gi,     // HTML hex entities: &#x3C; = <
      /&#[0-9]+;/gi,          // HTML decimal entities: &#60; = <
      /\\x[0-9a-f]{2}/gi,    // Hex escape sequences: \x3C = <
      /\\u[0-9a-f]{4}/gi,    // Unicode escape sequences: \u003C = <
    ];

    // Check each pattern against the input
    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        return false; // Found dangerous content! Reject this input
      }
    }
    
    return true; // Input is clean (no known XSS patterns found)
  }

  /**
   * ERROR MESSAGE FOR FAILED VALIDATION
   */
  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains potentially unsafe content`;
  }
}


// ============================================================
// MAIN DTO CLASS
// This defines the SHAPE and VALIDATION RULES for subscriber data
// ============================================================

export class CreateSubscriberDto {
  
  // ==========================================================
  // EMAIL FIELD - The ONLY required field
  // ==========================================================
  
  @ApiProperty({
    description: 'Email address for newsletter subscription (REQUIRED)',
    example: 'user@example.com',
    required: true,  // Shows red asterisk in Swagger UI
  })
  
  // ----- VALIDATION RULES (executed in order) -----
  
  @IsEmail({}, {
    message: 'Please provide a valid email address',
  })
  // The empty {} means use default email validation options
  // Options you could add:
  // { allow_display_name: true } - Allows "John Doe <john@example.com>"
  // { allow_ip_domain: true } - Allows "user@[192.168.1.1]"
  // { domain_specific_validation: true } - Checks for common typos
  
  @IsNotEmpty({
    message: 'Email address is required for subscription',
  })
  // Ensures the field is provided and not empty
  // This is critical because email is our primary identifier
  
  @MaxLength(250, {
    message: 'Email address cannot exceed 250 characters',
  })
  // RFC 5321 allows up to 254 characters
  // We use 250 for a small safety margin
  // Example of 250+ char email:
  // very.long.name.that.goes.on.forever@extremely.long.domain.name.co.in
  
  @MinLength(5, {
    message: 'Email address is too short to be valid',
  })
  // Shortest valid email: a@b.co (6 chars)
  // This prevents obviously invalid inputs like "a" or "ab"
  
  @Validate(NoXssOrScript, {
    message: 'Email address contains potentially unsafe content',
  })
  // Apply our custom XSS validator
  // Checks for script tags, JavaScript URLs, etc.
  
  // ----- DATA TRANSFORMATION (runs BEFORE validation) -----
  
  @Transform(({ value }) => {
    // value = whatever the user sent in the request body
    
    // 1. Ensure it's a string
    if (typeof value !== 'string') return value;
    
    // 2. Trim whitespace from both ends
    // "  user@example.com  " → "user@example.com"
    let cleaned = value.trim();
    
    // 3. Convert to lowercase (emails are case-insensitive)
    // "User@Example.com" → "user@example.com"
    cleaned = cleaned.toLowerCase();
    
    // 4. Remove any HTML tags (defense in depth)
    // "<script>user@example.com</script>" → "user@example.com"
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // 5. Remove JavaScript protocol if somehow present
    // "javascript:user@example.com" → "user@example.com"
    cleaned = cleaned.replace(/javascript:/gi, '');
    
    // 6. Remove any remaining whitespace characters
    // (tabs, newlines, etc. replaced with single space)
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    return cleaned;
  })
  email: string;  // TypeScript type annotation for compile-time checking


  // ==========================================================
  // FIRST NAME - Optional field
  // ==========================================================
  
  @ApiPropertyOptional({
    description: 'First name (optional - not required for subscription)',
    example: 'Rahul',
  })
  // Using @ApiPropertyOptional instead of @ApiProperty
  // This tells Swagger this field is NOT required
  
  // ----- VALIDATION RULES -----
  
  @IsOptional()
  // CRITICAL: This makes the field optional
  // Without this, NestJS would require firstName in every request
  // With this, requests without firstName are accepted
  
  @IsString({
    message: 'First name must be text',
  })
  // Only allows JavaScript strings
  // Rejects: numbers (123), arrays ([]), objects ({})
  
  @MinLength(1, {
    message: 'First name cannot be empty if provided',
  })
  // If someone includes firstName, it must have at least 1 character
  // Prevents: { firstName: "" }
  
  @MaxLength(50, {
    message: 'First name cannot exceed 50 characters',
  })
  // Matches database constraint: @db.VarChar(50)
  // Longest recorded first name is about 40 characters
  // 50 gives room for most names worldwide
  
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  // REGEX BREAKDOWN:
  // ^           - Start of string
  // [a-zA-Z]    - Letters only (no numbers, no special chars)
  // \s          - Space allowed (for compound first names like "Mary Jane")
  // \-          - Hyphen allowed (for hyphenated names like "Mary-Jane")
  // '           - Apostrophe allowed (for names like "O'Brien")
  // +           - One or more characters
  // $           - End of string
  // 
  // This prevents: "Rahul123", "Rahul<script>", "Rahul@#$"
  // Allows: "Rahul", "Mary Jane", "O'Brien", "Anna-Marie"
  
  @Validate(NoXssOrScript, {
    message: 'First name contains potentially unsafe content',
  })
  // Even though we limit characters with @Matches,
  // this adds an extra security layer
  
  // ----- DATA TRANSFORMATION -----
  
  @Transform(({ value }) => {
    // Only transform if value exists (since field is optional)
    if (typeof value !== 'string' || !value) return value;
    
    // 1. Remove ALL HTML tags
    // Even though @Matches should block < > characters,
    // this is defense in depth
    let cleaned = value.replace(/<[^>]*>/g, '');
    
    // 2. Remove JavaScript protocol
    cleaned = cleaned.replace(/javascript:/gi, '');
    
    // 3. Remove HTML event handlers
    cleaned = cleaned.replace(/on\w+\s*=/gi, '');
    
    // 4. Trim whitespace
    cleaned = cleaned.trim();
    
    // 5. Capitalize first letter for consistency
    // "rahul" → "Rahul"
    // "MARY" → "Mary"
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
    
    return cleaned;
  })
  firstName?: string;  // The ? makes it optional in TypeScript type system
  // This tells TypeScript the property might be undefined


  // ==========================================================
  // MIDDLE NAME - Optional field
  // ==========================================================
  
  @ApiPropertyOptional({
    description: 'Middle name (optional)',
    example: 'Kumar',
  })
  
  @IsOptional()
  // Makes middleName completely optional
  // Request can omit this field entirely
  
  @IsString({
    message: 'Middle name must be text',
  })
  
  @MaxLength(50, {
    message: 'Middle name cannot exceed 50 characters',
  })
  // Matches database constraint
  
  @Matches(/^[a-zA-Z\s\-']*$/, {
    message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes',
  })
  // Note: * instead of + allows empty string
  // Because middle name could legitimately be empty
  
  @Validate(NoXssOrScript, {
    message: 'Middle name contains potentially unsafe content',
  })
  
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value) return value;
    
    // Strip dangerous content
    let cleaned = value.replace(/<[^>]*>/g, '');
    cleaned = cleaned.replace(/javascript:/gi, '');
    cleaned = cleaned.replace(/on\w+\s*=/gi, '');
    cleaned = cleaned.trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
    
    return cleaned;
  })
  middleName?: string;


  // ==========================================================
  // LAST NAME - Optional field
  // ==========================================================
  
  @ApiPropertyOptional({
    description: 'Last name / Surname (optional)',
    example: 'Sharma',
  })
  
  @IsOptional()
  
  @IsString({
    message: 'Last name must be text',
  })
  
  @MaxLength(50, {
    message: 'Last name cannot exceed 50 characters',
  })
  
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  
  @Validate(NoXssOrScript, {
    message: 'Last name contains potentially unsafe content',
  })
  
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value) return value;
    
    let cleaned = value.replace(/<[^>]*>/g, '');
    cleaned = cleaned.replace(/javascript:/gi, '');
    cleaned = cleaned.replace(/on\w+\s*=/gi, '');
    cleaned = cleaned.trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
    
    return cleaned;
  })
  lastName?: string;


  // ==========================================================
  // MOBILE NUMBER - Optional field (Indian format)
  // ==========================================================
  
  @ApiPropertyOptional({
    description: 'Indian mobile number with country code (e.g., +919876543210)',
    example: '+919876543210',
  })
  
  @IsOptional()
  
  @IsString({
    message: 'Mobile number must be text',
  })
  // Phone numbers should be strings, not numbers
  // Why? Because:
  // - Leading zeros matter (0976543210 vs 976543210)
  // - The + sign is crucial for country code
  // - Numbers can't hold the full value (97654321098 > Number.MAX_SAFE_INTEGER)
  
  @Validate(IsIndianMobile, {
    message: 'Please provide a valid Indian mobile number',
  })
  // Uses our custom validator at the top of this file
  // Checks: +91 followed by 10 digits starting with 6-9
  
  // ----- DATA TRANSFORMATION -----
  
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value) return value;
    
    // 1. Remove all whitespace, dashes, and parentheses
    // "+91 98765-43210" → "+919876543210"
    // "+91 (987) 654-3210" → "+919876543210"
    let cleaned = value.replace(/[\s\-\(\)]/g, '');
    
    // 2. Normalize country code format
    if (!cleaned.startsWith('+91')) {
      if (cleaned.startsWith('91')) {
        // "919876543210" → "+919876543210"
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        // "9876543210" → "+919876543210"
        // User provided just the 10-digit number, add country code
        cleaned = '+91' + cleaned;
      }
      // If it doesn't match any known format, leave as-is
      // The validator will catch and reject it
    }
    
    return cleaned;
  })
  mobile?: string;


  // ==========================================================
  // WHATSAPP NUMBER - Optional field
  // ==========================================================
  
  @ApiPropertyOptional({
    description: 'WhatsApp number if different from mobile (optional)',
    example: '+919876543210',
  })
  
  @IsOptional()
  
  @IsString({
    message: 'WhatsApp number must be text',
  })
  
  @Validate(IsIndianMobile, {
    message: 'Please provide a valid Indian WhatsApp number',
  })
  // Reuses the same Indian mobile validator
  // Same format as mobile number
  
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value) return value;
    
    // Same cleaning as mobile number
    let cleaned = value.replace(/[\s\-\(\)]/g, '');
    
    if (!cleaned.startsWith('+91')) {
      if (cleaned.startsWith('91')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        cleaned = '+91' + cleaned;
      }
    }
    
    return cleaned;
  })
  whatsapp?: string;
}