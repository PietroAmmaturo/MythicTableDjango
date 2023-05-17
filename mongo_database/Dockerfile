FROM mongo

# Set the environment variables
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=abc123!
ENV MONGO_INITDB_DATABASE=MythicTableDjango

# Expose the required ports
EXPOSE 27017-27019

# Set the working directory
WORKDIR /data

# Create a volume for persistent data storage
VOLUME ["/data/db"]

# Start the MongoDB server
CMD ["mongod"]