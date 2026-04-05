gcloud run deploy career-agent-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars="GOOGLE_CLOUD_PROJECT=career-agent-pro,GOOGLE_CLOUD_LOCATION=us-central1" \
  --set-build-env-vars="GOOGLE_NODE_RUN_SCRIPTS=" \
  --memory="1Gi"
  