# Mythic Table API Service 

This is the Mythic Table API Service. It's primary responsibility is 
to host the APIs for Mythic Table and provide a mechanism to store 
data and to transmit data changes to other connected clients.

## Development

- `dotnet run` or `dotnet watch run` will start the service locally
- `dotnet run --launch-profile integration` will launch the service to connect to a locally running mongodb

## File Storage

Mythic Table uses player provided files. This can be configured with the following strategies.

### Using a local file store (Only recommended for local development)

This is the default and requires not additional configuration.
Be sure not to set the `MTT_USE_GCP_IMAGE_STORE` environment variable.

### Using GCP Cloud Storage

To do this you will first need to create a public Google Cloud Storage Bucket and create a service account with admin access

- Create a GCP Project
- Create a Cloud Storage Bucket
- Under the Permissions tab add a member and grant them `Storage Object Viewer`
- Go to IAM and create a new Service Account
- Give it `Storage Object Admin` permissions
- Download the service account key as a json file

With this done, you need to set the following environment variables

- `MTT_USE_GCP_IMAGE_STORE=true`
- `MTT_GCP_CREDENTIAL_FILE=path-to-key.json`
- `MTT_GCP_BUCKET_IMAGES=name-of-bucket`
