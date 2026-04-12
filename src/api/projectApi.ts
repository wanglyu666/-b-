import { engineeringProjects, maintenanceProjects } from '../data';
import type { EngineeringProject, MaintenanceProject } from '../types';
import { mockLatency } from './mockUtils';

export async function fetchEngineeringProjects(): Promise<EngineeringProject[]> {
  await mockLatency();
  return engineeringProjects.map((p) => ({ ...p }));
}

export async function fetchMaintenanceProjects(): Promise<MaintenanceProject[]> {
  await mockLatency();
  return maintenanceProjects.map((p) => ({ ...p }));
}
