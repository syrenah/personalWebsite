#!/bin/bash

echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Uploading to S3..."
aws s3 sync dist/ s3://syrenah-stein.dev --delete

if [ $? -ne 0 ]; then
    echo "S3 deployment failed!"
    exit 1
fi

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"

echo "Deployment complete!"