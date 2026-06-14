import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterComponent } from './register/register.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
