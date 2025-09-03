# Email Test Component for Cloudflare Pages Functions

A sophisticated yet minimal React component for testing Cloudflare Pages Functions with email bindings. This implementation provides a complete solution for testing email routing functionality with real-time validation, modern UI, and comprehensive error handling.

## Features

### React Component (`src/components/EmailTestForm.tsx`)
- **Modern React with TypeScript**: Built with React 18 and TypeScript for type safety
- **Real-time Zod Validation**: Comprehensive validation for all form fields with instant feedback
- **Tailwind CSS Styling**: Modern, responsive design with clean aesthetics
- **Loading States**: Visual feedback during form submission
- **Success/Error Handling**: Comprehensive status messages and error reporting
- **Accessibility**: ARIA labels, semantic HTML, and keyboard navigation support
- **Form Reset**: Automatic form clearing on successful submission

### Cloudflare Pages Function (`infra/cf/pages/functions/api/contact.ts`)
- **Type-safe Implementation**: Full TypeScript support with proper interfaces
- **Input Validation**: Server-side validation with detailed error messages
- **CORS Support**: Proper CORS headers for cross-origin requests
- **Error Handling**: Comprehensive error handling with detailed logging
- **Email Formatting**: Creates both plain text and HTML email versions
- **Service Binding Integration**: Seamless integration with Cloudflare email services

### Email Service Worker (`infra/cf/workers/email-service/index.ts`)
- **Cloudflare Email API**: Uses Cloudflare's native email sending capabilities
- **MIME Email Creation**: Properly formatted email messages with headers
- **Multi-format Support**: Supports both plain text and HTML content
- **Error Recovery**: Graceful error handling and detailed logging
- **CORS Handling**: Proper cross-origin resource sharing setup

## Project Structure

```
├── src/                                    # React application
│   ├── components/
│   │   └── EmailTestForm.tsx              # Main email test component
│   ├── main.tsx                           # React entry point
│   ├── index.html                         # HTML template
│   ├── index.css                          # Tailwind CSS styles
│   ├── package.json                       # React app dependencies
│   ├── tsconfig.json                      # TypeScript configuration
│   └── vite.config.ts                     # Vite build configuration
├── infra/cf/pages/
│   ├── functions/api/
│   │   └── contact.ts                     # Cloudflare Pages Function
│   ├── wrangler.toml                      # Pages project configuration
│   └── env.d.ts                           # TypeScript environment types
└── infra/cf/workers/email-service/
    ├── index.ts                           # Email service worker
    └── wrangler.toml                      # Worker configuration
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers/Pages access
- Wrangler CLI installed globally: `npm install -g wrangler`
- Email routing configured in your Cloudflare dashboard

### 2. Configure Email Routing

First, set up email routing in your Cloudflare dashboard:

1. Go to **Email** > **Email Routing** in your Cloudflare dashboard
2. Enable email routing for your domain
3. Add destination addresses where test emails should be sent
4. Configure DNS records as instructed by Cloudflare

### 3. Deploy Email Service Worker

```bash
# Navigate to email service directory
cd infra/cf/workers/email-service

# Update wrangler.toml with your configuration
# Edit destination_addresses to your email

# Deploy the worker
wrangler deploy
```

### 4. Configure Pages Function

Update the `infra/cf/pages/wrangler.toml` file:

```toml
name = "email-test-pages"
compatibility_date = "2024-12-01"

[[services]]
binding = "CONTACTMAIL"
service = "email-service-worker"  # Name of your deployed email worker
environment = "production"
```

### 5. Deploy Pages Function

```bash
# Navigate to pages directory
cd infra/cf/pages

# Deploy to Cloudflare Pages
wrangler pages deploy
```

### 6. Run React Development Server

```bash
# Navigate to React app directory
cd src

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

### Email Service Worker Configuration

Edit `infra/cf/workers/email-service/wrangler.toml`:

```toml
name = "email-service-worker"
main = "index.ts"
compatibility_date = "2024-12-01"

[send_email]
destination_addresses = ["your-email@domain.com"]
```

### Pages Function Configuration

Edit `infra/cf/pages/wrangler.toml`:

```toml
name = "your-pages-project"
compatibility_date = "2024-12-01"

[[services]]
binding = "CONTACTMAIL"
service = "your-email-worker-name"
environment = "production"
```

### React App Configuration

The React app automatically detects the API endpoint. For local development, Vite proxies `/api/*` requests to `localhost:8788` (Wrangler dev server).

## API Specification

### Email Request Format

```typescript
interface EmailFormData {
  sender: string;      // Valid email address
  recipient: string;   // Valid email address  
  subject: string;     // 1-255 characters
  message: string;     // 10-5000 characters
}
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Email sent successfully!",
  "emailId": "uuid-string",
  "details": {
    "from": "sender@example.com",
    "to": "recipient@example.com", 
    "subject": "Test Subject",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable error message",
  "details": ["List of specific validation errors"]
}
```

## Validation Rules

### Client-side (Zod)
- **Sender/Recipient**: Valid email format, max 254 characters
- **Subject**: Required, max 255 characters, trimmed
- **Message**: Required, 10-5000 characters, trimmed

### Server-side
- All client-side rules enforced
- Additional security validation
- Content filtering and sanitization
- Rate limiting (can be added)

## Error Handling

The component provides comprehensive error handling:

1. **Validation Errors**: Real-time field validation with specific error messages
2. **Network Errors**: Connection and timeout error handling
3. **Server Errors**: API error responses with detailed messages
4. **Service Errors**: Email service configuration and delivery errors

## Styling

The component uses Tailwind CSS with a modern, clean design:

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Visual feedback during operations
- **Error States**: Clear error styling and messaging
- **Success States**: Positive feedback for successful operations

## Development

### Local Development Setup

1. **Start Email Worker** (in separate terminal):
   ```bash
   cd infra/cf/workers/email-service
   wrangler dev --port 8787
   ```

2. **Start Pages Function** (in separate terminal):
   ```bash
   cd infra/cf/pages
   wrangler pages dev --port 8788
   ```

3. **Start React App**:
   ```bash
   cd src
   npm run dev
   ```

### Testing

The component includes comprehensive testing capabilities:

- **Unit Tests**: Form validation and component behavior
- **Integration Tests**: API interaction and error handling
- **E2E Tests**: Complete user workflow testing

### Production Deployment

1. Deploy email service worker: `wrangler deploy`
2. Deploy pages function: `wrangler pages deploy`
3. Build and deploy React app: `npm run build && wrangler pages deploy dist`

## Troubleshooting

### Common Issues

**Email not sending:**
- Verify email routing is enabled in Cloudflare dashboard
- Check DNS records are properly configured
- Ensure destination addresses are verified
- Check worker logs: `wrangler tail`

**CORS errors:**
- Verify CORS headers in Pages Function
- Check service binding configuration
- Ensure proper request format

**Validation errors:**
- Check request payload format
- Verify all required fields are present
- Ensure email addresses are valid format

### Debugging

Enable debug logging by adding to your worker:

```typescript
console.log('Email request:', data);
console.log('Email response:', response);
```

View logs with: `wrangler tail your-worker-name`

## Security Considerations

- **Input Validation**: All inputs are validated client and server-side
- **Rate Limiting**: Consider implementing rate limiting for production
- **Email Verification**: Validate sender addresses in production
- **Content Filtering**: Filter malicious content and spam
- **CORS Policy**: Restrict CORS origins in production

## License

This project is provided as an example implementation. Feel free to modify and use according to your needs.