# Instructions to Push to GitHub

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `cvgenix-admin` (or any name you prefer)
5. Description: "CVGenix Admin Dashboard"
6. Choose Public or Private
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these commands:

```bash
cd "/Users/mac/Downloads/Projects/cvgenix admin"

# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## Alternative: Using SSH

If you have SSH keys set up with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Notes

- Make sure you have committed all your changes (already done)
- The `.env` file is in `.gitignore` and won't be pushed (for security)
- The `dashcode-nextjs-full-source-code` folder is also ignored


