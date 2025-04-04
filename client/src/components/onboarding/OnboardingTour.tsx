import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/toast';

// Create a new tour instance
const tour = new Shepherd.Tour({
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shadow-md bg-zinc-900 border border-zinc-800',
    scrollTo: true,
    modalOverlayOpeningRadius: 4
  },
  useModalOverlay: true
});

// Define the tour steps
export function configureTour() {
  // Clear any existing steps
  tour.steps.forEach(() => tour.removeStep(0));

  // Add steps to the tour
  tour.addStep({
    id: 'welcome',
    title: 'Welcome to ReadLtr',
    text: 'This quick tour will show you how to use ReadLtr effectively.',
    buttons: [
      {
        text: 'Skip Tour',
        action: tour.cancel
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'sidebar',
    title: 'Navigation',
    text: 'Use the sidebar to navigate between your reading list, favorites, archives, and tags.',
    attachTo: {
      element: '.sidebar',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'save-article',
    title: 'Save Articles',
    text: 'Click here to save a new article. Just paste the URL and we\'ll do the rest!',
    attachTo: {
      element: '.save-button',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'article-list',
    title: 'Your Reading List',
    text: 'Here you\'ll find all your saved articles. Click on any article to read it.',
    attachTo: {
      element: '.article-list',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'article-actions',
    title: 'Article Actions',
    text: 'Use these buttons to favorite, archive, or tag your articles.',
    attachTo: {
      element: '.article-actions',
      on: 'left'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'search',
    title: 'Search',
    text: 'Quickly find articles by searching for titles, content, or tags.',
    attachTo: {
      element: '.search-bar',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'settings',
    title: 'Settings',
    text: 'Customize your experience and manage your account from the settings page.',
    attachTo: {
      element: '.settings-button',
      on: 'left'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Finish',
        action: tour.complete
      }
    ]
  });
}

/**
 * Mark onboarding as complete in the user profile
 */
async function markOnboardingComplete(userId: string) {
  if (!userId) return;

  try {
    await supabase
      .from('profiles')
      .update({
        has_completed_tour: true,
        onboarding_step: 100 // Use 100 to indicate fully completed
      })
      .eq('id', userId);

    // Show completion notification
    toast({
      title: 'Onboarding Complete',
      description: 'You\'ve completed the tour! Enjoy using ReadLtr.',
      variant: 'success'
    });
  } catch (error) {
    console.error('Failed to update onboarding status:', error);
  }
}

/**
 * Start the guided tour
 * @param userId The current user's ID
 */
export function startTour(userId?: string) {
  configureTour();

  // Set up tour completion handler
  tour.on('complete', () => {
    if (userId) {
      markOnboardingComplete(userId);
    }
  });

  // Set up tour cancellation handler
  tour.on('cancel', () => {
    if (userId) {
      // Even if cancelled, mark as seen but not completed
      supabase
        .from('profiles')
        .update({
          onboarding_step: 50 // Use 50 to indicate partially completed
        })
        .eq('id', userId);
    }
  });

  tour.start();
}

// Export the tour instance
export default tour;
