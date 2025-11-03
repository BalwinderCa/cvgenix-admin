# Quick Setup Guide for GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cvgenix-admin`
3. Description: "CVGenix Admin Dashboard"
4. Choose Public or Private
5. **DO NOT** check any boxes (README, .gitignore, license)
6. Click "Create repository"

## Step 2: Copy the Repository URL

After creating, GitHub will show you a URL like:
- HTTPS: `https://github.com/YOUR_USERNAME/cvgenix-admin.git`
- SSH: `git@github.com:YOUR_USERNAME/cvgenix-admin.git`

## Step 3: Run These Commands

Open terminal in this folder and run:

```bash
# Navigate to project
cd "/Users/mac/Downloads/Projects/cvgenix admin"

# Add remote (replace with YOUR repository URL from Step 2)
git remote add origin https://github.com/YOUR_USERNAME/cvgenix-admin.git

# Push to GitHub
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys with GitHub

## Alternative: Using GitHub CLI (if installed)

If you have `gh` CLI installed:
```bash
gh repo create cvgenix-admin --public --source=. --remote=origin --push
```


