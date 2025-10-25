# Deployment Guide

## GitHub Pages Deployment

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Badminton Tournament Maker"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `tournament-maker`
3. Description: "Badminton Tournament Management Application"
4. Public repository
5. **Do not** initialize with README (we already have one)

### 3. Link Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/tournament-maker.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4. Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:
- Build the production version of your app
- Create/update the `gh-pages` branch
- Push the build to GitHub Pages

### 5. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select branch: `gh-pages` and folder: `/ (root)`
5. Click "Save"

### 6. Access Your App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/tournament-maker
```

## Update the Homepage URL

Before deploying, update the `homepage` field in `package.json`:

```json
"homepage": "https://YOUR_USERNAME.github.io/tournament-maker"
```

Replace `YOUR_USERNAME` with your GitHub username.

## Updating the App

To deploy updates:

```bash
git add .
git commit -m "Description of changes"
git push
npm run deploy
```

## Local Development

```bash
npm start        # Start development server
npm run build    # Create production build
npm test         # Run tests
```

## Troubleshooting

### 404 Error
- Check that the `homepage` in `package.json` matches your GitHub Pages URL
- Ensure the `gh-pages` branch exists and is set as the source in GitHub Settings

### Build Fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript or linting errors
- Review the build output for specific error messages

### Changes Not Showing
- Clear browser cache
- Wait a few minutes for GitHub Pages to update
- Check the Actions tab on GitHub to see if the deployment completed
