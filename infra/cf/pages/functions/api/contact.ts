interface Env {
  CONTACTMAIL: Fetcher;
}

interface EmailMessage {
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  subject: string;
  content: {
    type: 'text/plain' | 'text/html';
    value: string;
  }[];
}

interface EmailFormData {
  sender: string;
  recipient: string;
  subject: string;
  message: string;
}

async function parseFormData(request: Request): Promise<EmailFormData> {
  const formData = await request.formData();
  return {
    sender: formData.get('sender') as string,
    recipient: formData.get('recipient') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  };
}

function validateEmailData(data: EmailFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.sender || !data.sender.includes('@')) {
    errors.push('Invalid sender email address');
  }

  if (!data.recipient || !data.recipient.includes('@')) {
    errors.push('Invalid recipient email address');
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function createEmailMessage(data: EmailFormData): EmailMessage {
  return {
    from: {
      email: data.sender,
    },
    to: [
      {
        email: data.recipient,
      }
    ],
    subject: data.subject,
    content: [
      {
        type: 'text/plain',
        value: data.message
      },
      {
        type: 'text/html',
        value: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">Test Email from Cloudflare Pages Function</h2>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>From:</strong> ${data.sender}</p>
                  <p><strong>Subject:</strong> ${data.subject}</p>
                </div>
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h3 style="margin-top: 0; color: #374151;">Message:</h3>
                  <p style="white-space: pre-wrap;">${data.message}</p>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
                  <p>This email was sent via Cloudflare Pages Function with Email Routing bindings.</p>
                  <p>Sent at: ${new Date().toISOString()}</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    ]
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Check if CONTACTMAIL service is available
    if (!context.env.CONTACTMAIL) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured. Please check your service bindings.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Parse form data
    const emailData = await parseFormData(context.request);

    // Validate the data
    const validation = validateEmailData(emailData);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Create email message
    const emailMessage = createEmailMessage(emailData);

    // Send email via the bound email service
    const emailRequest = new Request(context.request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailMessage)
    });

    const emailResponse = await context.env.CONTACTMAIL.fetch(emailRequest);

    if (emailResponse.ok) {
      const responseData = await emailResponse.text();
      let emailId: string | undefined;

      try {
        const parsedResponse = JSON.parse(responseData);
        emailId = parsedResponse.id || parsedResponse.messageId;
      } catch {
        // Response might not be JSON, that's okay
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully!',
        emailId,
        details: {
          from: emailData.sender,
          to: emailData.recipient,
          subject: emailData.subject,
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } else {
      const errorText = await emailResponse.text();
      console.error('Email service error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        body: errorText
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send email',
        message: `Email service returned ${emailResponse.status}: ${emailResponse.statusText}`,
        details: errorText
      }), {
        status: emailResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

  } catch (error) {
    console.error('Unexpected error in contact function:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};