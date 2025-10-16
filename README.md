# Zaitsev Holding Group Website

A professional website for Zaitsev Holding Group, LLC - a Wyoming-based private equity and holding company.

## 🌐 Domain
**zaitsev.co**

## 📁 Project Structure

```
zaitsev-website/
├── index.html          # Landing page
├── about.html          # About page
├── portfolio.html      # Portfolio companies page
├── contact.html        # Contact page
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── images/
│   └── logo.png        # Company logo
└── README.md           # This file
```

## 🚀 Deployment to Cloudflare Pages

### Method 1: Using Cloudflare Dashboard (Recommended)

1. **Prepare Your Files**
   - Ensure all files are in the `zaitsev-website` folder
   - Verify all links and paths are relative (not absolute)

2. **Connect to GitHub**
   - Push your code to a GitHub repository
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** in the sidebar
   - Click **Create a project**
   - Select **Connect to Git**
   - Authorize Cloudflare to access your GitHub account
   - Select your repository

3. **Configure Build Settings**
   - **Project name**: zaitsev-co (or your preferred name)
   - **Production branch**: main (or master)
   - **Build command**: Leave empty (static site)
   - **Build output directory**: `/` or leave empty
   - Click **Save and Deploy**

4. **Custom Domain Setup**
   - After deployment, go to your project settings
   - Click on **Custom domains**
   - Click **Set up a custom domain**
   - Enter: `zaitsev.co`
   - Follow the DNS configuration instructions
   - Add the CNAME record to your domain's DNS settings

### Method 2: Using Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   cd zaitsev-website
   wrangler pages publish . --project-name=zaitsev-co
   ```

### Method 3: Direct Upload via Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Create a project**
4. Select **Upload assets**
5. Drag and drop the entire `zaitsev-website` folder
6. Click **Deploy site**

## 🔧 Configuration

### DNS Settings for zaitsev.co

After deploying to Cloudflare Pages, configure your DNS:

1. Go to your domain registrar or Cloudflare DNS settings
2. Add a CNAME record:
   - **Type**: CNAME
   - **Name**: @ (or zaitsev.co)
   - **Target**: your-project.pages.dev (provided by Cloudflare)
   - **Proxy status**: Proxied (orange cloud)

3. Add a CNAME for www subdomain:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: zaitsev.co
   - **Proxy status**: Proxied

### SSL/TLS Settings

1. In Cloudflare Dashboard, go to **SSL/TLS**
2. Set encryption mode to **Full** or **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

## 📝 Customization

### Updating Content

- **Logo**: Replace `images/logo.png` with your logo
- **Colors**: Modify CSS variables in `css/styles.css` (lines 4-12)
- **Company Info**: Update text in HTML files
- **Contact Form**: Configure form submission in `js/main.js` (line 60-80)

### Adding New Pages

1. Create a new HTML file in the root directory
2. Copy the structure from an existing page
3. Update navigation links in all pages
4. Add the page to the footer links

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach, works on all devices
- **Modern Aesthetics**: Clean, professional design based on your logo
- **Fast Loading**: Optimized CSS and minimal JavaScript
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessible**: WCAG compliant with proper ARIA labels

## 🔗 External Dependencies

- **Google Fonts**: Inter and Montserrat
- **Font Awesome**: Icons (v6.4.0)

These are loaded from CDNs and don't require local installation.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Local Development

To test locally:

1. **Using Python**:
   ```bash
   cd zaitsev-website
   python -m http.server 8000
   ```
   Visit: http://localhost:8000

2. **Using Node.js**:
   ```bash
   cd zaitsev-website
   npx http-server
   ```

3. **Using VS Code**:
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

## 📧 Contact Form Setup

The contact form currently shows an alert message. To make it functional:

1. **Option 1: Use Cloudflare Workers**
   - Create a Worker to handle form submissions
   - Send emails via SendGrid, Mailgun, or similar service

2. **Option 2: Use a Form Service**
   - Formspree: https://formspree.io/
   - Netlify Forms (if using Netlify)
   - Basin: https://usebasin.com/

3. **Option 3: Custom Backend**
   - Set up your own API endpoint
   - Update the fetch URL in `js/main.js`

## 🔒 Security

- All external resources loaded via HTTPS
- No sensitive data stored in frontend code
- Form validation implemented
- CORS headers should be configured on backend

## 📊 Analytics (Optional)

To add Google Analytics:

1. Get your GA4 tracking ID
2. Add this code before `</head>` in all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚀 Performance Optimization

Current optimizations:
- Minified CSS (can be further compressed)
- Optimized images
- Lazy loading for images
- Efficient JavaScript
- CDN delivery via Cloudflare

## 📄 License

© 2025 Zaitsev Holding Group, LLC. All rights reserved.

## 🤝 Support

For technical support or questions about the website, please contact through the website's contact form.

---

**Built with care for Zaitsev Holding Group, LLC**