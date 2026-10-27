export type BaseDataNavigationNode = {
  key: string;
  title: string;
  kind: "category" | "table";
  children?: BaseDataNavigationNode[];
};

const firstLevelCategories = [
  "学校基本信息",
  "办学基本条件",
  "思政教育情况",
  "教职工基本信息",
  "学生基本信息",
  "学科专业基本信息",
];

const childIndexes = [1, 2];

function createNavigationNode(key: string, title: string, level: number): BaseDataNavigationNode {
  if (level === 4) return { key, title, kind: "table" };

  return {
    key,
    title,
    kind: "category",
    children: childIndexes.map((index) => {
      const childKey = `${key}-${index}`;
      const childTitle = level === 3 ? `${title}表单` : `${title}子级`;
      return createNavigationNode(childKey, childTitle, level + 1);
    }),
  };
}

function createNavigationChildren(keyPrefix = ""): BaseDataNavigationNode[] {
  return firstLevelCategories.slice(0, 2).map((title, index) => createNavigationNode(`${keyPrefix}level-${index + 1}`, title, 1));
}

function createSingleNavigationPath(keyPrefix: string, titles: readonly string[], index = 0): BaseDataNavigationNode {
  const title = titles[index];
  if (index === titles.length - 1) return { key: `${keyPrefix}${index + 1}`, title, kind: "table" };

  return {
    key: `${keyPrefix}${index + 1}`,
    title,
    kind: "category",
    children: [createSingleNavigationPath(keyPrefix, titles, index + 1)],
  };
}

const additionalNavigationGroups = [
  { key: "hr", title: "人事处", path: ["人事基础数据", "人员档案", "职工信息", "职工表单"] },
  { key: "academic", title: "教务处", path: ["教务基础数据", "教学计划", "课程信息", "课程表单"] },
  { key: "research-office", title: "科研处", path: ["科研基础数据", "项目管理", "成果信息", "成果表单"] },
  { key: "finance-office", title: "财务处", path: ["财务基础数据", "预算管理", "资产信息", "资产表单"] },
];

export const baseDataNavigation: BaseDataNavigationNode[] = [
  {
    key: "root",
    title: "学生处",
    kind: "category",
    children: createNavigationChildren(),
  },
  ...additionalNavigationGroups.map((group) => ({
    key: group.key,
    title: group.title,
    kind: "category" as const,
    children: [createSingleNavigationPath(`${group.key}-`, group.path)],
  })),
];

export const baseDataNavigationDefaultOpenKeys = ["root", "level-2", "level-2-1", "level-2-1-1"];

export function getBaseDataNavigationTableNodes(nodes = baseDataNavigation): BaseDataNavigationNode[] {
  return nodes.flatMap((node) => node.kind === "table" ? [node] : getBaseDataNavigationTableNodes(node.children || []));
}
