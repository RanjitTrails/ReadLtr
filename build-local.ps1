# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Run tests
Write-Host "Running tests..." -ForegroundColor Green
npm test

# Build the project
Write-Host "Building the project..." -ForegroundColor Green
npm run build

Write-Host "Build complete! The production files are in the ./dist directory." -ForegroundColor Green
Write-Host "To preview the build, run: npm run preview" -ForegroundColor Yellow 