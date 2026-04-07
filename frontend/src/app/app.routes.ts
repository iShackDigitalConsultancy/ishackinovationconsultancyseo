import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './dashboard/dashboard';
import { AdminDashboard } from './admin/admin';
import { WhiteLabelSeo } from './white-label-seo/white-label-seo';
import { AiSeoSoftware } from './ai-seo-software/ai-seo-software';
import { TermsComponent } from './terms/terms';
import { OnboardingFunnel } from './onboarding/onboarding';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'admin', component: AdminDashboard },
  { path: 'admin/:tab', component: AdminDashboard },
  { path: 'white-label-seo', component: WhiteLabelSeo },
  { path: 'ai-seo-software', component: AiSeoSoftware },
  { path: 'terms', component: TermsComponent },
  { path: 'onboarding', component: OnboardingFunnel },
  { path: '**', redirectTo: '' }
];
