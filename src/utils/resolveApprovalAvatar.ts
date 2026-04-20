import type { Member } from '../types';

/** 与审批时间轴步骤中字段一致即可解析 */
export type ApprovalStepAvatarSource = {
  approverName: string;
  avatarInitial: string;
  avatarBg: string;
};

export function resolveApprovalStepAvatar(
  step: ApprovalStepAvatarSource,
  members: readonly Member[],
):
  | { initial: string; useHex: true; hex: string }
  | { initial: string; useHex: false; tailwindClass: string } {
  const name = step.approverName.trim();
  const m = members.find((x) => x.name.trim() === name);
  if (m) {
    return { initial: m.initial, useHex: true, hex: m.bgColor };
  }
  return {
    initial: step.avatarInitial,
    useHex: false,
    tailwindClass: step.avatarBg,
  };
}
