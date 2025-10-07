# Brandwatch Documentation Viewer

An interactive web application for exploring Brandwatch product documentation and user workflows with integrated PDF viewing capabilities.

## 🌐 Live Demo

Visit the live application: [https://accionlabs.github.io/brandwatch-docs-viewer](https://accionlabs.github.io/brandwatch-docs-viewer)

## 📋 Features

- **Interactive Flow Diagrams**: Visual representation of user workflows for each Brandwatch module
- **Integrated PDF Viewer**: View relevant documentation PDFs directly within the application
- **Module Organization**: Navigate through different Brandwatch products:
  - Advertise
  - Audience
  - Benchmark
  - Consumer Research
  - Engage
  - Influence
  - Listen
  - Measure
  - Publish
  - Reviews
  - VIZIA
- **Search Functionality**: Quickly find specific workflows across all modules
- **Admin Editing**: Authorized users can edit source document references
- **Authentication**: Auth0 integration for secure user management
- **API Backend**: RESTful API for data management and updates
- **Responsive Design**: Works on desktop and tablet devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/accionlabs/brandwatch-docs-viewer.git
cd brandwatch-docs-viewer
```

2. Install dependencies for both frontend and API:
```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..
```

3. Configure Auth0 (Optional - for authentication):
   - Create an Auth0 application
   - Update `.env` with your Auth0 credentials:
   ```
   REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-client-id
   REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000
   ```

4. Configure Admin Users:
   - Edit `public/config/admins.json` to add authorized email addresses:
   ```json
   {
     "adminEmails": [
       "admin@example.com"
     ]
   }
   ```

5. Start both servers:
```bash
# Terminal 1 - Start API server (port 3001)
cd api
npm start

# Terminal 2 - Start React app (port 3000)
npm start
```

The application will be available at:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

## 🏗️ Building for Production

To build the application for production deployment:

```bash
npm run build
```

This creates a `docs` folder with optimized production files ready for GitHub Pages deployment.

## 📂 Project Structure

```
brandwatch-docs-viewer/
├── public/
│   ├── pdfs/           # PDF documentation files organized by module
│   └── data/           # JSON files with user flow data and citations
├── src/
│   ├── components/     # React components
│   │   ├── ModuleSelector.js
│   │   ├── FlowList.js
│   │   ├── FlowDiagram.js
│   │   └── SimplePDFViewer.js
│   ├── utils/          # Utility functions
│   └── App.js          # Main application component
├── docs/               # Production build (for GitHub Pages)
└── package.json        # Project dependencies and scripts
```

## 🌍 Deployment

### Deployment Options

#### Option 1: Full-Stack Deployment (Recommended for Internal Use)

For full functionality including admin editing features:

**Frontend Deployment (Vercel/Netlify/AWS):**

1. Build the React application:
   ```bash
   npm run build
   ```

2. Deploy to your chosen platform:
   - **Vercel**: Connect GitHub repo and auto-deploy
   - **Netlify**: Drag and drop `build` folder or connect GitHub
   - **AWS S3**: Upload build folder to S3 bucket with static hosting

3. Configure environment variables on your platform:
   ```
   REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-client-id
   REACT_APP_API_URL=https://your-api-url.com
   ```

**API Deployment (Node.js hosting required):**

1. Deploy API to a Node.js hosting service:
   - **Heroku**:
     ```bash
     cd api
     heroku create your-api-name
     git push heroku main
     ```
   - **AWS EC2/Lambda**: Deploy as Node.js application
   - **DigitalOcean App Platform**: Connect GitHub and deploy

2. Update frontend to point to production API URL

#### Option 2: Static GitHub Pages Deployment (Read-Only)

For static documentation viewing without edit capabilities:

1. Build for GitHub Pages:
   ```bash
   npm run build
   ```

2. Commit the `docs` folder:
   ```bash
   git add docs/
   git commit -m "Update documentation viewer"
   git push origin main
   ```

3. Configure GitHub Pages:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: main, Folder: /docs
   - Save and wait for deployment

**Note**: GitHub Pages deployment does not support:
- Admin editing features (requires API server)
- Dynamic data updates
- Authentication-based features

### Production Configuration

#### API Server Configuration

1. Set production environment variables:
   ```bash
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. Use PM2 for process management:
   ```bash
   npm install -g pm2
   cd api
   pm2 start server.js --name "brandwatch-api"
   pm2 save
   pm2 startup
   ```

#### Security Considerations

1. **HTTPS**: Ensure both frontend and API use HTTPS in production
2. **CORS**: Configure appropriate CORS policies in `api/server.js`
3. **Authentication**: Properly configure Auth0 for production domain
4. **API Keys**: Store sensitive keys in environment variables
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

### Docker Deployment (Optional)

Create `docker-compose.yml` for containerized deployment:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://api:3001

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

## 👨‍💼 Admin Features

### Editing Source Documents

Admin users can edit source document references directly in the UI:

1. **Configure Admin Access**: Add email addresses to `public/config/admins.json`:
   ```json
   {
     "adminEmails": [
       "user@example.com"
     ]
   }
   ```

2. **Login**: Use Auth0 authentication with an admin email address

3. **Edit Mode**:
   - Navigate to any user flow
   - Click "Edit Sources" button (only visible to admins)
   - Modify, add, or remove source document references
   - Click "Save Changes" to persist updates

4. **Validation Workflow**:
   - Team members can review each flow
   - Edit incorrect PDF references
   - Add missing documentation sources
   - Changes are saved to JSON files and backed up automatically

### API Endpoints

The API server provides the following endpoints:

- `GET /api/health` - Health check
- `GET /api/modules` - List all modules
- `GET /api/flows/:module` - Get flows for a module
- `GET /api/search?q=query` - Search across all flows
- `POST /api/update-flow` - Update flow source documents (admin only)

## 📝 Data Structure

The application uses JSON files to define user workflows. Each module has a corresponding JSON file in `public/data/` with:
- Module metadata
- User flows with steps and decision points
- PDF citations linking to documentation

Example structure:
```json
{
  "module": "Module Name",
  "user_flows": [
    {
      "flow_name": "Flow Title",
      "steps": [...],
      "source_documents": ["path/to/pdf.pdf"]
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary to Accion Labs.

## 👥 About Accion Labs

[Accion Labs](https://www.accionlabs.com) is a premium IT services firm with deep expertise in Product Engineering and Digital Transformation services.

## 📧 Contact

For questions or support, please contact the Accion Labs development team.

---

**Note**: This viewer requires the Brandwatch documentation PDFs to be present in the `public/pdfs` directory structure matching the citations in the flow JSON files.