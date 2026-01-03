# Fix: GitHub Secret Not Accepting GCP Service Account Key

## Problem

When pasting the GCP service account key JSON into GitHub Secrets, you might see an error or it might not accept the value.

## Common Issues

### Issue 1: JSON Wrapped in Array Brackets

**Wrong Format:**
```json
[{
  "type": "service_account",
  "project_id": "startege",
  ...
}]
```

**Correct Format:**
```json
{
  "type": "service_account",
  "project_id": "startege",
  ...
}
```

**Solution**: Remove the outer `[` and `]` brackets. GitHub Secrets expects a JSON object, not an array.

### Issue 2: Extra Whitespace or Formatting

**Solution**: 
- Copy the entire JSON content from the downloaded file
- Paste it directly into GitHub Secrets
- Don't add any extra formatting or brackets

### Issue 3: Incomplete JSON

**Solution**: 
- Make sure you copy the ENTIRE JSON file content
- From `{` at the beginning to `}` at the end
- Include all fields (private_key, client_email, etc.)

## Step-by-Step Fix

1. **Open your downloaded service account key file** (`startege-gcp-sa-key.json`)

2. **Select ALL content** (Cmd+A or Ctrl+A)

3. **Copy** (Cmd+C or Ctrl+C)

4. **Go to GitHub Secrets**: https://github.com/fasahat78/startege/settings/secrets/actions

5. **Click "New repository secret"**

6. **Name**: `GCP_SA_KEY`

7. **Value**: Paste the JSON (should start with `{` and end with `}`)

8. **Click "Add secret"**

## Correct Format Example

The secret value should look like this (without the array brackets):

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

**NOT** like this:
```json
[{
  ...
}]
```

## Verification

After adding the secret:

1. The secret should appear in your secrets list
2. You should see "GCP_SA_KEY" in the list
3. The value should be hidden (shows as `••••••••`)
4. You can verify it's correct by checking if GitHub Actions can use it

## Troubleshooting

### Still Not Working?

1. **Check JSON validity**: Use a JSON validator (like jsonlint.com) to ensure the JSON is valid
2. **Remove all whitespace**: Try copying without any extra spaces
3. **Check file encoding**: Make sure the file is UTF-8 encoded
4. **Try manual entry**: Copy each field one by one if needed (not recommended, but works)

### Alternative: Use GitHub CLI

If the web interface continues to have issues, use GitHub CLI:

```bash
# Install GitHub CLI if not installed
# brew install gh (macOS)

# Authenticate
gh auth login

# Set secret from file
gh secret set GCP_SA_KEY < startege-gcp-sa-key.json
```

This automatically handles the JSON format correctly.

