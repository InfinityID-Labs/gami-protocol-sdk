import { useState, useEffect } from 'react';
import { useShepherd } from 'react-shepherd';
import 'shepherd.js/dist/css/shepherd.css';

// Extending the ShepherdBase type since the TypeScript definitions in the library are incomplete
// This allows us to use the methods we need without TypeScript errors
interface ShepherdInstance {
  cancel: () => void;
  next: () => void;
  back: () => void;
  complete: () => void;
  isActive: boolean;
  start: () => void;
  tour?: {
    options: {
      defaultStepOptions: {
        classes: string;
        scrollTo: boolean;
        cancelIcon: {
          enabled: boolean;
        };
      };
      steps: any[];
    };
  };
}

type TutorialType = 'dashboard' | 'sdk-config' | 'xp-management' | 'wallet-integration' | 'campaigns' | 'analytics';

export function useTutorial(tutorialType: TutorialType) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  // Cast to our custom interface to access all the methods we need
  const shepherd = useShepherd() as unknown as ShepherdInstance;

  // Function to save that the user has seen the tutorial
  const markTutorialAsSeen = () => {
    localStorage.setItem(`gami-tutorial-${tutorialType}`, 'seen');
    setHasSeenTutorial(true);
  };

  // Check if the user has already seen this tutorial
  useEffect(() => {
    const hasSeen = localStorage.getItem(`gami-tutorial-${tutorialType}`);
    setHasSeenTutorial(!!hasSeen);
  }, [tutorialType]);

  // Generate tutorial steps based on the tutorial type
  const getTutorialSteps = () => {
    switch (tutorialType) {
      case 'dashboard':
        return [
          {
            id: 'welcome',
            attachTo: { element: '.dashboard-overview', on: 'bottom' },
            title: 'Welcome to Gami Protocol!',
            text: 'This is your dashboard where you can monitor your gamification metrics and manage your projects.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'projects',
            attachTo: { element: '.projects-list', on: 'bottom' },
            title: 'Your Projects',
            text: 'Here you can view your existing projects or create new ones. Each project has its own API key and configuration.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'quick-actions',
            attachTo: { element: '.quick-actions', on: 'bottom' },
            title: 'Quick Actions',
            text: 'These shortcuts help you quickly access common tasks like creating a new XP event or setting up a reward campaign.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'navigation',
            attachTo: { element: '.sidebar-nav', on: 'right' },
            title: 'Navigation',
            text: 'Use this sidebar to navigate between different sections of the platform, including SDK configuration, XP management, and analytics.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
      
      case 'sdk-config':
        return [
          {
            id: 'sdk-welcome',
            attachTo: { element: '.sdk-section', on: 'bottom' },
            title: 'SDK Configuration',
            text: 'Here you can manage your SDK settings and get your API key for integrating with your applications.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'api-key',
            attachTo: { element: '.api-key-section', on: 'bottom' },
            title: 'Your API Key',
            text: 'This is your unique API key. You\'ll need it to initialize the Gami SDK in your application.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'installation-guide',
            attachTo: { element: '.installation-guide', on: 'bottom' },
            title: 'Installation Guide',
            text: 'Follow these instructions to integrate the Gami SDK into your application. We support JavaScript, TypeScript, and other platforms.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
        
      case 'xp-management':
        return [
          {
            id: 'xp-welcome',
            attachTo: { element: '.xp-management-header', on: 'bottom' },
            title: 'XP Management',
            text: 'Here you can create and manage experience points (XP) events for your users.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'xp-events',
            attachTo: { element: '.xp-events-list', on: 'bottom' },
            title: 'XP Events',
            text: 'These are the custom events that award XP to your users. You can edit existing events or create new ones.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'create-event',
            attachTo: { element: '.create-event-button', on: 'bottom' },
            title: 'Create New Events',
            text: 'Click here to create a new XP event. You\'ll need to define a name, XP amount, and description.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
        
      case 'wallet-integration':
        return [
          {
            id: 'wallet-welcome',
            attachTo: { element: '.wallet-integration-header', on: 'bottom' },
            title: 'Wallet Integration',
            text: 'Connect blockchain wallets to enable token rewards for your users.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'connect-wallet',
            attachTo: { element: '.wallet-connect-section', on: 'bottom' },
            title: 'Connect a Wallet',
            text: 'Configure how users will connect their wallets in your application. We support Phantom, Solflare, and other Solana wallets.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'wallet-settings',
            attachTo: { element: '.wallet-settings-section', on: 'bottom' },
            title: 'Wallet Settings',
            text: 'Customize wallet connection options and permissions for your application.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
        
      case 'campaigns':
        return [
          {
            id: 'campaigns-welcome',
            attachTo: { element: '.campaigns-header', on: 'bottom' },
            title: 'Reward Campaigns',
            text: 'Create time-limited campaigns to engage users with special rewards and challenges.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'active-campaigns',
            attachTo: { element: '.active-campaigns-list', on: 'bottom' },
            title: 'Active Campaigns',
            text: 'These are your currently running campaigns. Monitor their progress and engagement metrics here.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'create-campaign',
            attachTo: { element: '.create-campaign-button', on: 'bottom' },
            title: 'Create New Campaign',
            text: 'Start a new campaign by setting goals, rewards, and duration. Effective campaigns can significantly boost user engagement.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
        
      case 'analytics':
        return [
          {
            id: 'analytics-welcome',
            attachTo: { element: '.analytics-header', on: 'bottom' },
            title: 'Analytics Dashboard',
            text: 'Track user engagement and gamification metrics to measure the effectiveness of your strategy.',
            buttons: [
              {
                action: shepherd.cancel,
                classes: 'shepherd-button-secondary',
                text: 'Skip Tutorial'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'xp-overview',
            attachTo: { element: '.xp-overview-chart', on: 'bottom' },
            title: 'XP Distribution',
            text: 'This chart shows how XP is being earned across different events in your application.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'user-engagement',
            attachTo: { element: '.user-engagement-metrics', on: 'bottom' },
            title: 'User Engagement',
            text: 'Monitor how users are interacting with your gamification features and which events are most popular.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: shepherd.next,
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Next'
              }
            ]
          },
          {
            id: 'export-data',
            attachTo: { element: '.export-data-button', on: 'bottom' },
            title: 'Export Analytics',
            text: 'Download reports and raw data for further analysis in your preferred tools.',
            buttons: [
              {
                action: shepherd.back,
                classes: 'shepherd-button-secondary',
                text: 'Back'
              },
              {
                action: () => {
                  markTutorialAsSeen();
                  shepherd.complete();
                },
                classes: 'shepherd-button-primary bg-[#7631f9] hover:bg-[#9156ff]',
                text: 'Finish'
              }
            ]
          }
        ];
      
      default:
        return [];
    }
  };

  // Start the tutorial if the user hasn't seen it yet
  const startTutorial = () => {
    if (hasSeenTutorial) return;
    
    if (shepherd.isActive) {
      shepherd.cancel();
    }
    
    // Get the tutorial steps
    const steps = getTutorialSteps();
    
    // With react-shepherd, we need to add steps directly to the tour options
    // before starting the tour instead of using addSteps
    if (steps.length > 0 && shepherd) {
      if (shepherd.tour) {
        shepherd.tour.options.defaultStepOptions = {
          classes: 'shepherd-theme-default gami-tutorial-step',
          scrollTo: true,
          cancelIcon: {
            enabled: true
          }
        };
        shepherd.tour.options.steps = steps;
        shepherd.start();
      }
    }
  };

  // Force start the tutorial even if the user has seen it before
  const forceStartTutorial = () => {
    if (shepherd.isActive) {
      shepherd.cancel();
    }
    
    // Get the tutorial steps
    const steps = getTutorialSteps();
    
    // With react-shepherd, we need to add steps directly to the tour options
    // before starting the tour instead of using addSteps
    if (steps.length > 0 && shepherd) {
      if (shepherd.tour) {
        shepherd.tour.options.defaultStepOptions = {
          classes: 'shepherd-theme-default gami-tutorial-step',
          scrollTo: true,
          cancelIcon: {
            enabled: true
          }
        };
        shepherd.tour.options.steps = steps;
        shepherd.start();
      }
    }
  };

  return { startTutorial, forceStartTutorial, hasSeenTutorial };
}