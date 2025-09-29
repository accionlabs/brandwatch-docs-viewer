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

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

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

This project is configured to deploy to GitHub Pages. The production build is output to the `docs` folder for easy GitHub Pages deployment.

### To deploy updates:

1. Make your changes
2. Build the project: `npm run build`
3. Commit all changes including the `docs` folder:
   ```bash
   git add .
   git commit -m "Update documentation viewer"
   git push origin main
   ```
4. GitHub Pages will automatically serve from the `docs` folder

### Initial GitHub Setup:

1. Create repository in Accion Labs organization
2. Push code to repository
3. Go to Settings → Pages
4. Set source to "Deploy from a branch"
5. Select "main" branch and "/docs" folder
6. Save and wait for deployment

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