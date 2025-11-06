# AWS S3 Quick Start Guide

## Quick Setup Checklist

### 1. Create IAM User & Access Keys
- [ ] Go to AWS Console → IAM → Users → Create user
- [ ] Username: `cvgenix-s3-uploader`
- [ ] Attach policy with S3 permissions (see AWS_S3_SETUP.md)
- [ ] Create access key → Save credentials securely

### 2. Create S3 Bucket
- [ ] Go to S3 → Create bucket
- [ ] Bucket name: `cvgenix-templates` (must be unique)
- [ ] Region: `us-east-1` (or your preferred)
- [ ] Enable encryption (recommended)

### 3. Configure Bucket Permissions
- [ ] Bucket → Permissions → Bucket policy
- [ ] Add public read policy (or use CloudFront)
- [ ] Configure CORS if needed

### 4. Add to .env File
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtn...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=cvgenix-templates
AWS_CLOUDFRONT_URL=https://...cloudfront.net  # Optional
```

### 5. Test
```bash
node scripts/test-s3.js
```

## Minimum IAM Policy

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
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

## Security Reminders

✅ `.env` is already in `.gitignore` (secure)
✅ Never commit access keys to Git
✅ Use IAM user, not root account
✅ Rotate keys every 90 days
✅ Monitor with CloudTrail

## Support

For detailed instructions, see `AWS_S3_SETUP.md`


