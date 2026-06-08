FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set CI=false to avoid warnings failing the build
ENV CI=false
RUN npm run build

# Install serve to run the build output
RUN npm install -g serve

EXPOSE 3000

# Start the application using serve
CMD ["serve", "-s", "build", "-l", "3000"]
