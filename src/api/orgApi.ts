import { members, organizationSpaces, organizationTeams } from '../data';
import type { Member, OrganizationSpace, OrganizationTeam } from '../types';
import { mockLatency } from './mockUtils';

export async function fetchMembers(): Promise<Member[]> {
  await mockLatency();
  return members.map((m) => ({ ...m }));
}

export async function fetchOrganizationTeams(): Promise<OrganizationTeam[]> {
  await mockLatency();
  return organizationTeams.map((t) => ({
    ...t,
    members: t.members.map((m) => ({ ...m })),
  }));
}

export async function fetchOrganizationSpaces(): Promise<OrganizationSpace[]> {
  await mockLatency();
  return organizationSpaces.map((s) => ({ ...s }));
}
