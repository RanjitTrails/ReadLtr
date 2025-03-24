# ReadLtr iOS App

ReadLtr for iOS is a sophisticated reading-list application inspired by Omnivore and Readwise. It allows users to save articles from the web for later reading in a clean, distraction-free environment.

## Features

- **Clean Reading Experience**: Focus on the content with customizable fonts, spacing, and themes
- **Smart Library Management**: Organize articles with favorites, archives, and tags
- **Highlighting and Annotations**: Mark important passages and add notes
- **Offline Reading**: Access your saved articles even without an internet connection
- **Cross-Device Sync**: Seamlessly continue reading across devices
- **Share Extension**: Save articles directly from Safari or other apps
- **Text-to-Speech**: Listen to your articles when your eyes need a break

## Development

### Prerequisites

- Xcode 14.0+
- iOS 16.0+ target
- Swift 5.7+

### Project Structure

The app follows MVVM architecture with the following main components:

- **Models**: Data models and stores
  - `AuthManager.swift`: Handles authentication with Supabase
  - `ArticleModel.swift`: Models for articles and related entities
  - `ArticleStore.swift`: Manages article data and operations

- **Views**: UI components
  - **Auth**: Login, registration, and password reset
  - **Library**: Article lists, favorites, and archives
  - **Article**: Article reading and management views
  - **Settings**: User preferences and account management

### Building the Project

1. Clone the repository
2. Open the `ReadLtr.xcodeproj` file in Xcode
3. Select your development team for signing
4. Build and run on a simulator or device

## Backend Integration

The app uses [Supabase](https://supabase.io) for its backend. For development purposes, the app currently uses mock data, but it's designed to be easily connected to the real backend by updating the authentication and data services.

To connect to the Supabase backend:

1. Configure your Supabase project URL and API keys in the environment
2. Update the `AuthManager` to use the Supabase authentication SDK
3. Update the `ArticleStore` to sync with the Supabase database

## Share Extension

To test the Share Extension:

1. Build and run the app
2. Switch to Safari or another app
3. Find an article you want to save
4. Tap the share button
5. Select "Save to ReadLtr" from the share options

## Design Inspirations

This app takes inspiration from:

- **Omnivore**: For its clean reading experience and highlighting features
- **Readwise**: For spaced repetition review of highlights and notes

## Next Steps

Planned enhancements include:

- [ ] CoreData integration for robust offline support
- [ ] Sync engine with support for conflict resolution
- [ ] Apple Watch companion app for quick actions
- [ ] Widgets for iOS home screen
- [ ] Advanced article parsing for better content extraction
- [ ] OCR capabilities for capturing text from images