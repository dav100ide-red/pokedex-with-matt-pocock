import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { ThemeService } from './theme.service';

/** Switches between light and dark mode. */
@Component({
  selector: 'app-theme-toggle',
  imports: [Button, Tooltip],
  template: `
    <p-button
      [icon]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"
      [ariaLabel]="label()"
      [pTooltip]="label()"
      tooltipPosition="bottom"
      severity="secondary"
      [text]="true"
      [rounded]="true"
      (onClick)="theme.toggle()"
    />
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly label = computed(() =>
    this.theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode',
  );
}
