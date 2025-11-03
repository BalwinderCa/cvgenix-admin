#!/bin/bash

# Script to push CVGenix Admin to GitHub
# Make sure you've created a GitHub repository first!

echo "🚀 Preparing to push CVGenix Admin to GitHub..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Staging all files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit. Everything is up to date!"
else
    echo "💾 Committing changes..."
    git commit -m "Initial commit: CVGenix Admin Dashboard with Users, Templates, Plans, Settings, Email, and Calendar"
fi

# Set branch to main
git branch -M main

echo ""
echo "✅ Repository is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Create a repository on GitHub (if you haven't already)"
echo "2. Run these commands (replace YOUR_USERNAME and YOUR_REPO_NAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "   OR if you already added the remote:"
echo "   git push -u origin main"
echo ""


