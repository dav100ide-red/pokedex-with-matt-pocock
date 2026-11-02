import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { DARK_MODE_CLASS, ThemeService } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: `.${DARK_MODE_CLASS}` } },
    }),
    // PrimeNG doesn't provide these in root: one app-wide instance each, for the <p-toast> and
    // <p-confirmdialog> in App.
    MessageService,
    ConfirmationService,
    // Applies the saved or OS theme before the first render.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
