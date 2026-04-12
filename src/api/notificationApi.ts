import type { TodoNotification } from '../types/app-domain';
import { mockLatency } from './mockUtils';

const todoSeed: TodoNotification[] = [
  { id: 1, title: '新周报已提交', content: '项目经理王建国提交了本周施工周报', projectName: '星海湾一号别墅全屋定制', projectId: '1', projectStatus: '施工中', viewMode: 'reports', time: '10分钟前', kind: 'report', unread: true },
  { id: 2, title: '竣工资料待审核', content: '已上传竣工验收报告，等待审核确认', projectName: '万科城3期精装房改造', projectId: '3', projectStatus: '已完工', viewMode: 'completion', time: '30分钟前', kind: 'completion', unread: true },
  { id: 3, title: '可预约过程验收', content: '基础工程节点已完成，可预约验收时间', projectName: '国际会展中心展厅搭建', projectId: '11', projectStatus: '施工中', viewMode: 'acceptance', time: '1小时前', kind: 'acceptance', unread: true },
  { id: 4, title: '新日报已提交', content: '今日施工进度报告已更新', projectName: '滨海商业街外立面改造', projectId: '12', projectStatus: '施工中', viewMode: 'reports', time: '2小时前', kind: 'report', unread: true },
  { id: 5, title: '待评价', content: '项目已完成关键节点，请进行阶段评价', projectName: '金融中心VIP接待室升级', projectId: '7', projectStatus: '施工中', viewMode: 'evaluation', time: '3小时前', kind: 'evaluation', unread: true },
  { id: 6, title: '施工标准已更新', content: '环境管控标准新增扬尘控制细则', projectName: '未来科技城研发中心装修', projectId: '21', projectStatus: '施工中', viewMode: 'standards', time: '5小时前', kind: 'standards', unread: true },
];

export async function fetchTodoNotifications(): Promise<TodoNotification[]> {
  await mockLatency();
  return todoSeed.map((item) => ({ ...item }));
}
