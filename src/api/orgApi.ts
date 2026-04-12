import { members, organizationTeams } from '../data';
import type { Member, OrganizationTeam } from '../types';
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
