import type { Component } from 'vue';
import ManagementPage from '../pages/ManagementPage.vue';
import OrganizationArchitecturePage from '../pages/OrganizationArchitecturePage.vue';
import ConsultationFeedbackPage from '../pages/ConsultationFeedbackPage.vue';

const dynamicComponentRegistry: Record<string, Component> = {
  ManagementPage,
  OrganizationArchitecturePage,
  ConsultationFeedbackPage,
};

export function resolveDynamicRouteComponent(key: string): Component | null {
  return dynamicComponentRegistry[key] ?? null;
}
