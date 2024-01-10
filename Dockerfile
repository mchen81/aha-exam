FROM node:18
# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Build your Next.js app
RUN npm run build

# Expose the port that your Next.js app will run on (default is 3000)
EXPOSE 3000

# Specify the command to start your Next.js app
CMD ["npm", "start"]
