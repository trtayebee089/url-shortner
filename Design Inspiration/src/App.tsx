import { RouterProvider, useRouter } from '@/lib/router';

import { HomePage } from '@/pages/HomePage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { PricingPage } from '@/pages/PricingPage';
import { FAQPage } from '@/pages/FAQPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from '@/pages/SimplePages';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardOverview } from '@/pages/DashboardOverview';
import { LinksPage } from '@/pages/LinksPage';
import { CreateLinkPage } from '@/pages/CreateLinkPage';
import { LinkDetailsPage } from '@/pages/LinkDetailsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ResourcesPage, ResourceArticlePage } from '@/pages/ResourcesPage';

function Router() {
  const { route } = useRouter();

  switch (route) {
    case '/': return <HomePage />;
    case '/features': return <FeaturesPage />;
    case '/pricing': return <PricingPage />;
    case '/faq': return <FAQPage />;
    case '/about': return <AboutPage />;
    case '/contact': return <ContactPage />;
    case '/privacy': return <PrivacyPage />;
    case '/terms': return <TermsPage />;
    case '/login': return <LoginPage />;
    case '/register': return <RegisterPage />;
    case '/forgot-password': return <ForgotPasswordPage />;
    case '/dashboard': return <DashboardOverview />;
    case '/dashboard/links': return <LinksPage />;
    case '/dashboard/links/create': return <CreateLinkPage />;
    case '/dashboard/links/detail': return <LinkDetailsPage />;
    case '/dashboard/analytics': return <AnalyticsPage />;
    case '/dashboard/settings': return <SettingsPage />;
    case '/dashboard/profile': return <ProfilePage />;
    case '/resources': return <ResourcesPage />;
    case '/resources/article': return <ResourceArticlePage />;
    default: return <HomePage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <Router />
    </RouterProvider>
  );
}
