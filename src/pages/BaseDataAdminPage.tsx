import { Alert, Button, Card, Checkbox, Collapse, Divider, Empty, Flex, Input, message, Modal, Pagination, Rate, Select, Space, Switch, Table, Tag, Tooltip, Tree, Typography } from "antd";
import type { DataNode } from "antd/es/tree";
import {
  Check as CheckOutlined,
  Close as CloseOutlined,
  Copy as CopyOutlined,
  Delete as DeleteOutlined,
  Down as DownOutlined,
  Edit as EditOutlined,
  FileText as FileTextOutlined,
  FolderOpen as FolderOpenOutlined,
  Plus as PlusOutlined,
  Search as SearchOutlined,
  SortTwo as SortOutlined,
  Setting as SettingOutlined,
  SettingTwo as PermissionSettingOutlined,
  Notes as NotesOutlined,
  TreeDiagram as ApartmentOutlined,
  Up as UpOutlined,
  Upload as UploadOutlined,
  Download as DownloadOutlined,
  AddItem,
  AddSubset,
  Drag as DragOutlined,
} from "@icon-park/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { OverflowTooltip } from "../components/OverflowTooltip";
import { BaseDataNavigationMenu } from "../components/BaseDataNavigationMenu";
import type { BaseDataNavigationMenuNode } from "../components/BaseDataNavigationMenu";
import { baseDataNavigation, baseDataNavigationDefaultOpenKeys } from "../data/baseDataNavigation";
import { AppShell } from "../layouts/AppShell";

const modalCloseIcon = <CloseOutlined size={20} />;

type NavigationNode = BaseDataNavigationMenuNode;

type PermissionRoleOption = {
  key: string;
  label: string;
};

type PermissionRoleGroup = PermissionRoleOption & {
  roleKeys: string[];
};

function decorateNavigationNodes(nodes: typeof baseDataNavigation): NavigationNode[] {
  return nodes.map((node) => ({
    ...node,
    icon: node.kind === "table" ? <NotesOutlined /> : <ApartmentOutlined />,
    children: node.children ? decorateNavigationNodes(node.children) : undefined,
  }));
}

const navigationData = decorateNavigationNodes(baseDataNavigation);

function getExpandableNavigationKeys(nodes: NavigationNode[]): string[] {
  return nodes.flatMap((node) => node.children ? [node.key, ...getExpandableNavigationKeys(node.children)] : []);
}

function countFormNavigationNodes(nodes: NavigationNode[]): number {
  return nodes.reduce((count, node) => count + (node.kind === "table" ? 1 : 0) + (node.children ? countFormNavigationNodes(node.children) : 0), 0);
}

function findFirstFormNavigationNode(nodes: NavigationNode[]): NavigationNode | undefined {
  for (const node of nodes) {
    if (node.kind === "table") return node;
    if (node.children) {
      const found = findFirstFormNavigationNode(node.children);
      if (found) return found;
    }
  }
  return undefined;
}

const defaultOpenNavigationKeys = baseDataNavigationDefaultOpenKeys;

const emptyNavigationData: NavigationNode[] = [
  { key: "root", title: "学生处", kind: "category", icon: <NotesOutlined /> },
];

function findNavigationNode(nodes: NavigationNode[], key: string): NavigationNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    const found = node.children && findNavigationNode(node.children, key);
    if (found) return found;
  }
  return undefined;
}

function insertNavigationNode(
  nodes: NavigationNode[],
  targetKey: string,
  newNode: NavigationNode,
  relation: "sibling" | "child",
): { nodes: NavigationNode[]; inserted: boolean } {
  if (relation === "sibling") {
    const targetIndex = nodes.findIndex((node) => node.key === targetKey);
    if (targetIndex >= 0) {
      return {
        nodes: [...nodes.slice(0, targetIndex + 1), newNode, ...nodes.slice(targetIndex + 1)],
        inserted: true,
      };
    }
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (relation === "child" && node.key === targetKey) {
      const nextNode = { ...node, children: [...(node.children || []), newNode] };
      return { nodes: nodes.map((item, itemIndex) => itemIndex === index ? nextNode : item), inserted: true };
    }
    if (node.children) {
      const result = insertNavigationNode(node.children, targetKey, newNode, relation);
      if (result.inserted) {
        const nextNode = { ...node, children: result.nodes };
        return { nodes: nodes.map((item, itemIndex) => itemIndex === index ? nextNode : item), inserted: true };
      }
    }
  }

  return { nodes, inserted: false };
}

function updateNavigationNodeTitle(nodes: NavigationNode[], targetKey: string, title: string): NavigationNode[] {
  return nodes.map((node) => {
    if (node.key === targetKey) return { ...node, title };
    return node.children ? { ...node, children: updateNavigationNodeTitle(node.children, targetKey, title) } : node;
  });
}

function removeNavigationNode(
  nodes: NavigationNode[],
  targetKey: string,
  totalFormCount = countFormNavigationNodes(nodes),
): { nodes: NavigationNode[]; removed: boolean } {
  const targetIndex = nodes.findIndex((node) => node.key === targetKey);
  if (targetIndex >= 0) {
    const targetNode = nodes[targetIndex];
    const remainingNodes = [...nodes.slice(0, targetIndex), ...nodes.slice(targetIndex + 1)];
    if (totalFormCount - countFormNavigationNodes([targetNode]) > 0) {
      return { nodes: remainingNodes, removed: true };
    }

    const lastForm = findFirstFormNavigationNode(targetNode.children || []);
    return {
      nodes: lastForm
        ? [...nodes.slice(0, targetIndex), lastForm, ...nodes.slice(targetIndex + 1)]
        : remainingNodes,
      removed: true,
    };
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node.children) continue;
    const result = removeNavigationNode(node.children, targetKey, totalFormCount);
    if (result.removed) {
      const nextNode = { ...node, children: result.nodes };
      return { nodes: nodes.map((item, itemIndex) => itemIndex === index ? nextNode : item), removed: true };
    }
  }

  return { nodes, removed: false };
}

const permissionTitle = (icon: ReactNode | null, label: string) => (
  <div className="permission-tree-title">
    {icon && <span className="permission-tree-title-icon">{icon}</span>}
    <OverflowTooltip title={label} className="permission-tree-title-label">{label}</OverflowTooltip>
  </div>
);

function navigationToPermissionTree(nodes: NavigationNode[]): DataNode[] {
  return nodes.map((node) => ({
    title: permissionTitle(node.kind === "table" ? node.icon : null, node.title),
    key: node.key,
    children: node.children ? navigationToPermissionTree(node.children) : undefined,
  }));
}

function navigationToSortTree(nodes: NavigationNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: (
      <span className="sort-menu-title">
        <span className="sort-menu-title-main">
          {node.kind === "table" && <span className="sort-menu-form-icon">{node.icon}</span>}
          <OverflowTooltip title={node.title} className="sort-menu-title-label">{node.title}</OverflowTooltip>
        </span>
        <span className="sort-menu-drag-handle" aria-label={`拖拽排序${node.title}`}><DragOutlined size={18} /></span>
      </span>
    ),
    children: node.children ? navigationToSortTree(node.children) : undefined,
  }));
}

function detachNavigationNode(nodes: NavigationNode[], targetKey: string): { nodes: NavigationNode[]; detached?: NavigationNode } {
  const targetIndex = nodes.findIndex((node) => node.key === targetKey);
  if (targetIndex >= 0) {
    return { nodes: [...nodes.slice(0, targetIndex), ...nodes.slice(targetIndex + 1)], detached: nodes[targetIndex] };
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node.children) continue;
    const result = detachNavigationNode(node.children, targetKey);
    if (result.detached) {
      return {
        nodes: nodes.map((item, itemIndex) => itemIndex === index ? { ...node, children: result.nodes } : item),
        detached: result.detached,
      };
    }
  }

  return { nodes };
}

function insertNavigationNodeAt(
  nodes: NavigationNode[],
  targetKey: string,
  newNode: NavigationNode,
  position: "before" | "after" | "inside",
): { nodes: NavigationNode[]; inserted: boolean } {
  const targetIndex = nodes.findIndex((node) => node.key === targetKey);
  if (targetIndex >= 0) {
    if (position === "inside") {
      const target = nodes[targetIndex];
      return {
        nodes: nodes.map((node, index) => index === targetIndex ? { ...node, children: [...(target.children || []), newNode] } : node),
        inserted: true,
      };
    }
    const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
    return { nodes: [...nodes.slice(0, insertIndex), newNode, ...nodes.slice(insertIndex)], inserted: true };
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node.children) continue;
    const result = insertNavigationNodeAt(node.children, targetKey, newNode, position);
    if (result.inserted) {
      return { nodes: nodes.map((item, itemIndex) => itemIndex === index ? { ...node, children: result.nodes } : item), inserted: true };
    }
  }

  return { nodes, inserted: false };
}

function moveNavigationNode(nodes: NavigationNode[], dragKey: string, dropKey: string, position: "before" | "after" | "inside"): NavigationNode[] {
  if (dragKey === dropKey) return nodes;
  const dragged = findNavigationNode(nodes, dragKey);
  if (!dragged || (position === "inside" && findNavigationNode(dragged.children || [], dropKey))) return nodes;
  const detached = detachNavigationNode(nodes, dragKey);
  if (!detached.detached) return nodes;
  const result = insertNavigationNodeAt(detached.nodes, dropKey, detached.detached, position);
  return result.inserted ? result.nodes : nodes;
}

const permissionRoles: PermissionRoleOption[] = [
  { key: "admin", label: "管理员" },
  { key: "hr", label: "人事处" },
  { key: "academic", label: "教务处" },
];

const permissionRoleCatalog = [
  {
    label: "系统管理",
    roles: [
      { key: "admin", label: "管理员" },
      { key: "auditor", label: "审计员" },
    ],
  },
  {
    label: "行政",
    roles: [
      { key: "office", label: "校办" },
      { key: "hr", label: "人事处" },
      { key: "finance", label: "财务处" },
      { key: "general-office", label: "办公室" },
    ],
  },
  {
    label: "教学",
    roles: [{ key: "academic", label: "教务处" }],
  },
];

const initialPermissionCheckedKeys: React.Key[] = ["level-2", "level-2-1", "level-2-1-1", "level-2-1-1-1"];

const tableRows = [
  { key: 1, singleInput: "校领导信息", linkedDefault: "校领导信息", formulaDefault: "0", multiInput: "负责学校整体管理", numberInput: "12", slider: "80", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "管理,教学", linkedDropdown: "组织人员", dropdownCheckbox: "校级,公开" },
  { key: 2, singleInput: "管理人员信息", linkedDefault: "管理人员信息", formulaDefault: "0", multiInput: "承担行政管理工作", numberInput: "36", slider: "75", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "管理,服务", linkedDropdown: "教职工", dropdownCheckbox: "院级,公开" },
  { key: 3, singleInput: "教师基本信息", linkedDefault: "教师基本信息", formulaDefault: "1.234", multiInput: "承担教学科研任务", numberInput: "428", slider: "92", rating: 5, auditStatus: "待审核", singleChoice: "非常满意", multipleChoice: "教学,科研", linkedDropdown: "教职工", dropdownCheckbox: "校级,内部" },
  { key: 4, singleInput: "学生基本信息", linkedDefault: "学生基本信息", formulaDefault: "58.234", multiInput: "记录学生在校信息", numberInput: "12680", slider: "88", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "学籍,培养", linkedDropdown: "学生", dropdownCheckbox: "院级,内部" },
  { key: 5, singleInput: "学校名称", linkedDefault: "学校名称", formulaDefault: "2.500", multiInput: "维护学校基础信息", numberInput: "1", slider: "100", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "基础,公开", linkedDropdown: "学校", dropdownCheckbox: "校级,公开" },
  { key: 6, singleInput: "校区信息", linkedDefault: "校区信息", formulaDefault: "3.125", multiInput: "维护校区和地址信息", numberInput: "4", slider: "95", rating: 4, auditStatus: "待审核", singleChoice: "满意", multipleChoice: "基础,地址", linkedDropdown: "学校", dropdownCheckbox: "校级,公开" },
  { key: 7, singleInput: "教育类型", linkedDefault: "教育类型", formulaDefault: "4.600", multiInput: "记录培养层次和类型", numberInput: "8", slider: "86", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "培养,类型", linkedDropdown: "教学", dropdownCheckbox: "校级,内部" },
  { key: 8, singleInput: "学科信息", linkedDefault: "学科信息", formulaDefault: "5.750", multiInput: "维护学科专业目录", numberInput: "62", slider: "78", rating: 3, auditStatus: "已通过", singleChoice: "一般", multipleChoice: "学科,专业", linkedDropdown: "教学", dropdownCheckbox: "院级,公开" },
  { key: 9, singleInput: "课程信息", linkedDefault: "课程信息", formulaDefault: "6.280", multiInput: "记录课程开设情况", numberInput: "1320", slider: "90", rating: 5, auditStatus: "待审核", singleChoice: "非常满意", multipleChoice: "课程,教学", linkedDropdown: "教学", dropdownCheckbox: "校级,内部" },
  { key: 10, singleInput: "科研项目信息", linkedDefault: "科研项目信息", formulaDefault: "7.410", multiInput: "记录科研项目执行情况", numberInput: "286", slider: "83", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "科研,项目", linkedDropdown: "科研", dropdownCheckbox: "校级,公开" },
  { key: 11, singleInput: "教室信息", linkedDefault: "教室信息", formulaDefault: "8.125", multiInput: "维护教室和场地资源", numberInput: "356", slider: "88", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "教室,场地", linkedDropdown: "办学条件", dropdownCheckbox: "校级,公开" },
  { key: 12, singleInput: "专业信息", linkedDefault: "专业信息", formulaDefault: "9.300", multiInput: "维护专业目录和培养方案", numberInput: "86", slider: "82", rating: 5, auditStatus: "待审核", singleChoice: "非常满意", multipleChoice: "专业,培养", linkedDropdown: "学科专业", dropdownCheckbox: "院级,内部" },
  { key: 13, singleInput: "奖助学金信息", linkedDefault: "奖助学金信息", formulaDefault: "10.660", multiInput: "记录学生奖助学金发放", numberInput: "4280", slider: "76", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "奖学金,助学金", linkedDropdown: "学生", dropdownCheckbox: "校级,内部" },
  { key: 14, singleInput: "科研成果信息", linkedDefault: "科研成果信息", formulaDefault: "11.520", multiInput: "汇总论文和科研成果", numberInput: "1920", slider: "91", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "论文,成果", linkedDropdown: "科研", dropdownCheckbox: "校级,公开" },
  { key: 15, singleInput: "资产设备信息", linkedDefault: "资产设备信息", formulaDefault: "12.875", multiInput: "维护学校资产和设备", numberInput: "5840", slider: "69", rating: 3, auditStatus: "待审核", singleChoice: "一般", multipleChoice: "资产,设备", linkedDropdown: "办学条件", dropdownCheckbox: "校级,内部" },
  { key: 16, singleInput: "图书资料信息", linkedDefault: "图书资料信息", formulaDefault: "13.240", multiInput: "维护图书和电子资源", numberInput: "126000", slider: "87", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "图书,资源", linkedDropdown: "办学条件", dropdownCheckbox: "校级,公开" },
  { key: 17, singleInput: "宿舍信息", linkedDefault: "宿舍信息", formulaDefault: "14.180", multiInput: "维护学生宿舍基础资料", numberInput: "8420", slider: "79", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "宿舍,住宿", linkedDropdown: "学生", dropdownCheckbox: "校级,内部" },
  { key: 18, singleInput: "招生计划信息", linkedDefault: "招生计划信息", formulaDefault: "15.630", multiInput: "记录年度招生计划", numberInput: "8600", slider: "84", rating: 5, auditStatus: "待审核", singleChoice: "非常满意", multipleChoice: "招生,计划", linkedDropdown: "学生", dropdownCheckbox: "校级,公开" },
  { key: 19, singleInput: "毕业生信息", linkedDefault: "毕业生信息", formulaDefault: "16.750", multiInput: "维护毕业生去向信息", numberInput: "7350", slider: "81", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "毕业,就业", linkedDropdown: "学生", dropdownCheckbox: "校级,内部" },
  { key: 20, singleInput: "教职工培训信息", linkedDefault: "教职工培训信息", formulaDefault: "17.420", multiInput: "记录教职工培训经历", numberInput: "2160", slider: "73", rating: 3, auditStatus: "待审核", singleChoice: "一般", multipleChoice: "培训,发展", linkedDropdown: "教职工", dropdownCheckbox: "院级,内部" },
  { key: 21, singleInput: "职称评审信息", linkedDefault: "职称评审信息", formulaDefault: "18.360", multiInput: "维护职称评审结果", numberInput: "980", slider: "89", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "职称,评审", linkedDropdown: "教职工", dropdownCheckbox: "校级,内部" },
  { key: 22, singleInput: "财务预算信息", linkedDefault: "财务预算信息", formulaDefault: "19.800", multiInput: "记录年度财务预算", numberInput: "460", slider: "77", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "财务,预算", linkedDropdown: "学校", dropdownCheckbox: "校级,内部" },
  { key: 23, singleInput: "合同信息", linkedDefault: "合同信息", formulaDefault: "20.125", multiInput: "维护业务合同和协议", numberInput: "3200", slider: "72", rating: 3, auditStatus: "待审核", singleChoice: "一般", multipleChoice: "合同,协议", linkedDropdown: "学校", dropdownCheckbox: "校级,内部" },
  { key: 24, singleInput: "会议室信息", linkedDefault: "会议室信息", formulaDefault: "21.560", multiInput: "维护会议室预约资源", numberInput: "128", slider: "86", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "会议,场地", linkedDropdown: "办学条件", dropdownCheckbox: "校级,公开" },
  { key: 25, singleInput: "校园卡信息", linkedDefault: "校园卡信息", formulaDefault: "22.440", multiInput: "记录校园卡账户状态", numberInput: "29400", slider: "90", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "校园卡,账户", linkedDropdown: "学生", dropdownCheckbox: "校级,内部" },
  { key: 26, singleInput: "科研经费信息", linkedDefault: "科研经费信息", formulaDefault: "23.710", multiInput: "维护科研经费执行情况", numberInput: "1240", slider: "80", rating: 4, auditStatus: "待审核", singleChoice: "满意", multipleChoice: "科研,经费", linkedDropdown: "科研", dropdownCheckbox: "校级,内部" },
  { key: 27, singleInput: "实验室信息", linkedDefault: "实验室信息", formulaDefault: "24.290", multiInput: "维护实验室和仪器资源", numberInput: "246", slider: "85", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "实验室,设备", linkedDropdown: "学科专业", dropdownCheckbox: "院级,公开" },
  { key: 28, singleInput: "校友信息", linkedDefault: "校友信息", formulaDefault: "25.680", multiInput: "记录校友基本联系信息", numberInput: "18600", slider: "74", rating: 4, auditStatus: "已通过", singleChoice: "满意", multipleChoice: "校友,联系", linkedDropdown: "学生", dropdownCheckbox: "校级,公开" },
  { key: 29, singleInput: "通知公告信息", linkedDefault: "通知公告信息", formulaDefault: "26.510", multiInput: "维护校园通知和公告", numberInput: "620", slider: "93", rating: 5, auditStatus: "已通过", singleChoice: "非常满意", multipleChoice: "通知,公告", linkedDropdown: "学校", dropdownCheckbox: "校级,公开" },
  { key: 30, singleInput: "数据字典信息", linkedDefault: "数据字典信息", formulaDefault: "27.330", multiInput: "维护平台基础数据字典", numberInput: "480", slider: "88", rating: 4, auditStatus: "待审核", singleChoice: "满意", multipleChoice: "字典,配置", linkedDropdown: "学校", dropdownCheckbox: "校级,内部" },
];

function DataTableWorkspace() {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLElement | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [query, setQuery] = useState("");
  const [linkedDefault, setLinkedDefault] = useState<string>();
  const [multiInput, setMultiInput] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [appliedQuery, setAppliedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [tableBodyHeight, setTableBodyHeight] = useState(320);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(50);
  const [tableScrollbar, setTableScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });

  useLayoutEffect(() => {
    const scrollContainer = tableScrollRef.current;
    if (!scrollContainer) return;

    const updateTableBodyHeight = () => {
      const header = scrollContainer.querySelector<HTMLElement>(".ant-table-thead");
      const headerHeight = header?.getBoundingClientRect().height || 50;
      setTableHeaderHeight(headerHeight);
      setTableBodyHeight(Math.max(120, Math.floor(scrollContainer.clientHeight - headerHeight)));
    };

    updateTableBodyHeight();
    const resizeObserver = new ResizeObserver(updateTableBodyHeight);
    resizeObserver.observe(scrollContainer);
    return () => resizeObserver.disconnect();
  }, []);

  useLayoutEffect(() => {
    const scrollContainer = tableScrollRef.current;
    const body = scrollContainer?.querySelector<HTMLElement>(".ant-table-body");
    if (!body) return;
    tableBodyRef.current = body;

    const updateTableScrollbar = () => {
      const trackHeight = Math.max(0, body.clientHeight - 8);
      const scrollableHeight = body.scrollHeight - body.clientHeight;
      if (trackHeight <= 0 || scrollableHeight <= 1) {
        setTableScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max(24, trackHeight * body.clientHeight / body.scrollHeight);
      const maxThumbOffset = trackHeight - thumbHeight;
      setTableScrollbar({
        trackHeight,
        thumbHeight,
        thumbOffset: maxThumbOffset * body.scrollTop / scrollableHeight,
      });
    };

    body.addEventListener("scroll", updateTableScrollbar, { passive: true });
    updateTableScrollbar();
    return () => {
      body.removeEventListener("scroll", updateTableScrollbar);
      if (tableBodyRef.current === body) tableBodyRef.current = null;
    };
  }, [currentPage, pageSize, tableBodyHeight, appliedQuery, linkedDefault, multiInput, ratingFilter, status]);

  const handleTableScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const body = tableBodyRef.current;
    const maxThumbOffset = tableScrollbar.trackHeight - tableScrollbar.thumbHeight;
    const scrollableHeight = body ? body.scrollHeight - body.clientHeight : 0;
    if (!body || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = body.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      body.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const filteredRows = tableRows.filter((row) => {
    const matchesQuery = !appliedQuery || row.singleInput.includes(appliedQuery);
    const matchesLinkedDefault = !linkedDefault || row.linkedDefault === linkedDefault;
    const matchesMultiInput = !multiInput || row.multiInput.includes(multiInput);
    const matchesRating = !ratingFilter || String(row.rating) === ratingFilter;
    const matchesStatus = !status || row.auditStatus === status;
    return matchesQuery && matchesLinkedDefault && matchesMultiInput && matchesRating && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedQuery, linkedDefault, multiInput, ratingFilter, status]);

  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { title: "单行输入", dataIndex: "singleInput", key: "singleInput", ellipsis: true, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "默认值-数据联动", dataIndex: "linkedDefault", key: "linkedDefault", ellipsis: true, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "多行输入", dataIndex: "multiInput", key: "multiInput", ellipsis: true, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "评分", dataIndex: "rating", key: "rating", render: (value: number) => <Rate disabled value={value} count={5} /> },
    { title: "审核状态", dataIndex: "auditStatus", key: "auditStatus", ellipsis: true, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    {
      title: "操作",
      key: "action",
      render: () => <Space className="prototype-action-buttons" size={16}><Button className="prototype-action-button" type="link" size="small">查看</Button><Button className="prototype-action-button" type="link" size="small">编辑</Button><Button className="prototype-action-button" type="link" size="small">删除</Button></Space>,
    },
  ];

  const hasSelection = selectedRowKeys.length > 0;

  return (
    <div className="prototype-table-workspace">
      <div className="prototype-table-filterbar">
        <Space size={14} wrap>
          <label className="prototype-filter-item"><span>单行输入</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="请输入" /></label>
          <label className="prototype-filter-item"><span>默认值-数据联动</span><Select allowClear value={linkedDefault} onChange={setLinkedDefault} suffixIcon={<DownOutlined size={16} />} placeholder="请选择" options={Array.from(new Set(tableRows.map((row) => row.linkedDefault))).map((value) => ({ value, label: value }))} /></label>
          <label className="prototype-filter-item"><span>多行输入</span><Input value={multiInput} onChange={(event) => setMultiInput(event.target.value)} placeholder="请输入" /></label>
          <label className="prototype-filter-item"><span>评分</span><Select allowClear value={ratingFilter} onChange={setRatingFilter} suffixIcon={<DownOutlined size={16} />} placeholder="请选择" options={[{ value: "5", label: "5 分" }, { value: "4", label: "4 分" }, { value: "3", label: "3 分" }]} /></label>
          <label className="prototype-filter-item"><span>审核状态</span><Select allowClear value={status} onChange={setStatus} suffixIcon={<DownOutlined size={16} />} placeholder="请选择" options={[{ value: "已通过", label: "已通过" }, { value: "待审核", label: "待审核" }]} /></label>
          <Button type="primary" icon={<SearchOutlined size={16} />} onClick={() => setAppliedQuery(query)}>查询</Button>
        </Space>
      </div>
      <div className="prototype-table-toolbar">
        <Space size={8} wrap>
          <Button type="primary" icon={<PlusOutlined />}>添加</Button>
          <Button icon={<UploadOutlined />}>导入</Button>
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<DeleteOutlined />} disabled={!hasSelection}>删除</Button>
          <Button icon={<CopyOutlined />} disabled={!hasSelection}>复制</Button>
          <Button icon={<EditOutlined />} disabled={!hasSelection}>批量编辑</Button>
          <Button icon={<CheckOutlined />} disabled={!hasSelection}>通过</Button>
          <Button icon={<CloseOutlined />} disabled={!hasSelection}>不通过</Button>
        </Space>
      </div>
      <div className="prototype-table-container">
        <div ref={tableScrollRef} className="prototype-table-scroll">
          <Table
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, columnWidth: 52 }}
            columns={columns}
            dataSource={pagedRows}
            pagination={false}
            scroll={{ y: tableBodyHeight }}
            tableLayout="fixed"
          />
          {tableScrollbar.thumbHeight > 0 && (
            <div
              className="prototype-floating-scrollbar"
              style={{ top: tableHeaderHeight + 4, height: tableScrollbar.trackHeight }}
              aria-hidden="true"
            >
              <div
                className="prototype-floating-scrollbar-thumb"
                style={{ height: tableScrollbar.thumbHeight, transform: `translateY(${tableScrollbar.thumbOffset}px)` }}
                onPointerDown={handleTableScrollbarPointerDown}
              />
            </div>
          )}
        </div>
        <div className="prototype-table-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredRows.length}
            pageSizeOptions={[5, 10, 20]}
            showSizeChanger={{ suffixIcon: <DownOutlined size={16} /> }}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(page);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function BaseDataAdminPage({ frontend = false }: { frontend?: boolean } = {}) {
  const [mode, setMode] = useState<"empty" | "ready">("ready");
  const [navigationNodes, setNavigationNodes] = useState<NavigationNode[]>(navigationData);
  const [selectedNavKey, setSelectedNavKey] = useState("level-2-1-1-1");
  const [openNavKeys, setOpenNavKeys] = useState<string[]>(defaultOpenNavigationKeys);
  const [navigationModalOpen, setNavigationModalOpen] = useState(false);
  const [navigationModalType, setNavigationModalType] = useState<"sibling" | "child">("sibling");
  const [navigationName, setNavigationName] = useState("新建基础数据表");
  const [navigationEditOpen, setNavigationEditOpen] = useState(false);
  const [navigationEditKey, setNavigationEditKey] = useState("");
  const [navigationEditName, setNavigationEditName] = useState("");
  const [navigationDeleteOpen, setNavigationDeleteOpen] = useState(false);
  const [navigationDeleteKey, setNavigationDeleteKey] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortNodes, setSortNodes] = useState<NavigationNode[]>([]);
  const [sortExpandedKeys, setSortExpandedKeys] = useState<string[]>([]);
  const sortListRef = useRef<HTMLDivElement>(null);
  const [sortListScrollbar, setSortListScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionRoleItems, setPermissionRoleItems] = useState<PermissionRoleGroup[]>(() => permissionRoles.map((role) => ({ ...role, roleKeys: [role.key] })));
  const [permissionCheckedKeys, setPermissionCheckedKeys] = useState<Record<string, React.Key[]>>(() =>
    Object.fromEntries(permissionRoles.map(({ key }) => [key, initialPermissionCheckedKeys])),
  );
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [roleKeyword, setRoleKeyword] = useState("");
  const [selectedRoleKeys, setSelectedRoleKeys] = useState<string[]>([]);
  const permissionListRef = useRef<HTMLDivElement>(null);
  const roleListRef = useRef<HTMLDivElement>(null);
  const [permissionListScrollbar, setPermissionListScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [roleListScrollbar, setRoleListScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [enabled, setEnabled] = useState(false);
  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [tableDeleted, setTableDeleted] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [deleteFormName, setDeleteFormName] = useState("");
  const [deleteFormNameError, setDeleteFormNameError] = useState(false);
  const currentTableTitle = findNavigationNode(navigationNodes, selectedNavKey)?.title || "校领导信息";
  const permissionTreeData = navigationToPermissionTree(navigationNodes);
  const navigationDeleteNode = findNavigationNode(navigationNodes, navigationDeleteKey);
  const addedRoleKeys = new Set(permissionRoleItems.flatMap((role) => role.roleKeys));
  const filteredRoleCatalog = permissionRoleCatalog
    .map((group) => ({
      ...group,
      roles: group.roles.filter((role) => !roleKeyword.trim() || group.label.includes(roleKeyword.trim()) || role.label.includes(roleKeyword.trim())),
    }))
    .filter((group) => group.roles.length > 0);
  const resetRoleSelection = () => {
    setRoleSelectOpen(false);
    setRoleKeyword("");
    setSelectedRoleKeys([]);
  };
  const handleAddRoles = () => {
    const selectedRoles = permissionRoleCatalog.flatMap((group) => group.roles).filter((role) => selectedRoleKeys.includes(role.key));
    if (selectedRoles.length === 0) return;
    const roleGroupKey = `roles-${selectedRoles.map((role) => role.key).join("-")}-${Date.now()}`;
    setPermissionRoleItems((current) => [...current, {
      key: roleGroupKey,
      label: selectedRoles.map((role) => role.label).join("，"),
      roleKeys: selectedRoles.map((role) => role.key),
    }]);
    setPermissionCheckedKeys((current) => ({ ...current, [roleGroupKey]: initialPermissionCheckedKeys }));
    resetRoleSelection();
  };
  useLayoutEffect(() => {
    if (!permissionOpen) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let activeList: HTMLDivElement | null = null;
    let updateScrollbar: (() => void) | null = null;
    const setupPermissionListScrollbar = () => {
      const list = permissionListRef.current;
      if (!list) {
        frameId = window.requestAnimationFrame(setupPermissionListScrollbar);
        return;
      }

      const updatePermissionListScrollbar = () => {
        const trackHeight = Math.max(0, list.clientHeight - 8);
        const scrollableHeight = list.scrollHeight - list.clientHeight;
        if (trackHeight <= 0 || scrollableHeight <= 0) {
          setPermissionListScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * list.clientHeight / list.scrollHeight);
        const maxThumbOffset = trackHeight - thumbHeight;
        setPermissionListScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * list.scrollTop / scrollableHeight,
        });
      };

      activeList = list;
      updateScrollbar = updatePermissionListScrollbar;
      list.addEventListener("scroll", updatePermissionListScrollbar, { passive: true });
      updatePermissionListScrollbar();
      resizeObserver = new ResizeObserver(updatePermissionListScrollbar);
      resizeObserver.observe(list);
      if (list.firstElementChild) resizeObserver.observe(list.firstElementChild);
    };

    frameId = window.requestAnimationFrame(setupPermissionListScrollbar);
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (activeList && updateScrollbar) activeList.removeEventListener("scroll", updateScrollbar);
    };
  }, [permissionOpen, permissionRoleItems.length]);

  const handlePermissionListScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const list = permissionListRef.current;
    const maxThumbOffset = permissionListScrollbar.trackHeight - permissionListScrollbar.thumbHeight;
    const scrollableHeight = list ? list.scrollHeight - list.clientHeight : 0;
    if (!list || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = list.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      list.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };
  useLayoutEffect(() => {
    if (!roleSelectOpen) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let activeList: HTMLDivElement | null = null;
    let updateScrollbar: (() => void) | null = null;
    const setupRoleListScrollbar = () => {
      const list = roleListRef.current;
      if (!list) {
        frameId = window.requestAnimationFrame(setupRoleListScrollbar);
        return;
      }

      const updateRoleListScrollbar = () => {
        const trackHeight = Math.max(0, list.clientHeight - 8);
        const scrollableHeight = list.scrollHeight - list.clientHeight;
        if (trackHeight <= 0 || scrollableHeight <= 0) {
          setRoleListScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * list.clientHeight / list.scrollHeight);
        const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);
        const scrollRatio = Math.min(1, Math.max(0, list.scrollTop / scrollableHeight));
        setRoleListScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * scrollRatio,
        });
      };

      activeList = list;
      updateScrollbar = updateRoleListScrollbar;
      list.addEventListener("scroll", updateRoleListScrollbar, { passive: true });
      updateRoleListScrollbar();
      resizeObserver = new ResizeObserver(updateRoleListScrollbar);
      resizeObserver.observe(list);
      if (list.firstElementChild) resizeObserver.observe(list.firstElementChild);
    };

    frameId = window.requestAnimationFrame(setupRoleListScrollbar);
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (activeList && updateScrollbar) activeList.removeEventListener("scroll", updateScrollbar);
    };
  }, [roleSelectOpen, roleKeyword, filteredRoleCatalog.length]);

  const handleRoleListScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const list = roleListRef.current;
    const maxThumbOffset = roleListScrollbar.trackHeight - roleListScrollbar.thumbHeight;
    const scrollableHeight = list ? list.scrollHeight - list.clientHeight : 0;
    if (!list || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = list.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      list.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };
  const handleCreateBaseTable = () => {
    setTableDeleted(false);
    setMode("ready");
  };
  const openDeleteForm = () => {
    setDeleteFormName("");
    setDeleteFormNameError(false);
    setDeleteFormOpen(true);
  };
  const handleDeleteForm = () => {
    if (deleteFormName.trim() !== currentTableTitle) {
      setDeleteFormNameError(true);
      return;
    }
    setTableDeleted(true);
    setEnabled(false);
    setEnableModalOpen(false);
    setDisableModalOpen(false);
    setDeleteFormOpen(false);
    setDeleteFormName("");
    setDeleteFormNameError(false);
    message.success("表单已删除");
  };
  const openNavigationModal = (type: "sibling" | "child") => {
    setNavigationModalType(type);
    setNavigationName("新建基础数据表");
    setNavigationModalOpen(true);
  };
  const openSortModal = () => {
    setSortNodes(navigationNodes);
    setSortExpandedKeys(getExpandableNavigationKeys(navigationNodes));
    setSortOpen(true);
  };
  const handleSortDrop = (info: Parameters<NonNullable<React.ComponentProps<typeof Tree>["onDrop"]>>[0]) => {
    const dragKey = String(info.dragNode.key);
    const dropKey = String(info.node.key);
    const position = info.dropToGap ? (info.dropPosition < 0 ? "before" : "after") : "inside";
    setSortNodes((current) => moveNavigationNode(current, dragKey, dropKey, position));
  };
  const handleSortConfirm = () => {
    setNavigationNodes(sortNodes);
    setOpenNavKeys((current) => current.filter((key) => findNavigationNode(sortNodes, key)));
    setSortOpen(false);
  };
  useLayoutEffect(() => {
    if (!sortOpen) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    const setupSortListScrollbar = () => {
      const list = sortListRef.current;
      if (!list) {
        frameId = window.requestAnimationFrame(setupSortListScrollbar);
        return;
      }

      const updateSortListScrollbar = () => {
        const trackHeight = Math.max(0, list.clientHeight - 8);
        const scrollableHeight = Math.max(0, list.scrollHeight - list.clientHeight);
        if (trackHeight <= 0 || scrollableHeight <= 0) {
          setSortListScrollbar({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * list.clientHeight / list.scrollHeight);
        const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);
        setSortListScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * (list.scrollTop / scrollableHeight),
        });
      };

      list.addEventListener("scroll", updateSortListScrollbar, { passive: true });
      updateSortListScrollbar();
      resizeObserver = new ResizeObserver(updateSortListScrollbar);
      resizeObserver.observe(list);
      if (list.firstElementChild) resizeObserver.observe(list.firstElementChild);

      return () => {
        list.removeEventListener("scroll", updateSortListScrollbar);
        resizeObserver?.disconnect();
      };
    };

    const cleanup = setupSortListScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [sortOpen, sortNodes, sortExpandedKeys]);

  const handleSortListScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const list = sortListRef.current;
    const maxThumbOffset = sortListScrollbar.trackHeight - sortListScrollbar.thumbHeight;
    const scrollableHeight = list ? list.scrollHeight - list.clientHeight : 0;
    if (!list || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = list.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      list.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };
  const handleAddNavigationNode = () => {
    const title = navigationName.trim() || "新建基础数据表";
    const newNode: NavigationNode = {
      key: `custom-${Date.now()}`,
      title,
      kind: "table",
      icon: <NotesOutlined />,
    };
    setNavigationNodes((current) => {
      const result = insertNavigationNode(current, selectedNavKey, newNode, navigationModalType);
      if (!result.inserted) return current;
      return result.nodes;
    });
    if (navigationModalType === "child") {
      setOpenNavKeys((current) => Array.from(new Set([...current, selectedNavKey])));
    }
    setSelectedNavKey(newNode.key);
    setNavigationName("新建基础数据表");
    setNavigationModalOpen(false);
  };
  const openNavigationEdit = (node: NavigationNode) => {
    setNavigationEditKey(node.key);
    setNavigationEditName(node.title);
    setNavigationEditOpen(true);
  };
  const handleSaveNavigationEdit = () => {
    const title = navigationEditName.trim();
    if (!title) return;
    setNavigationNodes((current) => updateNavigationNodeTitle(current, navigationEditKey, title));
    setNavigationEditOpen(false);
  };
  const openNavigationDelete = (node: NavigationNode) => {
    if (node.kind === "table" && countFormNavigationNodes(navigationNodes) <= 1) return;
    setNavigationDeleteKey(node.key);
    setNavigationDeleteOpen(true);
  };
  const handleConfirmNavigationDelete = () => {
    const result = removeNavigationNode(navigationNodes, navigationDeleteKey);
    if (!result.removed || countFormNavigationNodes(result.nodes) < 1) return;
    setNavigationNodes(result.nodes);
    if (!findNavigationNode(result.nodes, selectedNavKey)) {
      setSelectedNavKey(result.nodes[0]?.key || "");
    }
    setOpenNavKeys((current) => current.filter((key) => findNavigationNode(result.nodes, key)));
    setNavigationDeleteOpen(false);
  };
  return (
    <AppShell
      title="基础数据中心"
      hideSidebar
      sideItems={[
        { key: "admin", icon: <SettingOutlined />, label: "后台管理" },
        { key: "frontend", icon: <FolderOpenOutlined />, label: "前台数据" },
      ]}
      activeSideKey="admin"
      onSideChange={(key) => { if (key === "frontend") window.location.href = window.location.protocol === "file:" ? "基础数据中心前台.html" : "/base/frontend"; }}
    >
      <div className="split-layout">
        <Card
          className={`tree-card${frontend ? " frontend-tree-card" : ""}`}
          title="基础数据表"
          extra={!frontend && (
            <Space size={4}>
              <Tooltip title="添加同级">
                <span>
                  <Button
                    type="text"
                    icon={<AddItem size={16} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />}
                    aria-label="添加同级"
                    disabled={mode === "empty"}
                    onClick={() => openNavigationModal("sibling")}
                  />
                </span>
              </Tooltip>
              <Tooltip title="添加子级">
                <span>
                  <Button
                    type="text"
                    icon={<AddSubset size={16} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />}
                    aria-label="添加子级"
                    disabled={mode === "empty"}
                    onClick={() => openNavigationModal("child")}
                  />
                </span>
              </Tooltip>
              <Tooltip title="排序">
                <span>
                  <Button
                    type="text"
                    icon={<SortOutlined size={16} />}
                    aria-label="排序"
                    disabled={mode === "empty"}
                    onClick={openSortModal}
                  />
                </span>
              </Tooltip>
            </Space>
          )}
        >
          <BaseDataNavigationMenu
            nodes={mode === "empty" ? emptyNavigationData : navigationNodes}
            selectedKey={mode === "empty" ? "root" : selectedNavKey}
            openKeys={mode === "empty" ? [] : openNavKeys}
            onSelect={setSelectedNavKey}
            onOpenChange={setOpenNavKeys}
            onEdit={openNavigationEdit}
            onDelete={openNavigationDelete}
            showActions={!frontend}
          />
          {!frontend && <Button block icon={<PermissionSettingOutlined />} disabled={mode === "empty"} onClick={() => setPermissionOpen(true)}>权限设置</Button>}
        </Card>
        <Card className="workspace-card prototype-workspace-card" variant="borderless">
          {tableDeleted ? (
            <div className="empty-workspace">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<><Typography.Title level={4} className="empty-workspace-title">暂无基础表</Typography.Title><Typography.Paragraph type="secondary">请在左侧分类下创建基础表<br />创建后即可在此查看和管理数据</Typography.Paragraph></>}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBaseTable}>创建基础表</Button>
              </Empty>
            </div>
          ) : (
            <>
              <div className="workspace-heading prototype-workspace-heading">
                <div className="workspace-heading-title-wrap">
                  <Typography.Title level={3} className="workspace-heading-title">
                    <OverflowTooltip title={currentTableTitle} className="workspace-heading-title-text">
                      {currentTableTitle}
                    </OverflowTooltip>
                  </Typography.Title>
                </div>
                {!frontend && (
                  <Space className="workspace-actions" size={8}>
                    <Switch
                      className="api-switch"
                      checked={enabled}
                      aria-label="启用基础数据表"
                      onChange={(checked) => {
                        if (checked) {
                          setEnableModalOpen(true);
                        } else {
                          setDisableModalOpen(true);
                        }
                      }}
                    />
                    <Typography.Text className="api-switch-label">{enabled ? "启用中" : "未启用"}</Typography.Text>
                    <Divider type="vertical" className="workspace-action-divider" />
                    <Button type="text" icon={<EditOutlined size={16} />}>修改表单</Button>
                    <Button type="text" icon={<DeleteOutlined size={16} />} danger onClick={openDeleteForm}>删除表单</Button>
                  </Space>
                )}
              </div>
              <DataTableWorkspace />
            </>
          )}
        </Card>
      </div>
      <Modal
        open={enableModalOpen}
        width={560}
        centered
        className="enable-table-modal"
        title="启用基础数据表"
        closeIcon={modalCloseIcon}
        onCancel={() => setEnableModalOpen(false)}
        onOk={() => {
          setEnabled(true);
          setEnableModalOpen(false);
        }}
        okText="确认启用"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Space className="enable-table-modal-content" direction="vertical" size={24}>
          <Typography.Paragraph className="modal-title-hint enable-table-modal-intro">
            启用后，系统将自动为该表生成一套数据接口，用于对该表数据进行操作。该接口可对其他应用开放使用，方便外部系统读写本表数据
          </Typography.Paragraph>
          <div className="enable-api-list">
            <Typography.Text strong>将开放以下接口能力</Typography.Text>
            <div className="enable-api-items">
              <Flex align="center" gap={12}><Tag className="enable-api-tag enable-api-tag-get" color="success">GET</Tag><Typography.Text>查询数据</Typography.Text></Flex>
              <Flex align="center" gap={12}><Tag className="enable-api-tag enable-api-tag-add" color="processing">ADD</Tag><Typography.Text>新增数据</Typography.Text></Flex>
              <Flex align="center" gap={12}><Tag className="enable-api-tag enable-api-tag-update" color="warning">UPDATE</Tag><Typography.Text>修改数据</Typography.Text></Flex>
              <Flex align="center" gap={12}><Tag className="enable-api-tag enable-api-tag-delete" color="error">DELETE</Tag><Typography.Text>删除数据</Typography.Text></Flex>
            </div>
          </div>
          <Alert
            showIcon
            type="warning"
            description={<>启用后如不再需要对外提供服务，可随时<strong>停用</strong>本表；停用后接口将<strong>立即失效</strong>，其他应用<strong>无法调用</strong>。如需恢复，重新启用即可</>}
          />
        </Space>
      </Modal>
      <Modal
        open={disableModalOpen}
        width={560}
        centered
        className="enable-table-modal disable-table-modal"
        title="停用基础数据表"
        closeIcon={modalCloseIcon}
        onCancel={() => setDisableModalOpen(false)}
        onOk={() => {
          setEnabled(false);
          setDisableModalOpen(false);
        }}
        okText="确认停用"
        cancelText="取消"
        okButtonProps={{ danger: true, style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Space className="enable-table-modal-content" direction="vertical" size={24}>
          <Typography.Paragraph className="modal-title-hint enable-table-modal-intro">
            停用后，该表当前已生成的数据接口将<strong className="disable-table-emphasis">立即失效</strong>，其他应用调用将<strong className="disable-table-emphasis">无法请求成功</strong>
          </Typography.Paragraph>
          <Alert
            showIcon
            type="warning"
            description={<>确认要停用「{currentTableTitle}」吗？如后续需要再次开放，可以在本页面<strong>重新启用</strong></>}
          />
        </Space>
      </Modal>
      <Modal
        open={deleteFormOpen}
        width={480}
        centered
        className="destructive-confirm-modal"
        title="删除表单"
        closeIcon={modalCloseIcon}
        onCancel={() => {
          setDeleteFormOpen(false);
          setDeleteFormName("");
          setDeleteFormNameError(false);
        }}
        onOk={handleDeleteForm}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true, style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <div className="delete-form-confirm-content">
          <Typography.Paragraph className="modal-title-hint">
            删除后不可恢复，请输入表单名称「{currentTableTitle}」以确认删除
          </Typography.Paragraph>
          <Input
            autoFocus
            status={deleteFormNameError ? "error" : undefined}
            placeholder={`请输入表单名称：${currentTableTitle}`}
            value={deleteFormName}
            onChange={(event) => {
              setDeleteFormName(event.target.value);
              setDeleteFormNameError(false);
            }}
            onPressEnter={handleDeleteForm}
          />
          {deleteFormNameError && <Typography.Text type="danger">输入的表单名称与当前表单不一致</Typography.Text>}
        </div>
      </Modal>
      <Modal
        open={navigationModalOpen}
        width={480}
        centered
        title={navigationModalType === "sibling" ? "添加同级" : "添加子级"}
        closeIcon={modalCloseIcon}
        onCancel={() => setNavigationModalOpen(false)}
        onOk={handleAddNavigationNode}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>数据表名称</Typography.Text>
          <Input
            autoFocus
            value={navigationName}
            onChange={(event) => setNavigationName(event.target.value)}
            onPressEnter={handleAddNavigationNode}
          />
        </Space>
      </Modal>
      <Modal
        open={navigationEditOpen}
        width={480}
        centered
        title="编辑数据表"
        closeIcon={modalCloseIcon}
        onCancel={() => setNavigationEditOpen(false)}
        onOk={handleSaveNavigationEdit}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>名称</Typography.Text>
          <Input
            autoFocus
            value={navigationEditName}
            onChange={(event) => setNavigationEditName(event.target.value)}
            onPressEnter={handleSaveNavigationEdit}
          />
        </Space>
      </Modal>
      <Modal
        open={navigationDeleteOpen}
        width={480}
        centered
        className="destructive-confirm-modal"
        title="删除数据表"
        closeIcon={modalCloseIcon}
        onCancel={() => setNavigationDeleteOpen(false)}
        onOk={handleConfirmNavigationDelete}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true, style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Typography.Paragraph className="modal-title-hint">
          确认删除{navigationDeleteNode?.title || ""}吗，删除后不可恢复
        </Typography.Paragraph>
      </Modal>
      <Modal
        open={sortOpen}
        width={720}
        centered
        className="sort-modal"
        title="排序"
        closeIcon={modalCloseIcon}
        onCancel={() => setSortOpen(false)}
        onOk={handleSortConfirm}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <div className="sort-modal-content">
          <div className="sort-menu-list">
            <div className="sort-menu-header">
              <Typography.Text strong>菜单名称</Typography.Text>
              <span className="sort-menu-order-label">排序</span>
            </div>
            <div className="sort-menu-tree-viewport">
              <div ref={sortListRef} className="sort-menu-tree">
                <Tree
                  blockNode
                  draggable
                  expandedKeys={sortExpandedKeys}
                  onExpand={(keys) => setSortExpandedKeys(keys.map(String))}
                  treeData={navigationToSortTree(sortNodes)}
                  switcherIcon={(props) => props.isLeaf ? null : (props.expanded ? <UpOutlined size={14} /> : <DownOutlined size={14} />)}
                  onDrop={handleSortDrop}
                />
              </div>
              {sortListScrollbar.thumbHeight > 0 && (
                <div className="sort-menu-floating-scrollbar" aria-hidden="true">
                  <div
                    className="sort-menu-floating-scrollbar-thumb"
                    style={{ height: sortListScrollbar.thumbHeight, transform: `translateY(${sortListScrollbar.thumbOffset}px)` }}
                    onPointerDown={handleSortListScrollbarPointerDown}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={permissionOpen}
        width={720}
        centered
        className="permission-modal"
        title="权限设置"
        closeIcon={modalCloseIcon}
        onCancel={() => setPermissionOpen(false)}
        onOk={() => setPermissionOpen(false)}
        okText="保存设置"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <div className="permission-modal-content">
          <Typography.Text type="secondary" className="modal-title-hint permission-modal-intro">
            为角色配置前台左侧栏可见的分类和表单，权限变更后立即生效，前台用户刷新即可看到
          </Typography.Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRoleSelectOpen(true)}>添加角色</Button>
          <div className="permission-role-viewport">
            <div ref={permissionListRef} className="permission-role-list">
              {permissionRoleItems.length > 0 && (
                <Collapse
                  defaultActiveKey={["admin"]}
                  items={permissionRoleItems.map(({ key, label }) => ({
                    key,
                    label: <Typography.Text strong>{label}</Typography.Text>,
                    extra: (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`删除${label}角色`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPermissionRoleItems((current) => current.filter((role) => role.key !== key));
                          setPermissionCheckedKeys((current) => {
                            const next = { ...current };
                            delete next[key];
                            return next;
                          });
                        }}
                      />
                    ),
                    children: (
                      <Tree
                        checkable
                        blockNode
                        showLine
                        defaultExpandAll
                        switcherIcon={() => <span className="permission-tree-switcher-placeholder" aria-hidden="true" />}
                        treeData={permissionTreeData}
                        checkedKeys={permissionCheckedKeys[key] || []}
                        onCheck={(checkedKeys) => {
                          const nextCheckedKeys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
                          setPermissionCheckedKeys((current) => ({ ...current, [key]: nextCheckedKeys }));
                        }}
                      />
                    ),
                  }))}
                />
              )}
            </div>
            {permissionListScrollbar.thumbHeight > 0 && (
              <div
                className="permission-floating-scrollbar"
                style={{ top: 4, right: 4, height: permissionListScrollbar.trackHeight }}
                aria-hidden="true"
              >
                <div
                  className="permission-floating-scrollbar-thumb"
                  style={{ height: permissionListScrollbar.thumbHeight, transform: `translateY(${permissionListScrollbar.thumbOffset}px)` }}
                  onPointerDown={handlePermissionListScrollbarPointerDown}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        open={roleSelectOpen}
        width={560}
        centered
        className="role-select-modal"
        title="选择角色"
        closeIcon={modalCloseIcon}
        onCancel={resetRoleSelection}
        onOk={handleAddRoles}
        okText="确认添加"
        cancelText="取消"
        footer={(
          <div className="role-select-footer">
            <Typography.Text type="secondary">已选 {selectedRoleKeys.length} 个角色</Typography.Text>
            <Space size={8}>
              <Button style={{ width: 88 }} onClick={resetRoleSelection}>取消</Button>
              <Button type="primary" disabled={selectedRoleKeys.length === 0} style={{ width: 88 }} onClick={handleAddRoles}>确认添加</Button>
            </Space>
          </div>
        )}
      >
        <Space className="role-select-content" direction="vertical" size={16} style={{ width: "100%" }}>
          <Input
            value={roleKeyword}
            onChange={(event) => setRoleKeyword(event.target.value)}
            allowClear
            prefix={<SearchOutlined size={16} />}
            placeholder="搜索角色名称或部门..."
          />
          <div className="role-option-list-shell">
            <div className="role-option-list" ref={roleListRef}>
              {filteredRoleCatalog.map((group) => (
                <div className="role-option-group" key={group.label}>
                  <Typography.Text className="role-option-group-title" type="secondary">{group.label}</Typography.Text>
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    {group.roles.map((role) => {
                      const added = addedRoleKeys.has(role.key);
                      return (
                        <Flex className="role-option" key={role.key} align="center" justify="space-between" gap={12}>
                          <Checkbox
                            checked={selectedRoleKeys.includes(role.key)}
                            disabled={added}
                            onChange={(event) => {
                              setSelectedRoleKeys((current) => event.target.checked ? [...current, role.key] : current.filter((key) => key !== role.key));
                            }}
                          >
                            {role.label}
                          </Checkbox>
                          {added && <Tag className="role-option-added" bordered={false}>已添加</Tag>}
                        </Flex>
                      );
                    })}
                  </Space>
                </div>
              ))}
              {filteredRoleCatalog.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配角色" />}
            </div>
            {roleListScrollbar.thumbHeight > 0 && (
              <div
                className="role-floating-scrollbar"
                style={{ top: 4, right: 4, height: roleListScrollbar.trackHeight }}
                aria-hidden="true"
              >
                <div
                  className="role-floating-scrollbar-thumb"
                  style={{ height: roleListScrollbar.thumbHeight, transform: `translateY(${roleListScrollbar.thumbOffset}px)` }}
                  onPointerDown={handleRoleListScrollbarPointerDown}
                />
              </div>
            )}
          </div>
        </Space>
      </Modal>
    </AppShell>
  );
}
