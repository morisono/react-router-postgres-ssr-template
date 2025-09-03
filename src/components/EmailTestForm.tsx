import React, { useState } from 'react';
import { z } from 'zod';

// TypeScript interfaces for form data and API responses
interface EmailFormData {
  sender: string;
  recipient: string;
  subject: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

// Zod validation schema for email form
const emailFormSchema = z.object({
  sender: z
    .string()
    .min(1, "Sender email is required")
    .email("Please enter a valid sender email address")
    .max(254, "Email address is too long"),
  recipient: z
    .string()
    .min(1, "Recipient email is required")
    .email("Please enter a valid recipient email address")
    .max(254, "Email address is too long"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject must be less than 255 characters")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(5000, "Message must be less than 5000 characters")
    .trim(),
});

// Helper function to encode form data for Cloudflare Function
function encodeFormData(data: EmailFormData): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

const EmailTestForm: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<EmailFormData>({
    sender: '',
    recipient: '',
    subject: '',
    message: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState<Partial<Record<keyof EmailFormData, string>>>({});

  // Loading and status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Real-time validation handler
  const validateField = (name: keyof EmailFormData, value: string) => {
    try {
      emailFormSchema.pick({ [name]: true }).parse({ [name]: value });
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0]?.message || 'Invalid input'
        }));
      }
    }
  };

  // Input change handler with real-time validation
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof EmailFormData;

    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Debounced validation for better UX
    if (value.length > 0) {
      setTimeout(() => validateField(fieldName, value), 300);
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous status
    setSubmitStatus('idle');
    setStatusMessage('');

    // Validate entire form
    try {
      emailFormSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EmailFormData, string>> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof EmailFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Send POST request to Cloudflare Pages Function
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodeFormData(formData),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setStatusMessage(
          result.message ||
          `Email sent successfully! ${result.emailId ? `Email ID: ${result.emailId}` : ''}`
        );

        // Reset form on successful submission
        setFormData({
          sender: '',
          recipient: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setStatusMessage(
          result.error ||
          result.message ||
          `Failed to send email. Server responded with status ${response.status}.`
        );
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setSubmitStatus('error');
      setStatusMessage(
        'Network error occurred while sending email. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = Object.values(errors).every(error => !error) &&
                     Object.values(formData).every(value => value.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Email Routing Test
        </h1>
        <p className="text-gray-600">
          Test your Cloudflare Pages Function with email bindings.
          This form will send a test email using Cloudflare's email routing functionality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="sender"
            className="block text-sm font-medium text-gray-700"
          >
            Sender Email
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            id="sender"
            name="sender"
            value={formData.sender}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.sender
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            placeholder="sender@example.com"
            autoComplete="email"
          />
          {errors.sender && (
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.sender}
            </p>
          )}
        </div>

        {/* Recipient Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700"
          >
            Recipient Email
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.recipient
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            placeholder="recipient@example.com"
            autoComplete="email"
          />
          {errors.recipient && (
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.recipient}
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700"
          >
            Subject
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.subject
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            placeholder="Test email subject"
            maxLength={255}
          />
          {errors.subject && (
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed resize-y
              ${errors.message
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            placeholder="Enter your test message here..."
            maxLength={5000}
          />
          <div className="flex justify-between items-center">
            {errors.message ? (
              <p className="text-red-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.message}
              </p>
            ) : (
              <div></div>
            )}
            <span className="text-sm text-gray-500">
              {formData.message.length}/5000
            </span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`
            p-4 rounded-lg border flex items-start space-x-3
            ${submitStatus === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            {submitStatus === 'success' ? (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm">{statusMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed
              ${isSubmitting || !isFormValid
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Email...
              </span>
            ) : (
              'Send Test Email'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Testing Email Routing
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>This form tests your Cloudflare Pages Function with email bindings</li>
          <li>Make sure your email routing is properly configured in Cloudflare</li>
          <li>Check your email binding configuration in wrangler.toml</li>
          <li>Verify your send email worker is deployed and accessible</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailTestForm;