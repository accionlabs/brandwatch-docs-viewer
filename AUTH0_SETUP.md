# Auth0 Setup Guide

This guide will help you set up Auth0 authentication for the Brandwatch Documentation Viewer.

## Prerequisites

- An Auth0 account (sign up at https://auth0.com)
- Access to this GitHub repository settings (to add secrets)

## Step 1: Create an Auth0 Application

1. Log in to your Auth0 Dashboard
2. Navigate to **Applications** → **Applications**
3. Click **Create Application**
4. Choose a name (e.g., "Brandwatch Docs Viewer")
5. Select **Single Page Web Applications**
6. Click **Create**

## Step 2: Configure Application Settings

In your Auth0 application settings:

### Basic Information
- Note your **Domain** (e.g., `your-tenant.auth0.com`)
- Note your **Client ID**

### Application URIs

Set the following URIs based on your deployment:

**Allowed Callback URLs:**
```
http://localhost:3000,
https://accionlabs.github.io/brandwatch-docs-viewer
```

**Allowed Logout URLs:**
```
http://localhost:3000,
https://accionlabs.github.io/brandwatch-docs-viewer
```

**Allowed Web Origins:**
```
http://localhost:3000,
https://accionlabs.github.io
```

**Allowed Origins (CORS):**
```
http://localhost:3000,
https://accionlabs.github.io
```

Click **Save Changes** at the bottom of the page.

## Step 3: Local Development Setup

1. Copy the `.env.local` file content:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Auth0 credentials:
```env
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

3. Start the development server:
```bash
npm install
npm start
```

## Step 4: GitHub Repository Setup (for Production)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:

   - **AUTH0_DOMAIN**: Your Auth0 domain (e.g., `your-tenant.auth0.com`)
   - **AUTH0_CLIENT_ID**: Your Auth0 Client ID

## Step 5: Deploy to GitHub Pages

The GitHub Actions workflow will automatically build and deploy when you push to the `main` branch.

Manual deployment:
```bash
git add .
git commit -m "Add Auth0 authentication"
git push origin main
```

The workflow will:
1. Build the app with the Auth0 secrets
2. Deploy to GitHub Pages
3. Your app will be available at: https://accionlabs.github.io/brandwatch-docs-viewer

## Step 6: Test Authentication

1. Visit your deployed app
2. Click "Log In"
3. You'll be redirected to Auth0 login page
4. After successful login, you'll be redirected back to the app
5. You should see the documentation viewer with your email displayed

## Optional: Configure User Access

### Add Users
1. In Auth0 Dashboard, go to **User Management** → **Users**
2. Click **Create User** to add users manually
3. Or configure social connections (Google, Microsoft, etc.)

### Set Up Rules (Optional)
1. Go to **Auth Pipeline** → **Rules**
2. Create rules for:
   - Email domain restrictions
   - Role-based access control
   - Custom claims

### Example Rule: Email Domain Restriction
```javascript
function emailDomainWhitelist(user, context, callback) {
  const whitelist = ['accionlabs.com', 'brandwatch.com'];
  const userDomain = user.email.split('@')[1];

  if (whitelist.includes(userDomain)) {
    return callback(null, user, context);
  }

  return callback(new UnauthorizedError('Access denied.'));
}
```

## Troubleshooting

### Common Issues

1. **"Callback URL mismatch" error**
   - Ensure the callback URLs in Auth0 match exactly
   - Include the repository path for GitHub Pages

2. **Authentication not working on GitHub Pages**
   - Check that GitHub Secrets are set correctly
   - Verify the GitHub Actions workflow ran successfully
   - Check the browser console for errors

3. **"Domain not allowed" CORS error**
   - Add your domain to Allowed Web Origins in Auth0
   - Clear browser cache and cookies

### Support

For issues or questions:
- Check Auth0 documentation: https://auth0.com/docs
- GitHub repository issues: https://github.com/accionlabs/brandwatch-docs-viewer/issues

## Security Best Practices

1. **Never commit `.env.local` or any file with secrets**
2. **Use different Auth0 applications for dev and production**
3. **Regularly rotate Client IDs**
4. **Enable MFA for Auth0 Dashboard access**
5. **Review and audit user access regularly**
6. **Use Auth0 Rules for additional security checks**