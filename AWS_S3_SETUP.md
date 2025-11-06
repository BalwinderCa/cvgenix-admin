# AWS S3 Setup Guide

## Security Best Practices

### ⚠️ Important Security Notes

1. **DO NOT** use your AWS account root credentials
2. **DO NOT** commit access keys to version control (Git)
3. **DO NOT** share access keys with unauthorized parties
4. **DO** use IAM users with minimal required permissions
5. **DO** rotate access keys regularly
6. **DO** monitor access key usage with CloudTrail

## Step 1: Create an IAM User

1. Log in to AWS Console
2. Navigate to **IAM** → **Users**
3. Click **Create user**
4. Enter a username (e.g., `cvgenix-s3-uploader`)
5. Select **Provide user access to the AWS Management Console** → **No**
6. Click **Next**

## Step 2: Attach S3 Permissions Policy

You have two options:

### Option A: Create Custom Policy (Recommended - Minimal Permissions)

1. In **Set permissions**, select **Attach policies directly**
2. Click **Create policy** button (opens in new tab)
3. In the policy editor:
   - Click **JSON** tab
   - Delete the default content
   - Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

4. Click **Next**
5. Name the policy: `CVGenixS3UploadPolicy`
6. Description: `Allows upload, read, and delete operations on CVGenix templates bucket`
7. Click **Create policy**
8. Go back to the user creation tab
9. Click the refresh icon (🔄) next to the policy search
10. Search for `CVGenixS3UploadPolicy`
11. Check the box next to your policy
12. Click **Next** → **Create user**

### Option B: Use AWS Managed Policy (Easier but Less Secure)

1. In **Set permissions**, select **Attach policies directly**
2. In the search box, type: `AmazonS3FullAccess`
3. ⚠️ **Warning**: This gives full S3 access to all buckets (not recommended for production)
4. Check the box next to `AmazonS3FullAccess`
5. Click **Next** → **Create user**

**Recommendation**: Use Option A (Custom Policy) for better security with minimal permissions.

## Step 3: Create Access Keys

1. Click on the newly created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next**
7. Add a description (optional): "CVGenix Admin - S3 Upload"
8. Click **Create access key**

## Step 4: Save Your Credentials Securely

⚠️ **IMPORTANT**: The secret access key is shown only once!

1. **Download the CSV file** or copy both:
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJalrXUtnFEMI...`

2. **Store securely** (password manager, encrypted file, etc.)

3. **DO NOT** commit to Git or share publicly

## Step 5: Create S3 Bucket

1. Navigate to **S3** in AWS Console
2. Click **Create bucket**
3. Configure:
   - **Bucket name**: `cvgenix-templates` (must be globally unique)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck if you want public URLs (or use CloudFront)
   - **Bucket Versioning**: Optional
   - **Default encryption**: Enable (recommended)

4. Click **Create bucket**

## Step 6: Configure Bucket Permissions

### Option A: Public Read Access (Simple)

1. Go to bucket → **Permissions** tab
2. Edit **Bucket policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Replace `YOUR-BUCKET-NAME` with your bucket name
4. Save

### Option B: CloudFront CDN (Recommended for Production)

1. Create CloudFront distribution pointing to your S3 bucket
2. Use CloudFront URL instead of direct S3 URLs
3. Better performance and security

## Step 7: Configure CORS (if needed)

If uploading from browser:

1. Go to bucket → **Permissions** → **CORS**
2. Add configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:4000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 8: Add Credentials to .env File

Add to your `.env` or `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=cvgenix-templates
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net  # Optional
```

## Step 9: Test the Integration

Run the test script:

```bash
node scripts/test-s3.js
```

## Security Checklist

- [ ] Created IAM user (not using root account)
- [ ] Applied least-privilege policy (only S3 permissions needed)
- [ ] Saved access keys securely
- [ ] Added `.env` to `.gitignore`
- [ ] Verified `.env` is not in version control
- [ ] Set up CloudTrail monitoring (optional but recommended)
- [ ] Configured bucket permissions appropriately
- [ ] Enabled bucket encryption
- [ ] Set up CloudFront for production (recommended)

## Monitoring & Maintenance

### Set Up CloudTrail (Recommended)

1. Go to **CloudTrail** in AWS Console
2. Create a trail to log S3 API calls
3. Monitor for unauthorized access attempts

### Rotate Access Keys

1. Create new access key
2. Update `.env` file with new credentials
3. Test the application
4. Delete old access key after verification

### Regular Reviews

- Review IAM user permissions quarterly
- Check CloudTrail logs for suspicious activity
- Rotate access keys every 90 days (best practice)

## Troubleshooting

### "Access Denied" Error
- Check IAM user has correct permissions
- Verify bucket policy allows operations
- Ensure access keys are correct

### "Bucket Not Found" Error
- Verify bucket name is correct
- Check region matches bucket region
- Ensure bucket exists

### URL Not Accessible
- Check bucket public access settings
- Verify bucket policy allows GetObject
- Check CloudFront configuration if using CDN

## Alternative: Use IAM Roles (Recommended for Production)

For production deployments on AWS (EC2, Lambda, etc.), use IAM roles instead of access keys:

1. Create IAM role with S3 permissions
2. Attach role to your AWS resource
3. Remove access keys from code
4. AWS SDK automatically uses role credentials

This is more secure as credentials are managed by AWS and automatically rotated.

