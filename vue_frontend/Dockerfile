# Use an official Node.js runtime as the base image
FROM node:16.14.2

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Set the environment variables
ENV PORT=5000
ENV SERVER_URL=http://127.0.0.1:5001

# Expose the port on which your application listens (if needed)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]