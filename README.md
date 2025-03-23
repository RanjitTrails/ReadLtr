# ReadLtr - Your Personal Read-it-Later App

ReadLtr is a modern, clean read-it-later application that helps you save articles, blog posts, and other web content to read when you have time. With a focus on providing a distraction-free reading experience, ReadLtr makes it easy to organize your reading list and access your saved content from any device.

![ReadLtr Screenshot](https://example.com/screenshot.png)

## Features

- **Clean Reading Interface**: Distraction-free reading experience with a clean, dark-themed UI
- **Save from Anywhere**: Browser extensions and bookmarklet for one-click saving
- **Article Organization**: Tag articles, favorite them, or organize into custom lists
- **Multi-platform Access**: Web, mobile apps for iOS and Android
- **Offline Reading**: Save articles for offline access on mobile devices
- **Article Management**: Archive, favorite, tag, and search your saved content
- **User Authentication**: Secure login and registration system

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Storage, Database)
- **Routing**: Wouter for lightweight routing
- **State Management**: React Query for server state, React Context for client state
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Custom component library
- **Icons**: Lucide React for consistent iconography
- **Hosting**: Netlify for frontend deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Netlify account

### Local Development

1. Clone this repository
   ```
   git clone https://github.com/yourusername/readltr.git
   cd readltr
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a Supabase project
   - Sign up or log in to [Supabase](https://supabase.com)
   - Create a new project
   - Navigate to SQL Editor and run the SQL from `supabase/migrations/01_schema.sql`
   - Go to Project Settings > API to get your API URLs and keys

4. Set up environment variables
   - Copy `.env.example` to `.env.development`
   - Update with your Supabase URL and anon key:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Deploying to Netlify

1. Push your code to GitHub

2. Connect your GitHub repository to Netlify:
   - Sign up or log in to [Netlify](https://netlify.com)
   - Click "New site from Git" and select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Configure environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Trigger deploy

### Continuous Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically deploys to Netlify when you push to the main branch.

To set it up:

1. Go to your GitHub repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase project anon key

The workflow will automatically run tests and deploy on every push to the main branch.

## Testing

### Unit and Integration Tests

Run unit and integration tests with Vitest:

```
npm test
```

Run tests in watch mode during development:

```
npm run test:watch
```

### End-to-End Tests

Run Cypress E2E tests:

```
npm run test:e2e
```

Run in headless mode:

```
npm run test:e2e:headless
```

## Project Structure

```
readltr/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # Utilities and services
│   │   ├── pages/        # Page components
│   │   └── main.tsx      # Entry point
├── supabase/             # Supabase configuration and migrations
│   └── migrations/       # SQL migrations
├── cypress/              # Cypress E2E tests
├── .github/              # GitHub Actions workflows
└── shared/               # Shared types and utilities
```

## Browser Extensions

ReadLtr offers browser extensions and a bookmarklet for easy article saving:

- **Chrome Extension**: Available in the Chrome Web Store
- **Bookmarklet**: Drag to your bookmarks bar for one-click saving
- **Firefox Extension**: Coming soon
- **Safari Extension**: Coming soon

## Mobile Apps

ReadLtr is available on mobile platforms:

- **iOS App**: Available on the App Store
- **Android App**: Available on Google Play

## Development Roadmap

- [x] Core UI implementation
- [x] Article saving and reading interface
- [x] Browser extensions and bookmarklet
- [x] Supabase integration
- [x] Netlify deployment setup
- [ ] Mobile apps development
- [ ] Social sharing features
- [ ] Reading progress sync
- [ ] Advanced text-to-speech integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wouter](https://github.com/molefrog/wouter)
- [Lucide Icons](https://lucide.dev/)
- [TanStack Query](https://tanstack.com/query/)
- [Supabase](https://supabase.com/)
- [Netlify](https://netlify.com/) 