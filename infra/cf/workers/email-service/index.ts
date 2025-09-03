export interface Env {
  SEND_EMAIL: SendEmail;
}

// Declare EmailMessage constructor
declare const EmailMessage: {
  new (from: string, to: string, raw: string): EmailMessage;
};

interface EmailRequestData {
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  subject: string;
  content: { type: string; value: string }[];
}

function createRawEmailContent(data: EmailRequestData): string {
  const textContent = data.content.find(c => c.type === 'text/plain')?.value || '';
  const htmlContent = data.content.find(c => c.type === 'text/html')?.value || '';

  const boundary = `----=_Part_${Math.random().toString(36).substr(2, 9)}`;
  const date = new Date().toUTCString();

  let rawEmail = `From: ${data.from.name ? `${data.from.name} <${data.from.email}>` : data.from.email}\r\n`;
  rawEmail += `To: ${data.to.map(t => t.name ? `${t.name} <${t.email}>` : t.email).join(', ')}\r\n`;
  rawEmail += `Subject: ${data.subject}\r\n`;
  rawEmail += `Date: ${date}\r\n`;
  rawEmail += `MIME-Version: 1.0\r\n`;

  if (textContent && htmlContent) {
    rawEmail += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    rawEmail += `--${boundary}\r\n`;
    rawEmail += `Content-Type: text/plain; charset=utf-8\r\n`;
    rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    rawEmail += `${textContent}\r\n\r\n`;
    rawEmail += `--${boundary}\r\n`;
    rawEmail += `Content-Type: text/html; charset=utf-8\r\n`;
    rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    rawEmail += `${htmlContent}\r\n\r\n`;
    rawEmail += `--${boundary}--\r\n`;
  } else if (htmlContent) {
    rawEmail += `Content-Type: text/html; charset=utf-8\r\n`;
    rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    rawEmail += `${htmlContent}\r\n`;
  } else {
    rawEmail += `Content-Type: text/plain; charset=utf-8\r\n`;
    rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    rawEmail += `${textContent}\r\n`;
  }

  return rawEmail;
}

function createEmailMessage(data: EmailRequestData): EmailMessage {
  const rawContent = createRawEmailContent(data);

  // Create EmailMessage using the declared constructor
  return new EmailMessage(
    data.from.email,
    data.to[0].email, // Primary recipient
    rawContent
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Method not allowed'
        }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      }

      // Check if email binding is available
      if (!env.SEND_EMAIL) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Email service not configured'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      }

      const data = await request.json() as EmailRequestData;

      // Basic validation
      if (!data.from?.email || !data.to?.length || !data.subject || !data.content?.length) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: from, to, subject, and content are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      }

      // Create email message
      const emailMessage = createEmailMessage(data);

      try {
        // Send email using Cloudflare's Send Email binding
        await env.SEND_EMAIL.send(emailMessage);

        const emailId = crypto.randomUUID();

        return new Response(JSON.stringify({
          success: true,
          id: emailId,
          message: 'Email sent successfully',
          details: {
            from: data.from.email,
            to: data.to.map(t => t.email),
            subject: data.subject,
            timestamp: new Date().toISOString()
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      } catch (error) {
        console.error('Failed to send email:', error);

        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to send email',
          details: error instanceof Error ? error.message : 'Unknown error occurred',
          message: 'Email service encountered an error while processing your request'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        });
      }

    } catch (error) {
      console.error('Error processing email request:', error);

      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request format',
        details: error instanceof Error ? error.message : 'Request could not be parsed',
        message: 'Please check your request format and try again'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      });
    }
  },
};