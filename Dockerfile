# Use an official Node.js runtime as a parent image
FROM node:14-slim
# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "server.js" ]
