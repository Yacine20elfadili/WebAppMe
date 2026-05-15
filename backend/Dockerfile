# --- BASE IMAGE SECTION ---
# These layers are pre-built by the Node.js team.
# 1) The minimal Alpine Linux operating system core[cite: 9, 12].
# 2) The installation of the Node.js runtime and its core dependencies[cite: 9].
# 3) The installation of npm and other essential build tools[cite: 10].
# 4) Configuration layers for the environment (like setting PATH)[cite: 11].
FROM node:20-alpine

# --- APPLICATION SETUP SECTION ---

# 5) METADATA: Sets the working directory.
# (It makes the folder, but doesn't add a "data layer" hash in your RootFS) .
WORKDIR /app

# 6) DATA LAYER: Copies your dependency manifests.
COPY package*.json ./

# 7) DATA LAYER: Large layer containing all node_modules.
RUN npm install

# 8) DATA LAYER: Copies the TypeScript configuration.
COPY tsconfig.json ./

# 9) DATA LAYER: Copies your backend source code.
COPY src/ ./src/

# 10) DATA LAYER: Runs the compiler, creating the /dist folder.
RUN npm run build

# --- RUNTIME METADATA ---
# These add 0 bytes to the image size.

# Metadata: Documentation for the networking port.
EXPOSE 3001

# Metadata: The command that executes when the container starts.
CMD ["node", "dist/server.js"]