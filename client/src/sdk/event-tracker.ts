import { TrackEventParams, TrackEventResponse } from './types';
import { apiRequest, configureApi } from './api';

export class EventTracker {
  /**
   * Initialize the event tracker with API configuration
   * @param apiUrl Base API URL
   * @param apiKey API key
   */
  constructor(apiUrl: string, apiKey: string) {
    // Configure the API module for this instance
    configureApi(apiUrl, apiKey);
  }

  /**
   * Track an XP event for a user
   * @param params The event parameters
   * @returns Promise with the tracking result
   */
  async trackEvent(params: TrackEventParams): Promise<TrackEventResponse> {
    try {
      const response = await apiRequest('POST', '/track', params);
      return await response.json() as TrackEventResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Add an event listener to track user actions
   * @param element The DOM element to listen to
   * @param eventType The DOM event type (e.g., 'click', 'submit')
   * @param gamiEvent The Gami event name to track
   * @param userId The user ID
   * @param metadataFn Optional function to extract metadata from the event
   */
  addEventTracker(
    element: HTMLElement | null,
    eventType: string,
    gamiEvent: string,
    userId: string,
    metadataFn?: (event: Event) => Record<string, any>
  ): void {
    if (!element) {
      console.warn(`Element not found for tracking ${gamiEvent}`);
      return;
    }

    element.addEventListener(eventType, async (event) => {
      const metadata = metadataFn ? metadataFn(event) : {};
      
      await this.trackEvent({
        userId,
        event: gamiEvent,
        metadata,
      });
    });
  }
}
