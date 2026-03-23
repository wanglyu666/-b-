import { ref, computed, type Ref } from 'vue';

const defaultDefects = [
  { 
    id: 1, 
    image: 'https://picsum.photos/seed/defect1/800/600', 
    rectifiedImage: 'https://picsum.photos/seed/rectified1/800/600',
    description: '吊顶龙骨安装间距不符合规范，局部存在下垂现象，需重新加固。', 
    date: '2026-03-10', 
    planDate: '2026-03-15',
    finishDate: '2026-03-14',
    status: '已完成' 
  },
  { 
    id: 2, 
    image: 'https://picsum.photos/seed/defect2/800/600', 
    rectifiedImage: '',
    description: '墙面乳胶漆涂刷不均匀，存在明显流坠和透底，需重新打磨涂刷。', 
    date: '2026-03-12', 
    planDate: '2026-03-18',
    finishDate: '',
    status: '整改中' 
  },
  { 
    id: 3, 
    image: 'https://picsum.photos/seed/defect3/800/600', 
    rectifiedImage: '',
    description: '地面瓷砖空鼓率超标，共计5处，需拆除重新铺贴。', 
    date: '2026-03-14', 
    planDate: '2026-03-20',
    finishDate: '',
    status: '待整改' 
  },
];

const defaultReportDefects = [
  { 
    id: 101, 
    image: 'https://picsum.photos/seed/report1/800/600', 
    rectifiedImage: '',
    description: '现场堆放杂乱，未按规定区域分类堆放材料。', 
    date: '2026-03-15', 
    planDate: '2026-03-20',
    finishDate: '',
    status: '待处理' 
  },
  { 
    id: 102, 
    image: 'https://picsum.photos/seed/report2/800/600', 
    rectifiedImage: 'https://picsum.photos/seed/report2_rect/800/600',
    description: '部分工人未佩戴安全帽进入施工区域。', 
    date: '2026-03-16', 
    planDate: '2026-03-17',
    finishDate: '2026-03-16',
    status: '已处理' 
  }
];

const defaultMaterialData = [
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-001', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*14', unit: '平方', qty: 100, plan: '2025-12-30', actual: '2026-03-13', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-002', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*15', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'BLM-HM-001', name: '玻璃棉', brand: '华美', model: '/', spec: '5公分24K', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
];

const defaultProgressData = [
  { node: '竣工验收', planDate: '2026-01-31', appointmentDate: '', type: '现场验收', status: '未通过' },
  { node: '电气测试', planDate: '2026-01-25', appointmentDate: '', type: '现场验收', status: '未通过' },
  { node: '放线验收', planDate: '2026-01-19', appointmentDate: '2026-03-13', type: '现场验收', status: '已通过' },
];

const defaultAfterSalesData = [
  { planName: '第1次售后计划', planDate: '2026-07-11', startDate: '', endDate: '', canAccept: false },
  { planName: '第2次售后计划', planDate: '2027-01-11', startDate: '', endDate: '', canAccept: true },
  { planName: '第3次售后计划', planDate: '2027-07-11', startDate: '', endDate: '', canAccept: false },
];

export interface ProjectData {
  defects: any[];
  reportDefects: any[];
  materialData: any[];
  progressData: any[];
  afterSalesData: any[];
  submittedMaterials: string[];
  submittedProgressItems: string[];
}

const projectDataMap = ref<Record<string, ProjectData>>({});

export const getProjectData = (projectId: string) => {
  if (!projectDataMap.value[projectId]) {
    const seedSuffix = projectId.substring(0, 4);
    projectDataMap.value[projectId] = {
      defects: JSON.parse(JSON.stringify(defaultDefects)).map((d: any) => ({
        ...d,
        image: d.image.replace('defect', `defect_${seedSuffix}_`),
        rectifiedImage: d.rectifiedImage ? d.rectifiedImage.replace('rectified', `rectified_${seedSuffix}_`) : ''
      })),
      reportDefects: JSON.parse(JSON.stringify(defaultReportDefects)).map((d: any) => ({
        ...d,
        image: d.image.replace('report', `report_${seedSuffix}_`),
        rectifiedImage: d.rectifiedImage ? d.rectifiedImage.replace('report', `report_${seedSuffix}_`) : ''
      })),
      materialData: JSON.parse(JSON.stringify(defaultMaterialData)).map((m: any) => ({
        ...m,
        code: `${m.code}-${seedSuffix}`
      })),
      progressData: JSON.parse(JSON.stringify(defaultProgressData)),
      afterSalesData: JSON.parse(JSON.stringify(defaultAfterSalesData)),
      submittedMaterials: [],
      submittedProgressItems: []
    };
  }
  return projectDataMap.value[projectId];
};

export function useProjectData(selectedProjectId: Ref<string | undefined>) {
  const currentProjectData = computed(() => {
    if (!selectedProjectId.value) return null;
    return getProjectData(selectedProjectId.value);
  });

  const defects = computed({
    get: () => currentProjectData.value?.defects || [],
    set: (val) => {
      if (currentProjectData.value) currentProjectData.value.defects = val;
    }
  });

  const reportDefects = computed({
    get: () => currentProjectData.value?.reportDefects || [],
    set: (val) => {
      if (currentProjectData.value) currentProjectData.value.reportDefects = val;
    }
  });

  const materialData = computed(() => currentProjectData.value?.materialData || []);
  const progressData = computed(() => currentProjectData.value?.progressData || []);
  const afterSalesData = computed(() => currentProjectData.value?.afterSalesData || []);

  const submittedMaterials = computed({
    get: () => currentProjectData.value?.submittedMaterials || [],
    set: (val) => {
      if (currentProjectData.value) currentProjectData.value.submittedMaterials = val;
    }
  });

  const submittedProgressItems = computed({
    get: () => currentProjectData.value?.submittedProgressItems || [],
    set: (val) => {
      if (currentProjectData.value) currentProjectData.value.submittedProgressItems = val;
    }
  });

  return {
    defects,
    reportDefects,
    materialData,
    progressData,
    afterSalesData,
    submittedMaterials,
    submittedProgressItems
  };
}
