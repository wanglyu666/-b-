/** 审批流程记录 · 单步（时间轴） */
export interface ApprovalTimelineStep {
  approverName: string;
  role: string;
  avatarInitial: string;
  avatarBg: string;
  /** 审批时间；未产生时可为「—」 */
  time: string;
  /** 同意 | 待审批 | 未开始 */
  result: '同意' | '待审批' | '未开始';
  comment: string;
}

/** 审批配置卡片（组织页预览与审批配置页列表共用） */
export interface ApprovalFlowCard {
  id: string;
  type: string;
  initiator: string;
  time: string;
  /**
   * 进行中：当前待审批人姓名（与 timeline 中「待审批」步骤一致）；
   * 已完成：可为空或末级审批人，卡片上不展示流程仅展示「已完成」
   */
  currentApprover: string;
  /** pending：进行中；completed：已全部结束 */
  status: 'pending' | 'completed';
  timeline: ApprovalTimelineStep[];
}

function step(
  approverName: string,
  role: string,
  avatarInitial: string,
  avatarBg: string,
  result: ApprovalTimelineStep['result'],
  time: string,
  comment: string,
): ApprovalTimelineStep {
  return {
    approverName,
    role,
    avatarInitial,
    avatarBg,
    time,
    result,
    comment,
  };
}

/** 三条均通过（已完成） */
function completedThree(
  v: 1 | 2 | 3,
): ApprovalTimelineStep[] {
  switch (v) {
    case 1:
      return [
        step(
          '李四',
          '部门主管',
          '李',
          'bg-blue-500',
          '同意',
          '2026-04-10 10:10:33',
          '资料完整，符合采购流程，同意申请。',
        ),
        step(
          '王五',
          '财务主管',
          '王',
          'bg-emerald-500',
          '同意',
          '2026-04-10 14:22:05',
          '预算在可控范围内，审核通过。',
        ),
        step(
          '赵敏',
          '总经理',
          '赵',
          'bg-violet-500',
          '同意',
          '2026-04-10 16:08:41',
          '同意执行。',
        ),
      ];
    case 2:
      return [
        step(
          '刘洋',
          '项目经理',
          '刘',
          'bg-indigo-500',
          '同意',
          '2026-04-13 09:05:00',
          '结算材料齐全。',
        ),
        step(
          '王强',
          '复核',
          '王',
          'bg-blue-500',
          '同意',
          '2026-04-13 11:11:11',
          '同意结算。',
        ),
        step(
          '孙丽',
          '财务总监',
          '孙',
          'bg-violet-500',
          '同意',
          '2026-04-13 16:45:30',
          '终审通过。',
        ),
      ];
    default:
      return [
        step(
          '赵敏',
          '财务经理',
          '赵',
          'bg-rose-500',
          '同意',
          '2026-04-14 14:30:45',
          '同意支付。',
        ),
        step(
          '张伟',
          '分管领导',
          '张',
          'bg-indigo-500',
          '同意',
          '2026-04-14 17:05:09',
          '批准付款。',
        ),
        step(
          '周杰',
          '出纳',
          '周',
          'bg-amber-500',
          '同意',
          '2026-04-14 18:20:00',
          '已安排付款。',
        ),
      ];
  }
}

/** 完整列表：含多条「进行中」演示 + 「已完成」 */
export const approvalFlowCards: ApprovalFlowCard[] = [
  /** 进行中：李四已通过，当前待王五 */
  {
    id: 'a1',
    type: '下单审批',
    initiator: 'XXXX',
    time: '2026年4月10日',
    status: 'pending',
    currentApprover: '王五',
    timeline: [
      step(
        '李四',
        '部门主管',
        '李',
        'bg-blue-500',
        '同意',
        '2026-04-10 10:10:33',
        '资料完整，符合采购流程，同意申请。',
      ),
      step(
        '王五',
        '财务主管',
        '王',
        'bg-emerald-500',
        '待审批',
        '—',
        '等待财务主管审批。',
      ),
      step(
        '赵敏',
        '总经理',
        '赵',
        'bg-violet-500',
        '未开始',
        '—',
        '前一环节通过后将流转至总经理。',
      ),
    ],
  },
  /** 进行中：王五已通过，当前待刘洋 */
  {
    id: 'a2',
    type: '下单审批',
    initiator: 'YYYY',
    time: '2026年4月11日',
    status: 'pending',
    currentApprover: '刘洋',
    timeline: [
      step(
        '王五',
        '部门主管',
        '王',
        'bg-blue-500',
        '同意',
        '2026-04-11 09:15:00',
        '流程合规，同意进入下一环节。',
      ),
      step(
        '刘洋',
        '风控',
        '刘',
        'bg-amber-500',
        '待审批',
        '—',
        '等待风控审批。',
      ),
      step(
        '陈明',
        '总监',
        '陈',
        'bg-rose-500',
        '未开始',
        '—',
        '该节点尚未开启。',
      ),
    ],
  },
  /** 进行中：尚在第一岗，当前待张伟 */
  {
    id: 'a3',
    type: '验收审批',
    initiator: '赵敏',
    time: '2026年4月12日',
    status: 'pending',
    currentApprover: '张伟',
    timeline: [
      step(
        '张伟',
        '项目经理',
        '张',
        'bg-indigo-500',
        '待审批',
        '—',
        '申请已提交，等待项目经理处理。',
      ),
      step(
        '李秀英',
        '质量负责人',
        '李',
        'bg-teal-500',
        '未开始',
        '—',
        '该节点尚未开启。',
      ),
      step(
        '周杰',
        '部门经理',
        '周',
        'bg-cyan-500',
        '未开始',
        '—',
        '该节点尚未开启。',
      ),
    ],
  },
  /** 已完成 */
  {
    id: 'a4',
    type: '结算审批',
    initiator: '刘洋',
    time: '2026年4月13日',
    status: 'completed',
    currentApprover: '孙丽',
    timeline: completedThree(1),
  },
  {
    id: 'a5',
    type: '支付审批',
    initiator: '周杰',
    time: '2026年4月14日',
    status: 'completed',
    currentApprover: '周杰',
    timeline: completedThree(2),
  },
  {
    id: 'a6',
    type: '下单审批',
    initiator: '孙丽',
    time: '2026年4月15日',
    status: 'completed',
    currentApprover: '刘洋',
    timeline: completedThree(3),
  },
];

/** 组织与架构首页仅展示前 2 条 */
export const approvalFlowCardsOrgPreview = approvalFlowCards.slice(0, 2);
