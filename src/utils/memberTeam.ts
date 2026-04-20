import type { Member, OrganizationTeam, OrganizationTeamMemberAvatar } from '../types';

/** 团队列表 / 组织页团队小卡上重叠头像最多展示个数，超出部分不显示 */
export const TEAM_CARD_AVATAR_DISPLAY_CAP = 9;

/** 成员.team 与团队名称一致或为「、」分隔多团队时视为属于该团队（与成员管理、团队详情一致） */
export function memberBelongsToTeam(m: Member, teamName: string): boolean {
  const raw = m.team?.trim();
  if (!raw) return false;
  if (raw === teamName) return true;
  if (raw.includes('、')) {
    return raw
      .split('、')
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(teamName);
  }
  return false;
}

/** 团队卡片重叠头像：与成员管理中该成员的 initial、bgColor 一致 */
export function memberAvatarsForTeam(
  teamName: string,
  members: readonly Member[],
): OrganizationTeamMemberAvatar[] {
  return members
    .filter((m) => memberBelongsToTeam(m, teamName))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    .map((m) => ({
      initial: m.initial,
      color: m.bgColor,
      memberId: m.id,
    }));
}

export function teamsWithMemberAvatars(
  teams: readonly OrganizationTeam[],
  members: readonly Member[],
): OrganizationTeam[] {
  return teams.map((t) => ({
    ...t,
    members: memberAvatarsForTeam(t.name, members),
  }));
}
