import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthFacade } from '../../../../core';
import { ThemeToggleComponent } from '../../../../shared';

/**
 * Registration page component.
 * Follows the same layout pattern as the login page.
 */
@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatIconButton,
    MatIcon,
    MatPrefix,
    MatSuffix,
    MatProgressSpinner,
    ThemeToggleComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  protected readonly loading = this.authFacade.loading;
  protected readonly error = this.authFacade.error;
  protected readonly hidePassword = signal(true);
  protected readonly hidePasswordConfirmation = signal(true);

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', [Validators.required]],
    },
    {
      validators: [this.passwordMatchValidator],
    }
  );

  constructor() {
    // Redirect to tasks when authenticated
    effect(() => {
      if (this.authFacade.isAuthenticated()) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password, passwordConfirmation } = this.form.getRawValue();
    this.authFacade.register(name, email, password, passwordConfirmation);
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hide) => !hide);
  }

  protected togglePasswordConfirmationVisibility(): void {
    this.hidePasswordConfirmation.update((hide) => !hide);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirmation = control.get('passwordConfirmation');

    if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
      passwordConfirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}

