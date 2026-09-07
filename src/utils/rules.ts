import { RegisterOptions } from "react-hook-form";

export type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  password: string;
  confirmPassword: string;
};

// Validation rules for signup form
export const signupRules: {
  firstName: RegisterOptions<SignupFormData, "firstName">;
  lastName: RegisterOptions<SignupFormData, "lastName">;
  email: RegisterOptions<SignupFormData, "email">;
  password: RegisterOptions<SignupFormData, "password">;
  confirmPassword: RegisterOptions<SignupFormData, "confirmPassword">;
} = {
  firstName: {
    required: "First name is required",
    minLength: {
      value: 2,
      message: "First name must be at least 2 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: "First name can only contain letters, spaces, hyphens, and apostrophes",
    },
  },
  lastName: {
    required: "Last name is required",
    minLength: {
      value: 2,
      message: "Last name must be at least 2 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: "Last name can only contain letters, spaces, hyphens, and apostrophes",
    },
  },
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
  },
};

export type ProfileSetupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
};

// Validation rules for profile setup form
export const profileSetupRules: {
  firstName: RegisterOptions<ProfileSetupFormData, "firstName">;
  lastName: RegisterOptions<ProfileSetupFormData, "lastName">;
  email: RegisterOptions<ProfileSetupFormData, "email">;
  dateOfBirth: RegisterOptions<ProfileSetupFormData, "dateOfBirth">;
  gender: RegisterOptions<ProfileSetupFormData, "gender">
} = {
  firstName: {
    minLength: {
      value: 2,
      message: "First name must be at least 2 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: "First name can only contain letters, spaces, hyphens, and apostrophes",
    },
  },
  lastName: {
    minLength: {
      value: 2,
      message: "Last name must be at least 2 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: "Last name can only contain letters, spaces, hyphens, and apostrophes",
    },
  },
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  dateOfBirth: {
    required: "Date of birth is required",
  },
  gender: {
    // Optional field, no validation needed
  },
};

export type SigninFormData = {
  email: string;
  password: string;
};

// Validation rules for signin form
export const signinRules: {
  email: RegisterOptions<SigninFormData, "email">;
  password: RegisterOptions<SigninFormData, "password">;
} = {
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
  },
};

export type ForgotPasswordFormData = {
  email: string;
};

// Validation rules for forgot password form
export const forgotPasswordRules: {
  email: RegisterOptions<ForgotPasswordFormData, "email">;
} = {
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
};

export type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

// Validation rules for reset password form
export const resetPasswordRules: {
  password: RegisterOptions<ResetPasswordFormData, "password">;
  confirmPassword: RegisterOptions<ResetPasswordFormData, "confirmPassword">;
} = {
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
  },
};

export type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Validation rules for change password form
export const changePasswordRules: {
  currentPassword: RegisterOptions<ChangePasswordFormData, "currentPassword">;
  newPassword: RegisterOptions<ChangePasswordFormData, "newPassword">;
  confirmPassword: RegisterOptions<ChangePasswordFormData, "confirmPassword">;
} = {
  currentPassword: {
    required: "Current password is required",
  },
  newPassword: {
    required: "New password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
  },
};

export type ContactUsFormData = {
  fullName: string;
  email: string;
  message: string;
};

// Validation rules for contact us form
export const contactUsRules: {
  fullName: RegisterOptions<ContactUsFormData, "fullName">;
  email: RegisterOptions<ContactUsFormData, "email">;
  message: RegisterOptions<ContactUsFormData, "message">;
} = {
  fullName: {
    required: "Full name is required",
    minLength: {
      value: 2,
      message: "Full name must be at least 2 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: "Full name can only contain letters, spaces, hyphens, and apostrophes",
    },
  },
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  message: {
    required: "Message is required",
    minLength: {
      value: 10,
      message: "Message must be at least 10 characters",
    },
  },
};

