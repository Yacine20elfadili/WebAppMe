# --- SCENE 1: THE DISPOSABLE WORKSTATION (Build Stage) ---
# This stage is like a temporary factory. It's only here to "cook" the code.

# 1-4) Pulls the Node image (~4 layers). This provides the tools needed (npm, Node) 
# to compile your frontend code[cite: 7].
FROM node:20-alpine AS build

# 5) Metadata: Sets the starting point for commands inside this stage[cite: 7].
WORKDIR /app

# 6) Data Layer: Copies dependency files to the factory[cite: 7].
COPY package*.json ./

# 7) Data Layer: Downloads all libraries (this can be 100s of MBs)[cite: 7].
RUN npm install

# 8) Data Layer: Copies your actual source code (React/Vue/etc.)[cite: 7].
COPY . .

# 9) Data Layer: Compiles the code into a small folder called /dist.
RUN npm run build


# --- SCENE 2: THE FINISHED PRODUCT (Production Stage) ---
# When this line runs, Docker "forgets" almost everything from Scene 1!

# 1) Starts a brand new foundation using Nginx (~6-8 layers).
# This image is very small because it doesn't have Node or npm.
FROM nginx:alpine

# 2) THE BRIDGE: This is the ONLY part of Scene 1 that survives.
# It reaches into the 'build' factory and grabs only the finished /dist folder.
COPY --from=build /app/dist /usr/share/nginx/html

# 3) Metadata: Notes that the container listens on port 80.
EXPOSE 80

# 4) Metadata: Tells the container to start the Nginx web server.
CMD ["nginx", "-g", "daemon off;"]