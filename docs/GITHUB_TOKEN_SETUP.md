# GitHub Token Setup for Workflows

## Issue

The current GitHub token doesn't have the `workflow` scope required to push GitHub Actions workflow files.

## Solution: Create New Token with Workflow Scope

### Step 1: Create New Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. **Token name**: `startege-deployment` (or any name you prefer)
3. **Expiration**: Choose expiration (90 days recommended)
4. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
     - ✅ `repo:status`
     - ✅ `repo_deployment`
     - ✅ `public_repo`
     - ✅ `repo:invite`
     - ✅ `security_events`
   - ✅ `workflow` (Update GitHub Action workflows) ⚠️ **REQUIRED**
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Update Local Git Configuration

```bash
cd /Users/fasahatferoze/Desktop/Startege

# Update credential helper with new token
echo "https://fasahat78:NEW_TOKEN_HERE@github.com" > ~/.git-credentials

# Or use the token directly in push command
git push https://NEW_TOKEN_HERE@github.com/fasahat78/startege.git main
```

### Step 3: Push to GitHub

```bash
cd /Users/fasahatferoze/Desktop/Startege
git push -u origin main
```

## Alternative: Allow Workflow Files via GitHub UI

If you want to keep the current token:

1. Go to: https://github.com/fasahat78/startege/settings/actions
2. Under "Workflow permissions", ensure workflows can be updated
3. Or temporarily remove `.github/workflows/` from the commit, push, then add them back via GitHub UI

## Required Scopes Summary

- ✅ `repo` - Full repository access
- ✅ `workflow` - Update GitHub Actions workflows

## Security Note

⚠️ **Never commit tokens to the repository**
- Store tokens in GitHub Secrets
- Use environment variables locally
- Rotate tokens regularly

