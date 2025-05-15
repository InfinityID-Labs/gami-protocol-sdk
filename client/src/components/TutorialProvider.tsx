import { ReactNode } from 'react';
import { ShepherdJourneyProvider } from 'react-shepherd';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shepherd-theme-custom',
    scrollTo: { behavior: 'smooth', block: 'center' }
  },
  useModalOverlay: true
};

interface TutorialProviderProps {
  children: ReactNode;
}

export default function TutorialProvider({ children }: TutorialProviderProps) {
  return (
    <ShepherdJourneyProvider>
      {children}
    </ShepherdJourneyProvider>
  );
}