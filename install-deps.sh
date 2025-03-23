#!/bin/bash

# Install required dependencies for UI components and functionality
echo -e "\033[0;32mInstalling required dependencies...\033[0m"

# Radix UI components
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle
npm install @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Additional UI libraries
npm install class-variance-authority cmdk input-otp embla-carousel-react
npm install react-day-picker react-hook-form react-resizable-panels vaul

echo -e "\033[0;32mDependencies installed successfully!\033[0m" 