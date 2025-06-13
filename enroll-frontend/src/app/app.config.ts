// Removed invalid import as 'provideZoneChangeDetection' is not exported from '@angular/core'
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig = {
  providers: [provideRouter(routes)] // Removed 'provideZoneChangeDetection' as it is not valid
};
