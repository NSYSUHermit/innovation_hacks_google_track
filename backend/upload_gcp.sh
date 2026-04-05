gcloud run deploy career-agent-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=career-agent-pro,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_API_KEY=AIzaSyCHXHwBqaVs2A7ed21EDDYQTQAdxSnhwLk"
  