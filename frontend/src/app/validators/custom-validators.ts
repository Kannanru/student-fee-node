// src/app/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validator to check if date is not in the future
   */
  static notFutureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (inputDate > today) {
        return { futureDate: { value: control.value } };
      }
      
      return null;
    };
  }

  /**
   * Validator to check if employee is at least 18 years old
   */
  static minimumAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;
      
      if (actualAge < minAge) {
        return { minimumAge: { required: minAge, actual: actualAge } };
      }
      
      return null;
    };
  }

  /**
   * Validator to check if joining date is after date of birth
   */
  static joiningDateAfterBirthDate(dobFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.parent) {
        return null;
      }
      
      const dob = control.parent.get(dobFieldName)?.value;
      if (!dob) {
        return null;
      }
      
      const birthDate = new Date(dob);
      const joinDate = new Date(control.value);
      
      if (joinDate <= birthDate) {
        return { joiningBeforeBirth: true };
      }
      
      return null;
    };
  }

  /**
   * Validator for uppercase alphanumeric employee ID
   */
  static employeeIdFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const pattern = /^[A-Z0-9]+$/;
      if (!pattern.test(control.value)) {
        return { invalidFormat: { value: control.value, expected: 'Uppercase letters and numbers only' } };
      }
      
      return null;
    };
  }

  /**
   * Validator for Indian phone number (10 digits starting with 6-9)
   */
  static indianPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const pattern = /^[6-9][0-9]{9}$/;
      if (!pattern.test(control.value)) {
        return { invalidPhone: { value: control.value, message: 'Phone must be 10 digits starting with 6-9' } };
      }
      
      return null;
    };
  }

  /**
   * Validator for Indian pincode (6 digits)
   */
  static indianPincode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Optional field
      }
      
      const pattern = /^[1-9][0-9]{5}$/;
      if (!pattern.test(control.value)) {
        return { invalidPincode: { value: control.value, message: 'Pincode must be 6 digits (not starting with 0)' } };
      }
      
      return null;
    };
  }

  /**
   * Validator to check if email domain is from allowed domains
   */
  static allowedEmailDomains(domains: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const email = control.value.toLowerCase();
      const domain = email.split('@')[1];
      
      if (domain && !domains.includes(domain)) {
        return { 
          invalidDomain: { 
            value: control.value, 
            allowedDomains: domains.join(', ') 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Validator for professional email format
   */
  static professionalEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const email = control.value.toLowerCase();
      
      // Check for common personal email domains
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1];
      
      if (domain && personalDomains.includes(domain)) {
        return { 
          personalEmail: { 
            value: control.value, 
            message: 'Please use institutional email address' 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to ensure non-negative numbers
   */
  static nonNegative(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      
      const value = Number(control.value);
      if (isNaN(value) || value < 0) {
        return { negative: { value: control.value } };
      }
      
      return null;
    };
  }

  /**
   * Validator to check maximum experience years (e.g., 50 years)
   */
  static maximumExperience(maxYears: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      
      const value = Number(control.value);
      if (isNaN(value) || value > maxYears) {
        return { excessiveExperience: { max: maxYears, actual: value } };
      }
      
      return null;
    };
  }

  /**
   * Validator to check if name contains only letters and spaces
   */
  static nameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const pattern = /^[a-zA-Z\s'-]+$/;
      if (!pattern.test(control.value)) {
        return { 
          invalidName: { 
            value: control.value, 
            message: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Validator to trim and check for whitespace-only strings
   */
  static noWhitespaceOnly(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const isWhitespace = (control.value || '').trim().length === 0;
      if (isWhitespace) {
        return { whitespaceOnly: true };
      }
      
      return null;
    };
  }

  /**
   * Cross-field validator to ensure joining date is reasonable after DOB
   */
  static joiningDateValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const dob = formGroup.get('dateOfBirth')?.value;
      const joiningDate = formGroup.get('joiningDate')?.value;
      
      if (!dob || !joiningDate) {
        return null;
      }
      
      const birthDate = new Date(dob);
      const joinDate = new Date(joiningDate);
      
      // Calculate age at joining
      const ageAtJoining = joinDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = joinDate.getMonth() - birthDate.getMonth();
      
      const actualAgeAtJoining = monthDiff < 0 || (monthDiff === 0 && joinDate.getDate() < birthDate.getDate())
        ? ageAtJoining - 1
        : ageAtJoining;
      
      // Minimum age to join should be 18
      if (actualAgeAtJoining < 18) {
        return { ageAtJoining: { minimum: 18, actual: actualAgeAtJoining } };
      }
      
      return null;
    };
  }
}
