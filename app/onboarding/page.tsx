'use client';

import { OnboardingWizard } from '@/components/OnboardingWizard';

// Sem <RouteGuard> de propósito: /onboarding é a rota de escape, sempre acessível
// (inclusive é para onde o reset de dados em /configuracoes redireciona).
export default function OnboardingPage() {
  return <OnboardingWizard />;
}
