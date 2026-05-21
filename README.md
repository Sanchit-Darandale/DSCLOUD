# DSCLOUD - Free Text & Media Hosting Platform

![DSCLOUD](https://dscloud.vercel.app/logo.png)

DSCLOUD is a modern, free, and open-source text and media hosting platform designed for simplicity, security, and speed. Share files, host text snippets, and manage your uploads with ease.

## 🚀 Features

### Media Hosting
- **Fast Uploads**: Upload images and videos instantly
- **Shareable Links**: Get public links immediately after upload
- **Direct Links**: Direct file access with custom extensions
- **Delete Keys**: Secure your uploads with unique delete keys
- **Bandwidth Tracking**: Monitor your bandwidth usage
- **View Stats**: Track total views and upload statistics

### Text Hosting
- **Password Protection**: Optional password-protected pastes
- **Custom Aliases**: Create memorable aliases for your text
- **Formatting Options**: Support for preformatted text, BBCode, and clickable links
- **Admin Editing**: Update your pastes with admin passwords
- **Expiration Dates**: Set automatic expiration for your content
- **Raw Text Access**: Download or view raw text

### API Access
- **REST API**: Simple and powerful REST endpoints
- **Upload via API**: Programmatic file uploads
- **URL Upload**: Upload files from remote URLs
- **File Management**: Query and manage your files
- **Text Management**: Create and update text via API

## 🌐 Website

Visit us at: [https://dscloud.vercel.app](https://dscloud.vercel.app)

### Pages
- **Upload**: [/](https://dscloud.vercel.app/) - Media hosting dashboard
- **Text Host**: [/text-host.html](https://dscloud.vercel.app/text-host.html) - Text hosting and management
- **Delete**: [/delete.html](https://dscloud.vercel.app/delete.html) - Remove your hosted content
- **API Docs**: [/api-docs.html](https://dscloud.vercel.app/api-docs.html) - Complete API documentation
- **Privacy**: [/privacy.html](https://dscloud.vercel.app/privacy.html) - Privacy policy
- **Terms**: [/terms.html](https://dscloud.vercel.app/terms.html) - Terms of service

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel
- **Authentication**: Google OAuth 2.0, Email verification
- **Email**: Nodemailer (Gmail SMTP)

## 📋 System Requirements

- Node.js 16+
- npm or yarn
- MongoDB instance
- Environment variables configured (.env file)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sanchit0102/TG_HOSTING.git
cd TG_HOSTING
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Bot Configuration
BOT_TOKENS=your_telegram_bot_tokens

# Server Configuration
PORT=3000
BASE_URL=https://dscloud.vercel.app

# Database
MONGO_URI=mongodb://localhost:27017/test

# File Upload
MAX_FILE_SIZE=26214400

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Authentication
AUTH_SECRET=your_auth_secret_key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### Upload Media
```bash
POST /api/upload
Content-Type: multipart/form-data

file: <binary_file>
```

### Upload from URL
```bash
POST /api/upload-url
Content-Type: application/json

{
  "url": "https://example.com/image.jpg"
}
```

### Get File Info
```bash
GET /api/info/:id
```

### Delete File
```bash
POST /api/delete
Content-Type: application/json

{
  "id": "file_id",
  "deleteKey": "delete_key"
}
```

### Text Operations
```bash
POST /api/text/create - Create a new text paste
GET /api/text/:id - Retrieve a text paste
POST /api/text/update - Update existing text
POST /api/text/delete - Delete a text paste
```

## 🎨 Customization

### Styling
The application uses a dark neon theme. Modify `public/styles.css` to customize the appearance.

### Features
- Edit `public/app.js` for frontend functionality
- Edit `server.js` for backend logic
- Update HTML files in the `public/` directory for page structure

## 🔒 Security Features

- **Rate Limiting**: Prevent abuse with request rate limiting
- **Authentication**: Secure user authentication with Google OAuth and email verification
- **Delete Keys**: Unique delete keys for file management
- **Password Protection**: Optional password protection for text
- **HTTPS**: Secure communication over HTTPS
- **CORS**: Configured CORS policy

## 📊 Performance & SEO

- **Mobile Responsive**: Optimized for all device sizes
- **Fast Loading**: Minimal dependencies and optimized assets
- **SEO Optimized**: Proper meta tags, structured data (JSON-LD)
- **Sitemap**: Auto-generated sitemap for search engines
- **Robots.txt**: Configured for search engine crawling

## 🐛 Known Issues & Limitations

- File size limit: 20MB (configurable via MAX_FILE_SIZE)
- Text paste limit: 50,000 characters
- Temporary files are cleaned up periodically
- Database retention policy applies

## 📝 Content Policy

### Acceptable Use
- Personal files and documents
- Code snippets and pastes
- Media files for sharing
- Backup and archival purposes

### Prohibited Content
- Illegal content
- Malware and viruses
- Copyright-infringing material
- Adult or explicit content
- Spam and phishing attempts

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is for personal and educational use.

## 👨‍💻 Developer

**Sanchit Darandale**
- GitHub: [@sanchit0102](https://github.com/sanchit0102/)
- Email: contact@dscloud.app

## 🔗 Links

- **Website**: [https://dscloud.vercel.app](https://dscloud.vercel.app)
- **GitHub**: [https://github.com/sanchit0102/TG_HOSTING](https://github.com/sanchit0102/TG_HOSTING)
- **Report Issues**: [GitHub Issues](https://github.com/sanchit0102/TG_HOSTING/issues)

## 📞 Support

For support and inquiries:
- Visit our [Privacy Policy](https://dscloud.vercel.app/privacy.html)
- Read our [Terms of Service](https://dscloud.vercel.app/terms.html)
- Check our [API Documentation](https://dscloud.vercel.app/api-docs.html)

---

**© 2026 DSCLOUD. All rights reserved.**

Made with ❤️ for the community.
