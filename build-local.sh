#!/bin/bash

# Install dependencies
echo -e "\033[0;32mInstalling dependencies...\033[0m"
npm install

# Run tests
echo -e "\033[0;32mRunning tests...\033[0m"
npm test

# Build the project
echo -e "\033[0;32mBuilding the project...\033[0m"
npm run build

echo -e "\033[0;32mBuild complete! The production files are in the ./dist directory.\033[0m"
echo -e "\033[0;33mTo preview the build, run: npm run preview\033[0m" 