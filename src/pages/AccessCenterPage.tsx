import { Button, Card, Checkbox, DatePicker, Descriptions, Empty, Flex, Form, Input, message, Modal, Pagination, Popconfirm, Radio, Select, Space, Tabs, Table, Tag, Tooltip, Typography } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AllApplication, ApiApp, Clear as ClearOutlined, Close as CloseOutlined, DataSheet, DatabaseTime, Delete as DeleteOutlined, Down as DownOutlined, Notes, Plus as PlusOutlined, Permissions, PreviewOpen, Search as SearchOutlined, Time, User, ViewList } from "@icon-park/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OverflowTooltip } from "../components/OverflowTooltip";
import { BaseDataNavigationMenu } from "../components/BaseDataNavigationMenu";
import type { BaseDataNavigationMenuNode } from "../components/BaseDataNavigationMenu";
import { baseDataNavigation, baseDataNavigationDefaultOpenKeys, getBaseDataNavigationTableNodes } from "../data/baseDataNavigation";
import { FixedCalendar } from "../components/FixedCalendar";
import { AppShell } from "../layouts/AppShell";

type AccessKey = "apps" | "authview" | "log-base" | "log-table" | "log-auth";

const accessKeys: AccessKey[] = ["apps", "authview", "log-base", "log-table", "log-auth"];

const menuItems = [
  { type: "group" as const, label: "应用管理", children: [{ key: "apps", icon: <ApiApp size={16} />, label: "注册与授权" }, { key: "authview", icon: <PreviewOpen size={16} />, label: "授权视图" }] },
  { type: "group" as const, label: "日志管理", children: [{ key: "log-base", icon: <DatabaseTime size={16} />, label: "基础数据日志" }, { key: "log-table", icon: <DataSheet size={16} />, label: "数据表日志" }, { key: "log-auth", icon: <Permissions size={16} />, label: "授权日志" }] },
];

type AuthorizationGrantType = "basedata" | "public" | "other";
type AuthorizationOperation = {
  action: "新增" | "删除" | "修改" | "查询";
  fields: string[];
  conditions: string[];
};
type AuthorizationViewRow = {
  key: string;
  app: string;
  type: AuthorizationGrantType;
  target: string;
  content: string[];
  updated: string;
  domain?: string;
  permissions?: AuthorizationOperation[];
};

const authorizationViewRows: AuthorizationViewRow[] = [
  { key: "schedule-space", app: "日程", type: "basedata", target: "空间资源表", content: ["新增", "删除", "修改", "查询"], updated: "2026-06-20 14:22", domain: "资源管理", permissions: [{ action: "新增", fields: ["名称", "类型", "状态"], conditions: [] }, { action: "删除", fields: [], conditions: ["部门ID 包含 当前用户部门及下级"] }, { action: "修改", fields: ["名称", "状态"], conditions: ["部门ID 包含 当前用户部门及下级"] }, { action: "查询", fields: ["名称", "类型", "状态", "创建时间"], conditions: ["部门ID 包含 当前用户部门及下级"] }] },
  { key: "schedule-user", app: "日程", type: "basedata", target: "用户信息表", content: ["查询"], updated: "2026-06-21 09:10", domain: "组织人员", permissions: [{ action: "查询", fields: ["工号", "姓名", "部门名称", "岗位"], conditions: ["部门ID 包含 当前用户部门及下级"] }] },
  { key: "schedule-department", app: "日程", type: "basedata", target: "组织部门表", content: ["查询"], updated: "2026-06-21 09:12", domain: "组织人员", permissions: [{ action: "查询", fields: ["部门编码", "部门名称", "负责人", "联系电话"], conditions: [] }] },
  { key: "schedule-notice", app: "日程", type: "public", target: "发送通知", content: ["邮件"], updated: "2026-06-20 10:00" },
  { key: "schedule-academic", app: "日程", type: "other", target: "教务系统", content: ["成绩查询", "课程列表"], updated: "2026-06-20 11:00" },
  { key: "schedule-library", app: "日程", type: "other", target: "图书馆", content: ["图书查询"], updated: "2026-06-19 16:20" },
  { key: "academic-space", app: "教务系统", type: "basedata", target: "空间资源表", content: ["新增", "修改", "查询"], updated: "2026-06-18 15:20", domain: "资源管理", permissions: [{ action: "新增", fields: ["名称", "类型"], conditions: [] }, { action: "修改", fields: ["名称", "类型"], conditions: ["院系 等于 当前用户部门"] }, { action: "查询", fields: ["名称", "类型", "状态"], conditions: ["院系 等于 当前用户部门"] }] },
  { key: "academic-course", app: "教务系统", type: "basedata", target: "课程信息表", content: ["新增", "删除", "修改", "查询"], updated: "2026-06-18 16:40", domain: "教学管理", permissions: [{ action: "新增", fields: ["课程名称", "课程编码", "学分"], conditions: [] }, { action: "删除", fields: [], conditions: ["院系 等于 当前用户部门"] }, { action: "修改", fields: ["课程名称", "学分"], conditions: ["院系 等于 当前用户部门"] }, { action: "查询", fields: ["课程名称", "课程编码", "学分", "任课教师"], conditions: [] }] },
  { key: "academic-score", app: "教务系统", type: "basedata", target: "成绩记录表", content: ["修改", "查询"], updated: "2026-06-19 10:05", domain: "教学管理", permissions: [{ action: "修改", fields: ["成绩"], conditions: ["院系 等于 当前用户部门"] }, { action: "查询", fields: ["学号", "课程名称", "成绩"], conditions: ["院系 等于 当前用户部门"] }] },
  { key: "academic-notice", app: "教务系统", type: "public", target: "发送通知", content: ["邮件", "短信"], updated: "2026-06-19 14:30" },
  { key: "library-space", app: "图书馆", type: "basedata", target: "空间资源表", content: ["查询"], updated: "2026-06-17 09:15", domain: "资源管理", permissions: [{ action: "查询", fields: ["名称", "类型", "状态"], conditions: [] }] },
  { key: "library-loan", app: "图书馆", type: "basedata", target: "图书借阅记录表", content: ["新增", "查询"], updated: "2026-06-17 11:30", domain: "图书管理", permissions: [{ action: "新增", fields: ["读者姓名", "书名", "借出日期"], conditions: [] }, { action: "查询", fields: ["读者姓名", "书名", "借出日期", "应还日期"], conditions: [] }] },
  { key: "library-notice", app: "图书馆", type: "public", target: "发送通知", content: ["站内信", "邮件"], updated: "2026-06-18 09:15" },
  { key: "campus-card-consumption", app: "校园卡", type: "basedata", target: "消费流水表", content: ["查询"], updated: "2026-06-16 08:55", domain: "一卡通", permissions: [{ action: "查询", fields: ["卡号", "消费金额", "消费时间", "消费地点"], conditions: ["消费时间 大于 近 30 天"] }] },
  { key: "campus-card-finance", app: "校园卡", type: "other", target: "财务缴费", content: ["缴费明细"], updated: "2026-06-17 09:45" },
  { key: "hr-user", app: "人事系统", type: "basedata", target: "用户信息表", content: ["新增", "删除", "修改", "查询"], updated: "2026-06-22 15:20", domain: "组织人员", permissions: [{ action: "新增", fields: ["工号", "姓名", "部门ID", "岗位"], conditions: [] }, { action: "删除", fields: [], conditions: ["部门ID 包含 当前用户部门及下级"] }, { action: "修改", fields: ["姓名", "部门ID", "岗位"], conditions: ["部门ID 包含 当前用户部门及下级"] }, { action: "查询", fields: ["工号", "姓名", "部门名称", "岗位", "手机号"], conditions: ["部门ID 包含 当前用户部门及下级", "状态 等于 正常"] }] },
  { key: "hr-position", app: "人事系统", type: "basedata", target: "岗位表", content: ["查询"], updated: "2026-06-22 15:24", domain: "组织人员", permissions: [{ action: "查询", fields: ["岗位编码", "岗位名称", "职级"], conditions: [] }] },
  { key: "finance-customer", app: "财务缴费", type: "basedata", target: "客户表", content: ["查询"], updated: "2026-06-15 14:00", domain: "客户主数据", permissions: [{ action: "查询", fields: ["客户编码", "客户名称", "客户等级", "负责人", "联系人"], conditions: ["负责人 等于 当前用户及下属"] }] },
  { key: "finance-payment", app: "财务缴费", type: "basedata", target: "缴费明细表", content: ["新增", "修改", "查询"], updated: "2026-06-15 14:06", domain: "财务", permissions: [{ action: "新增", fields: ["学号", "缴费项目", "金额"], conditions: [] }, { action: "修改", fields: ["缴费状态"], conditions: [] }, { action: "查询", fields: ["学号", "缴费项目", "金额", "缴费状态"], conditions: [] }] },
  { key: "finance-notice", app: "财务缴费", type: "public", target: "发送通知", content: ["短信"], updated: "2026-06-17 11:20" },
  { key: "finance-campus-card", app: "财务缴费", type: "other", target: "校园卡", content: ["消费流水查询"], updated: "2026-06-16 14:00" },
  { key: "assets-ledger", app: "资产设备", type: "basedata", target: "固定资产台账表", content: ["修改", "查询"], updated: "2026-06-14 10:30", domain: "供应链", permissions: [{ action: "修改", fields: ["存放地点", "使用人"], conditions: [] }, { action: "查询", fields: ["资产编码", "资产名称", "规格型号", "存放地点"], conditions: [] }] },
  { key: "dormitory-allocation", app: "宿舍管理", type: "basedata", target: "宿舍分配表", content: ["修改", "查询"], updated: "2026-06-13 16:12", domain: "后勤", permissions: [{ action: "修改", fields: ["床位号"], conditions: [] }, { action: "查询", fields: ["楼栋", "房间号", "床位号", "学生姓名"], conditions: [] }] },
  { key: "dormitory-notice", app: "宿舍管理", type: "public", target: "发送通知", content: ["企业微信", "钉钉"], updated: "2026-06-16 15:40" },
];

type LogResult = "成功" | "失败";
type BaseDataLogRecord = {
  key: string;
  time: string;
  user: string;
  action: "查询" | "新增" | "修改" | "删除";
  path: "接口" | "内部触发器" | "选择数据" | "数据联动" | "关联其他表单";
  target: string;
  detail: string;
  affectedCount: number;
  ip: string;
  result: LogResult;
  records: { id: string; name: string; logs: { time: string; action: string; user: string; detail: string }[] }[];
};
type DataTableLogRecord = {
  key: string;
  time: string;
  user: string;
  action: "新增字段" | "修改配置" | "删除字段" | "新增索引" | "删除索引";
  target: string;
  detail: string;
  ip: string;
  result: LogResult;
};
type AuthorizationLogRecord = {
  key: string;
  time: string;
  user: string;
  action: "应用注册" | "数据权限" | "公共服务" | "取消授权";
  app: string;
  target: string;
  detail: string;
  ip: string;
  result: LogResult;
};

const baseDataLogRows: BaseDataLogRecord[] = [
  { key: "base-01", time: "2026-06-24 09:12:33", user: "张伟", action: "查询", path: "接口", target: "用户信息表", detail: "查询列表，条件：部门=当前用户部门及下级", affectedCount: 18, ip: "10.12.33.45", result: "成功", records: [] },
  { key: "base-02", time: "2026-06-24 09:18:07", user: "李娜", action: "新增", path: "内部触发器", target: "用户信息表", detail: "新增记录 3 条", affectedCount: 3, ip: "10.12.33.71", result: "成功", records: [{ id: "100234", name: "张三（教务处 / 教师）", logs: [{ time: "2026-06-24 09:18:07", action: "新增", user: "李娜", detail: "新增用户“张三”" }, { time: "2026-06-24 11:02:14", action: "修改", user: "张伟", detail: "修改岗位：讲师 → 副教授" }] }, { id: "100235", name: "李四（财务处 / 会计）", logs: [{ time: "2026-06-24 09:18:07", action: "新增", user: "李娜", detail: "新增用户“李四”" }] }, { id: "100236", name: "王五（人事处 / 干事）", logs: [{ time: "2026-06-24 09:18:07", action: "新增", user: "李娜", detail: "新增用户“王五”" }] }] },
  { key: "base-03", time: "2026-06-24 09:24:42", user: "王强", action: "修改", path: "选择数据", target: "客户表", detail: "修改字段“客户等级”", affectedCount: 1, ip: "10.12.34.12", result: "成功", records: [{ id: "200011", name: "石家庄宏远科技有限公司", logs: [{ time: "2026-06-24 09:24:42", action: "修改", user: "王强", detail: "客户等级：A → B" }, { time: "2026-06-20 14:08:21", action: "新增", user: "王强", detail: "新增客户“石家庄宏远科技有限公司”" }] }] },
  { key: "base-04", time: "2026-06-24 09:31:19", user: "赵敏", action: "删除", path: "数据联动", target: "客户联系人表", detail: "删除记录 2 条", affectedCount: 2, ip: "10.12.34.28", result: "成功", records: [{ id: "200145", name: "联系人：刘经理", logs: [{ time: "2026-06-24 09:31:19", action: "删除", user: "赵敏", detail: "删除联系人“刘经理”" }] }, { id: "200146", name: "联系人：孙主管", logs: [{ time: "2026-06-24 09:31:19", action: "删除", user: "赵敏", detail: "删除联系人“孙主管”" }] }] },
  { key: "base-05", time: "2026-06-24 09:44:55", user: "陈杰", action: "新增", path: "关联其他表单", target: "供应商表", detail: "新增记录 1 条", affectedCount: 1, ip: "10.12.35.06", result: "成功", records: [{ id: "300102", name: "河北恒信电子有限公司", logs: [{ time: "2026-06-24 09:44:55", action: "新增", user: "陈杰", detail: "新增供应商“河北恒信电子有限公司”" }] }] },
  { key: "base-06", time: "2026-06-24 09:52:02", user: "刘洋", action: "查询", path: "接口", target: "物料表", detail: "导出数据 50 条", affectedCount: 50, ip: "10.12.35.33", result: "成功", records: [] },
  { key: "base-07", time: "2026-06-24 10:03:38", user: "周涛", action: "修改", path: "内部触发器", target: "组织部门表", detail: "修改部门名称", affectedCount: 1, ip: "10.12.36.17", result: "失败", records: [{ id: "100089", name: "临时测试部", logs: [{ time: "2026-06-24 10:03:38", action: "修改", user: "周涛", detail: "部门名称：临时测试部 → 测试部（操作失败）" }] }] },
  { key: "base-08", time: "2026-06-24 10:14:11", user: "吴静", action: "新增", path: "选择数据", target: "客户地址表", detail: "新增记录 3 条", affectedCount: 3, ip: "10.12.36.44", result: "成功", records: [{ id: "200331", name: "石家庄市裕华区XX路1号", logs: [{ time: "2026-06-24 10:14:11", action: "新增", user: "吴静", detail: "新增客户地址" }] }, { id: "200332", name: "石家庄市长安区XX街2号", logs: [{ time: "2026-06-24 10:14:11", action: "新增", user: "吴静", detail: "新增客户地址" }] }, { id: "200333", name: "石家庄市桥西区XX巷3号", logs: [{ time: "2026-06-24 10:14:11", action: "新增", user: "吴静", detail: "新增客户地址" }] }] },
  { key: "base-09", time: "2026-06-24 10:21:26", user: "郑凯", action: "删除", path: "数据联动", target: "仓库表", detail: "删除记录 1 条", affectedCount: 1, ip: "10.12.37.02", result: "成功", records: [{ id: "500034", name: "南区临时仓", logs: [{ time: "2026-06-24 10:21:26", action: "删除", user: "郑凯", detail: "删除仓库“南区临时仓”" }] }] },
  { key: "base-10", time: "2026-06-24 10:33:49", user: "孙丽", action: "查询", path: "关联其他表单", target: "岗位表", detail: "查询列表", affectedCount: 12, ip: "10.12.37.19", result: "成功", records: [] },
];

const dataTableLogRows: DataTableLogRecord[] = [
  { key: "table-01", time: "2026-06-24 09:15:07", user: "李娜", action: "新增字段", target: "用户信息表", detail: "新增字段“手机号”(varchar(20))，标记为敏感字段", ip: "10.12.33.71", result: "成功" },
  { key: "table-02", time: "2026-06-24 09:22:19", user: "赵敏", action: "修改配置", target: "客户表", detail: "修改“客户等级”字段：单选 → 下拉框，选项：A/B/C 级", ip: "10.12.34.28", result: "成功" },
  { key: "table-03", time: "2026-06-24 09:31:55", user: "陈杰", action: "删除字段", target: "供应商表", detail: "删除字段“备用电话”(varchar(20))，该字段下已有 12 条数据", ip: "10.12.35.06", result: "成功" },
  { key: "table-04", time: "2026-06-24 09:44:02", user: "刘洋", action: "新增索引", target: "物料表", detail: "新增唯一索引 idx_mat_code（物料编码）", ip: "10.12.35.33", result: "成功" },
  { key: "table-05", time: "2026-06-24 09:52:38", user: "周涛", action: "修改配置", target: "组织部门表", detail: "修改“部门名称”字段必填属性：否 → 是（已有 3 条记录该字段为空）", ip: "10.12.36.17", result: "失败" },
  { key: "table-06", time: "2026-06-24 10:03:11", user: "吴静", action: "新增字段", target: "客户表", detail: "新增字段“跟进人”(varchar(50))", ip: "10.12.36.44", result: "成功" },
  { key: "table-07", time: "2026-06-24 10:14:26", user: "郑凯", action: "删除索引", target: "仓库表", detail: "删除索引 idx_wh_code", ip: "10.12.37.02", result: "成功" },
  { key: "table-08", time: "2026-06-24 10:21:49", user: "孙丽", action: "新增字段", target: "用户信息表", detail: "新增字段“紧急联系人”(varchar(50))", ip: "10.12.37.19", result: "成功" },
  { key: "table-09", time: "2026-06-24 10:33:05", user: "张伟", action: "修改配置", target: "岗位表", detail: "修改“职级”字段枚举值：新增 P6 / P7 两档", ip: "10.12.33.45", result: "成功" },
  { key: "table-10", time: "2026-06-24 10:41:58", user: "李娜", action: "删除字段", target: "客户地址表", detail: "删除字段“邮编”(varchar(10))，该字段下已有 0 条数据", ip: "10.12.33.71", result: "成功" },
];

const authorizationLogRows: AuthorizationLogRecord[] = [
  { key: "auth-01", time: "2026-06-24 09:31:55", user: "陈杰", action: "数据权限", app: "教务系统", target: "学生基本信息", detail: "授权查询权限，数据范围：本部门", ip: "10.12.35.06", result: "成功" },
  { key: "auth-02", time: "2026-06-24 09:44:02", user: "刘洋", action: "应用注册", app: "财务缴费", target: "新应用", detail: "注册新应用“财务缴费”", ip: "10.12.35.33", result: "成功" },
  { key: "auth-03", time: "2026-06-24 10:03:11", user: "吴静", action: "数据权限", app: "人事系统", target: "教职工基本信息", detail: "修改“教师基本信息”可见性", ip: "10.12.36.44", result: "成功" },
  { key: "auth-04", time: "2026-06-24 10:14:26", user: "郑凯", action: "取消授权", app: "资产设备", target: "固定资产台账表", detail: "取消删除权限", ip: "10.12.37.02", result: "成功" },
  { key: "auth-05", time: "2026-06-24 10:33:05", user: "张伟", action: "数据权限", app: "人事系统", target: "用户信息表", detail: "新增角色“人事处”并配置数据范围", ip: "10.12.33.45", result: "成功" },
  { key: "auth-06", time: "2026-06-24 10:41:58", user: "李娜", action: "取消授权", app: "日程", target: "关联业务表", detail: "解除关联业务表 2 张", ip: "10.12.33.71", result: "成功" },
  { key: "auth-07", time: "2026-06-24 10:52:14", user: "王强", action: "应用注册", app: "图书馆", target: "新应用", detail: "注册新应用“图书馆”", ip: "10.12.34.12", result: "失败" },
  { key: "auth-08", time: "2026-06-24 11:02:37", user: "赵敏", action: "公共服务", app: "校园卡", target: "发送通知", detail: "授权短信渠道", ip: "10.12.34.28", result: "成功" },
  { key: "auth-09", time: "2026-06-24 11:15:23", user: "陈杰", action: "公共服务", app: "宿舍管理", target: "发送通知", detail: "授权短信渠道", ip: "10.12.35.06", result: "成功" },
  { key: "auth-10", time: "2026-06-24 11:28:41", user: "刘洋", action: "数据权限", app: "财务缴费", target: "客户表", detail: "授权查询权限，数据范围：全部", ip: "10.12.35.33", result: "成功" },
];

const generatedLogUsers = ["张伟", "李娜", "王强", "赵敏", "陈杰", "刘洋", "周涛", "吴静", "郑凯", "孙丽"];
const generatedLogTime = (index: number) => {
  const hour = String(8 + Math.floor(index / 6)).padStart(2, "0");
  const minute = String((index * 7 + 11) % 60).padStart(2, "0");
  const second = String((index * 13 + 19) % 60).padStart(2, "0");
  return `2026-06-23 ${hour}:${minute}:${second}`;
};

const generatedBaseActions: BaseDataLogRecord["action"][] = ["查询", "新增", "修改", "删除"];
const generatedBaseTargets: Array<Pick<BaseDataLogRecord, "path" | "target">> = [
  { path: "接口", target: "用户信息表" },
  { path: "内部触发器", target: "客户表" },
  { path: "选择数据", target: "供应商表" },
  { path: "数据联动", target: "岗位表" },
  { path: "关联其他表单", target: "组织部门表" },
];
baseDataLogRows.push(...Array.from({ length: 50 }, (_, index) => {
  const serial = String(index + 11).padStart(3, "0");
  const action = generatedBaseActions[index % generatedBaseActions.length];
  const target = generatedBaseTargets[index % generatedBaseTargets.length];
  const result: LogResult = index % 17 === 0 ? "失败" : "成功";
  return {
    key: `base-generated-${serial}`,
    time: generatedLogTime(index),
    user: generatedLogUsers[index % generatedLogUsers.length],
    action,
    path: target.path,
    target: target.target,
    detail: `${action}${target.target}（示例记录 ${serial}）`,
    affectedCount: index % 9 + 1,
    ip: `10.12.${40 + (index % 10)}.${100 + index}`,
    result,
    records: [],
  };
}));

const generatedTableActions: DataTableLogRecord["action"][] = ["新增字段", "修改配置", "删除字段", "新增索引", "删除索引"];
const generatedTableTargets = ["用户信息表", "客户表", "供应商表", "物料表", "组织部门表"];
dataTableLogRows.push(...Array.from({ length: 50 }, (_, index) => {
  const serial = String(index + 11).padStart(3, "0");
  const action = generatedTableActions[index % generatedTableActions.length];
  const target = generatedTableTargets[index % generatedTableTargets.length];
  const result: LogResult = index % 19 === 0 ? "失败" : "成功";
  return {
    key: `table-generated-${serial}`,
    time: generatedLogTime(index),
    user: generatedLogUsers[(index + 2) % generatedLogUsers.length],
    action,
    target,
    detail: `${action}：${target}（示例变更 ${serial}）`,
    ip: `10.13.${40 + (index % 10)}.${100 + index}`,
    result,
  };
}));

const generatedAuthorizationActions: AuthorizationLogRecord["action"][] = ["应用注册", "数据权限", "公共服务", "取消授权"];
const generatedAuthorizationApps = ["教务系统", "财务缴费", "人事系统", "校园卡", "图书馆"];
const generatedAuthorizationTargets = ["用户信息表", "客户表", "发送通知", "新应用", "关联业务表"];
authorizationLogRows.push(...Array.from({ length: 50 }, (_, index) => {
  const serial = String(index + 11).padStart(3, "0");
  const action = generatedAuthorizationActions[index % generatedAuthorizationActions.length];
  const app = generatedAuthorizationApps[index % generatedAuthorizationApps.length];
  const target = generatedAuthorizationTargets[index % generatedAuthorizationTargets.length];
  const result: LogResult = index % 23 === 0 ? "失败" : "成功";
  return {
    key: `auth-generated-${serial}`,
    time: generatedLogTime(index),
    user: generatedLogUsers[(index + 4) % generatedLogUsers.length],
    action,
    app,
    target,
    detail: `${action}：${app}${target}（示例日志 ${serial}）`,
    ip: `10.14.${40 + (index % 10)}.${100 + index}`,
    result,
  };
}));

const registeredAppSeedRows = [
  { key: 1, app: "日程", appid: "380ad0aa-220c-4c85-a19a-d633146cb703", appkey: "b64bd2fc*****25c1", owner: "张伟", phone: "13800138001", description: "日程管理应用", status: "上架", actions: ["详情", "关联业务表", "授权"] },
  { key: 2, app: "教务系统", appid: "a12f8c4d-5e9b-47c2-8f1a-3d6e2b9a7c10", appkey: "c73ae1b8*****9b04", owner: "李娜", phone: "13900139002", description: "教务排课与成绩管理", status: "上架", actions: ["详情", "关联业务表", "授权", "接口明细"] },
  { key: 3, app: "图书馆", appid: "7e4b9c2a-1d8f-4a63-b7c9-5e3f2a8d1b06", appkey: "9f1c6d3e*****8d13", owner: "王强", phone: "15000150003", description: "图书借阅与查询", status: "下架", actions: ["详情", "关联业务表", "授权", "接口明细"] },
  { key: 4, app: "校园卡", appid: "3d8f1a6b-9c2e-47d5-a8b1-6f4e2c9d7a05", appkey: "e5b2d9f1*****5b07", owner: "赵敏", phone: "18600186004", description: "校园一卡通服务", status: "上架", actions: ["详情", "关联业务表", "授权", "接口明细"] },
  { key: 5, app: "宿舍管理", appid: "b6c3e8a1-7d4f-4b92-9e5a-2c8f1d6b3e09", appkey: "1a7e4c9b*****4c02", owner: "陈杰", phone: "17700177005", description: "学生宿舍分配与报修", status: "上架", actions: ["详情", "关联业务表", "授权"] },
  { key: 6, app: "财务缴费", appid: "9c2f5a8d-3e6b-4d71-a4c8-7b1e9f2d5c03", appkey: "f3a8d1c6*****2a08", owner: "刘洋", phone: "18800188006", description: "学费缴纳与查询", status: "上架", actions: ["详情", "关联业务表", "授权", "接口明细"] },
  { key: 7, app: "科研管理", appid: "5e9c2a7f-1b4d-4a83-9f6c-3d8e1b5a7c04", appkey: "d1c6b9e3*****3e01", owner: "周涛", phone: "15900159007", description: "科研成果申报与管理", status: "下架", actions: ["详情", "关联业务表", "授权"] },
  { key: 8, app: "人事系统", appid: "1a7d4e9c-6b2f-48a5-b3d1-9e5c2f8a7b06", appkey: "7e2b5d8a*****5a09", owner: "吴静", phone: "13700137008", description: "教职工信息与考勤", status: "上架", actions: ["详情", "关联业务表", "授权"] },
  { key: 9, app: "资产设备", appid: "c4e8a1d5-9f3b-47e2-a6c8-1d5b9f2e4a07", appkey: "4b8e1c6d*****2e05", owner: "郑凯", phone: "17000170009", description: "固定资产管理与盘点", status: "上架", actions: ["详情", "关联业务表", "授权"] },
  { key: 10, app: "毕业离校", appid: "e2f5b9c8-1d4a-47e6-8b3f-6c9a1d5e2b08", appkey: "2d7a1f6c*****5c03", owner: "孙丽", phone: "13300133010", description: "毕业生离校流程管理", status: "下架", actions: ["详情", "关联业务表", "授权"] },
];

const initialRegisteredAppRows = [
  ...registeredAppSeedRows.map((row) => ({ ...row, externalApi: "否" })),
  ...Array.from({ length: 100 }, (_, index) => {
    const key = index + registeredAppSeedRows.length + 1;
    const source = registeredAppSeedRows[index % registeredAppSeedRows.length];
    const serial = String(key).padStart(3, "0");

    return {
      ...source,
      key,
      app: `${source.app}${serial}`,
      appid: `generated-app-${serial}`,
      appkey: `appkey-${serial}*****`,
      owner: `${source.owner}${serial}`,
      phone: `138${String(10000000 + key).padStart(8, "0")}`,
      description: `${source.description}（示例${serial}）`,
      externalApi: "否",
    };
  }),
];

type RegisteredAppRow = typeof initialRegisteredAppRows[number];

type InterfaceStatus = "启用" | "停用";
type InterfaceRecord = {
  key: string;
  code: string;
  name: string;
  methods: string[];
  url: string;
  docs?: string;
  status: InterfaceStatus;
};

const interfaceSeedRows: Record<string, InterfaceRecord[]> = {
  教务系统: [
    { key: "api-0001", code: "API-0001", name: "成绩查询", methods: ["GET"], url: "https://jw.example.edu/api/score/query", status: "启用" },
    { key: "api-0002", code: "API-0002", name: "课程列表", methods: ["GET", "POST"], url: "https://jw.example.edu/api/course/list", status: "启用" },
    { key: "api-0003", code: "API-0003", name: "学生信息查询", methods: ["GET"], url: "https://jw.example.edu/api/student/profile", status: "启用" },
    { key: "api-0004", code: "API-0004", name: "学生选课", methods: ["POST"], url: "https://jw.example.edu/api/course/enrollment", status: "启用" },
    { key: "api-0005", code: "API-0005", name: "课表查询", methods: ["GET"], url: "https://jw.example.edu/api/schedule/list", status: "启用" },
    { key: "api-0006", code: "API-0006", name: "考场安排", methods: ["GET"], url: "https://jw.example.edu/api/exam/room-assignment", status: "停用" },
    { key: "api-0007", code: "API-0007", name: "学期信息", methods: ["GET"], url: "https://jw.example.edu/api/semester/current", status: "启用" },
    { key: "api-0008", code: "API-0008", name: "教师任课查询", methods: ["GET"], url: "https://jw.example.edu/api/teacher/courses", status: "启用" },
    { key: "api-0009", code: "API-0009", name: "课程容量更新", methods: ["PUT"], url: "https://jw.example.edu/api/course/capacity", status: "停用" },
    { key: "api-0010", code: "API-0010", name: "成绩导出", methods: ["POST"], url: "https://jw.example.edu/api/score/export", status: "启用" },
    { key: "api-0011", code: "API-0011", name: "学籍异动记录", methods: ["GET"], url: "https://jw.example.edu/api/student/status-changes", status: "启用" },
    { key: "api-0012", code: "API-0012", name: "教学计划查询", methods: ["GET"], url: "https://jw.example.edu/api/teaching-plan/list", status: "停用" },
  ],
};

const fallbackInterfaceRows = (app: string): InterfaceRecord[] => [
  { key: `${app}-api-0001`, code: "API-0001", name: "数据查询", methods: ["GET"], url: `https://api.example.edu/${app}/query`, status: "启用" },
  { key: `${app}-api-0002`, code: "API-0002", name: "数据同步", methods: ["POST"], url: `https://api.example.edu/${app}/sync`, status: "停用" },
];

function ApplicationFormFields() {
  return (
    <>
      <Form.Item
        label="应用名称"
        name="app"
        rules={[{ required: true, message: "请输入应用名称" }]}
      >
        <Input placeholder="请输入应用名称" />
      </Form.Item>
      <Form.Item label="应用状态" name="status">
        <Select suffixIcon={<DownOutlined size={16} />} options={[{ value: "上架", label: "上架" }, { value: "下架", label: "下架" }]} />
      </Form.Item>
      <Form.Item label="appid" name="appid">
        <Input disabled placeholder="保存后自动生成" />
      </Form.Item>
      <Form.Item label="appkey" name="appkey">
        <Input disabled placeholder="保存后自动生成" />
      </Form.Item>
      <Form.Item
        label="应用负责人"
        name="owner"
        rules={[{ required: true, message: "请输入应用负责人" }]}
      >
        <Input placeholder="请输入应用负责人" />
      </Form.Item>
      <Form.Item label="联系方式" name="phone">
        <Input placeholder="请输入联系方式" />
      </Form.Item>
      <Form.Item
        label="是否对外提供接口"
        name="externalApi"
        rules={[{ required: true, message: "请选择是否对外提供接口" }]}
      >
        <Select suffixIcon={<DownOutlined size={16} />} options={[{ value: "是", label: "是" }, { value: "否", label: "否" }]} />
      </Form.Item>
      <Form.Item label="应用简介" name="description">
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} placeholder="请输入应用简介" />
      </Form.Item>
    </>
  );
}

type AssociationType = "form" | "approval";
type AssociationFilter = "all" | "unlinked" | "linked";
type AssociationRow = { key: string; name: string; owner: string; id: string; linkedTo?: string };

function AssociationTable({ rows, type, appName, selectedKeys, linkedKeys, allSelected, someSelected, onSelectPage, onSelectRow }: {
  rows: AssociationRow[]; type: AssociationType; appName: string; selectedKeys: string[]; linkedKeys: string[];
  allSelected: boolean; someSelected: boolean; onSelectPage: (checked: boolean) => void;
  onSelectRow: (row: AssociationRow, checked: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState(320);
  const [headerHeight, setHeaderHeight] = useState(50);
  const [scrollbar, setScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const update = () => {
      const height = container.querySelector<HTMLElement>(".ant-table-thead")?.getBoundingClientRect().height || 50;
      setHeaderHeight(height);
      setBodyHeight(Math.max(1, Math.floor(container.clientHeight - height)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const body = scrollRef.current?.querySelector<HTMLElement>(".ant-table-body");
    if (!body) return;
    bodyRef.current = body;
    const update = () => {
      const trackHeight = Math.max(0, body.clientHeight - 8);
      const scrollableHeight = body.scrollHeight - body.clientHeight;
      if (trackHeight <= 0 || scrollableHeight <= 1) {
        setScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max(24, trackHeight * body.clientHeight / body.scrollHeight);
      setScrollbar({ trackHeight, thumbHeight, thumbOffset: (trackHeight - thumbHeight) * body.scrollTop / scrollableHeight });
    };
    body.addEventListener("scroll", update, { passive: true });
    update();
    return () => { body.removeEventListener("scroll", update); bodyRef.current = null; };
  }, [rows, bodyHeight]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const body = bodyRef.current;
    const maxOffset = scrollbar.trackHeight - scrollbar.thumbHeight;
    if (!body || maxOffset <= 0) return;
    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = body.scrollTop;
    const move = (moveEvent: PointerEvent) => { body.scrollTop = startScrollTop + (moveEvent.clientY - startY) / maxOffset * (body.scrollHeight - body.clientHeight); };
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const selectable = rows.some((row) => !row.linkedTo || row.linkedTo === appName);
  return (
    <div ref={scrollRef} className="prototype-table-scroll association-table-scroll" style={{ "--association-table-body-height": `${bodyHeight}px` } as React.CSSProperties}>
      <Table<AssociationRow>
        columns={[
          { title: <Checkbox aria-label="全选当前页" checked={allSelected} indeterminate={someSelected} disabled={!selectable} onChange={(event) => onSelectPage(event.target.checked)} />, key: "selection", width: 48, render: (_value, row) => <Checkbox aria-label={`选择${row.name}`} checked={selectedKeys.includes(row.key)} disabled={Boolean(row.linkedTo && row.linkedTo !== appName)} onChange={(event) => onSelectRow(row, event.target.checked)} /> },
          { title: type === "form" ? "表单名称" : "审批名称", dataIndex: "name", key: "name", ellipsis: true, render: (value: string) => <OverflowTooltip title={value} className="association-item-name">{value}</OverflowTooltip> },
          { title: "关联状态", key: "status", width: 160, render: (_value, row) => {
            const linkedElsewhere = Boolean(row.linkedTo && row.linkedTo !== appName);
            const linked = linkedElsewhere || linkedKeys.includes(row.key);
            const statusLabel = linked && row.linkedTo ? row.linkedTo : linked ? "已关联" : "未关联";
            return <span className={linked ? "association-status-linked" : "association-status-unlinked"}>{statusLabel}</span>;
          } },
          { title: type === "form" ? "表单id" : "审批id", dataIndex: "id", key: "id", width: 160, render: (value: string) => <Typography.Text className="association-item-id">{value}</Typography.Text> },
        ]}
        dataSource={rows}
        locale={{ emptyText: "暂无符合条件的业务表" }}
        pagination={false}
        scroll={{ y: bodyHeight }}
        tableLayout="fixed"
      />
      {scrollbar.thumbHeight > 0 && <div className="prototype-floating-scrollbar" style={{ top: headerHeight + 4, height: scrollbar.trackHeight }} aria-hidden="true"><div className="prototype-floating-scrollbar-thumb" style={{ height: scrollbar.thumbHeight, transform: `translateY(${scrollbar.thumbOffset}px)` }} onPointerDown={handlePointerDown} /></div>}
    </div>
  );
}

type PermissionApiKey = "create" | "delete" | "update" | "read";
type PermissionCondition = { field: string; operator: string; value: string };
type PermissionField = { key: string; label: string; sensitive?: boolean };
type PermissionTable = { key: string; name: string; rows: string; fields: PermissionField[] };
type PermissionApiState = Record<PermissionApiKey, boolean>;

const permissionApis: Array<{ key: PermissionApiKey; label: string }> = [
  { key: "create", label: "新增数据" },
  { key: "delete", label: "删除数据" },
  { key: "update", label: "更新数据" },
  { key: "read", label: "查询数据" },
];

const defaultPermissionFields: PermissionField[] = [
  { key: "id", label: "主键ID" },
  { key: "code", label: "编码" },
  { key: "name", label: "名称" },
  { key: "department", label: "所属部门" },
  { key: "contact", label: "联系人", sensitive: true },
  { key: "status", label: "状态" },
  { key: "createdBy", label: "创建人" },
  { key: "createdAt", label: "创建时间" },
  { key: "updatedBy", label: "更新人" },
  { key: "updatedAt", label: "更新时间" },
  { key: "remark", label: "备注" },
  { key: "source", label: "数据来源" },
  { key: "type", label: "类型" },
  { key: "sort", label: "排序" },
];

const permissionTables: PermissionTable[] = getBaseDataNavigationTableNodes().map((node, index) => ({
  key: node.key,
  name: node.title,
  rows: String(386 + index * 127),
  fields: defaultPermissionFields,
}));

const defaultPermissionTableKey = permissionTables[0].key;

function filterPermissionNavigation(nodes: typeof baseDataNavigation, keyword: string): typeof baseDataNavigation {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return nodes;

  return nodes.flatMap((node) => {
    const children = node.children ? filterPermissionNavigation(node.children, normalizedKeyword) : [];
    return node.title.includes(normalizedKeyword) || children.length > 0
      ? [{ ...node, children: children.length > 0 ? children : node.children }]
      : [];
  });
}

function getPermissionNavigationExpandedKeys(nodes: typeof baseDataNavigation): string[] {
  return nodes.flatMap((node) => node.children ? [node.key, ...getPermissionNavigationExpandedKeys(node.children)] : []);
}

function permissionNavigationMenuNodes(nodes: typeof baseDataNavigation): BaseDataNavigationMenuNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: node.title,
    kind: node.kind,
    icon: <Notes size={16} />,
    children: node.children ? permissionNavigationMenuNodes(node.children) : undefined,
  }));
}

function getPermissionNavigationTableKeys(node: BaseDataNavigationMenuNode): string[] {
  return node.kind === "table" ? [node.key] : (node.children || []).flatMap(getPermissionNavigationTableKeys);
}

type PermissionOtherInterface = {
  key: string;
  name: string;
  methods: string[];
};

type PermissionOtherService = {
  key: string;
  name: string;
  description: string;
  group: string;
  interfaces?: PermissionOtherInterface[];
};

const permissionOtherServices: PermissionOtherService[] = [
  { key: "send_notice", name: "通知", description: "允许应用调用通知能力", group: "公共服务" },
  { key: "academic_api", name: "教务系统", description: "允许应用调用教务系统接口", group: "其他应用", interfaces: [{ key: "score-query", name: "成绩查询", methods: ["GET"] }, { key: "course-list", name: "课程列表", methods: ["GET", "POST"] }] },
  { key: "library_api", name: "图书馆", description: "允许应用调用图书馆接口", group: "其他应用", interfaces: [{ key: "book-search", name: "图书检索", methods: ["GET"] }] },
  { key: "campus_card_api", name: "校园卡", description: "允许应用调用校园卡接口", group: "其他应用", interfaces: [{ key: "balance-query", name: "余额查询", methods: ["GET"] }] },
  { key: "finance_api", name: "财务缴费", description: "允许应用调用财务缴费接口", group: "其他应用", interfaces: [{ key: "payment-query", name: "缴费查询", methods: ["GET"] }] },
];

const notificationChannels = [
  { key: "send_notification", label: "发通知" },
];

const associationRows: Record<AssociationType, AssociationRow[]> = {
  form: [
    { key: "form-100001", name: "学生基本信息表", owner: "毕业离校", id: "100001", linkedTo: "毕业离校" },
    { key: "form-100002", name: "教职工基本信息表", owner: "", id: "100002" },
    { key: "form-100003", name: "课程信息表", owner: "", id: "100003" },
    { key: "form-100004", name: "成绩录入表", owner: "毕业离校", id: "100004", linkedTo: "毕业离校" },
    { key: "form-100005", name: "宿舍分配表", owner: "", id: "100005" },
    { key: "form-100006", name: "校园卡消费记录表", owner: "", id: "100006" },
    { key: "form-100007", name: "图书借阅记录表", owner: "", id: "100007" },
    { key: "form-100008", name: "资产设备台账表", owner: "科研管理", id: "100008", linkedTo: "科研管理" },
    { key: "form-100009", name: "科研项目申报表", owner: "图书馆", id: "100009", linkedTo: "图书馆" },
    { key: "form-100010", name: "人事考勤记录表", owner: "科研管理", id: "100010", linkedTo: "科研管理" },
    ...Array.from({ length: 25 }, (_, index) => {
      const id = String(100011 + index);
      return { key: `form-${id}`, name: `业务信息表 ${index + 1}`, owner: "", id };
    }),
  ],
  approval: [
    { key: "approval-200001", name: "请假申请审批", owner: "教务系统", id: "200001", linkedTo: "教务系统" },
    { key: "approval-200002", name: "用章申请审批", owner: "", id: "200002" },
    { key: "approval-200003", name: "费用报销审批", owner: "", id: "200003" },
    { key: "approval-200004", name: "设备借用审批", owner: "科研管理", id: "200004", linkedTo: "科研管理" },
    { key: "approval-200005", name: "场地预约审批", owner: "校园卡", id: "200005", linkedTo: "校园卡" },
    { key: "approval-200006", name: "毕业离校审批", owner: "教务系统", id: "200006", linkedTo: "教务系统" },
    { key: "approval-200007", name: "调课申请审批", owner: "", id: "200007" },
    { key: "approval-200008", name: "复学申请审批", owner: "财务缴费", id: "200008", linkedTo: "财务缴费" },
    { key: "approval-200009", name: "休学申请审批", owner: "", id: "200009" },
    { key: "approval-200010", name: "成绩修改审批", owner: "人事系统", id: "200010", linkedTo: "人事系统" },
    ...Array.from({ length: 25 }, (_, index) => {
      const id = String(200011 + index);
      return { key: `approval-${id}`, name: `业务申请审批 ${index + 1}`, owner: "", id };
    }),
  ],
};

function AuthorizationViewWorkspace() {
  const [filters, setFilters] = useState({ app: "", target: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailRecord, setDetailRecord] = useState<AuthorizationViewRow | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLElement | null>(null);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(50);
  const [tableBodyHeight, setTableBodyHeight] = useState(360);
  const [tableScrollbar, setTableScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const authorizationDetailScrollRef = useRef<HTMLDivElement>(null);
  const [authorizationDetailScrollbar, setAuthorizationDetailScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });

  const filteredRows = authorizationViewRows.filter((row) => (
    (!appliedFilters.app || row.app === appliedFilters.app)
    && (!appliedFilters.target || row.target === appliedFilters.target)
  ));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const appOptions = Array.from(new Set(authorizationViewRows.map((row) => row.app))).map((value) => ({ value, label: value }));
  const targetOptions = Array.from(new Set(authorizationViewRows.map((row) => row.target))).map((value) => ({ value, label: value }));
  const appRowSpans = new Map<string, number>();

  pagedRows.forEach((row, index) => {
    const previous = pagedRows[index - 1];
    if (previous?.app === row.app) return;
    const span = pagedRows.slice(index).findIndex((item) => item.app !== row.app);
    appRowSpans.set(row.key, span === -1 ? pagedRows.length - index : span);
  });

  useLayoutEffect(() => {
    const container = tableScrollRef.current;
    const tableBody = container?.querySelector<HTMLElement>(".ant-table-body");
    if (!container || !tableBody) return;
    tableBodyRef.current = tableBody;

    const updateDimensions = () => {
      const headerHeight = container.querySelector<HTMLElement>(".ant-table-thead")?.getBoundingClientRect().height || 50;
      setTableHeaderHeight(headerHeight);
      setTableBodyHeight(Math.max(160, Math.floor(container.clientHeight - headerHeight)));
    };
    const updateScrollbar = () => {
      const trackHeight = Math.max(0, tableBody.clientHeight - 8);
      const scrollableHeight = tableBody.scrollHeight - tableBody.clientHeight;
      if (trackHeight <= 0 || scrollableHeight <= 1) {
        setTableScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max(24, trackHeight * tableBody.clientHeight / tableBody.scrollHeight);
      setTableScrollbar({
        trackHeight,
        thumbHeight,
        thumbOffset: (trackHeight - thumbHeight) * tableBody.scrollTop / scrollableHeight,
      });
    };

    updateDimensions();
    updateScrollbar();
    tableBody.addEventListener("scroll", updateScrollbar, { passive: true });
    const observer = new ResizeObserver(() => {
      updateDimensions();
      updateScrollbar();
    });
    observer.observe(container);
    return () => {
      tableBody.removeEventListener("scroll", updateScrollbar);
      observer.disconnect();
      if (tableBodyRef.current === tableBody) tableBodyRef.current = null;
    };
  }, [pagedRows.length, currentPage, pageSize, tableBodyHeight]);

  const handleTableScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const tableBody = tableBodyRef.current;
    const maxThumbOffset = tableScrollbar.trackHeight - tableScrollbar.thumbHeight;
    const scrollableHeight = tableBody ? tableBody.scrollHeight - tableBody.clientHeight : 0;
    if (!tableBody || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = tableBody.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      tableBody.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  useLayoutEffect(() => {
    if (!detailRecord) return;

    let frameId = 0;
    let cleanup: (() => void) | undefined;
    const setupScrollbar = () => {
      const container = authorizationDetailScrollRef.current;
      if (!container) {
        frameId = window.requestAnimationFrame(setupScrollbar);
        return;
      }

      const updateScrollbar = () => {
        const trackHeight = Math.max(0, container.clientHeight - 8);
        const scrollableHeight = container.scrollHeight - container.clientHeight;
        if (trackHeight <= 0 || scrollableHeight <= 1) {
          setAuthorizationDetailScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * container.clientHeight / container.scrollHeight);
        setAuthorizationDetailScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: (trackHeight - thumbHeight) * container.scrollTop / scrollableHeight,
        });
      };

      updateScrollbar();
      container.addEventListener("scroll", updateScrollbar, { passive: true });
      const observer = new ResizeObserver(updateScrollbar);
      observer.observe(container);
      if (container.firstElementChild instanceof HTMLElement) observer.observe(container.firstElementChild);
      cleanup = () => {
        container.removeEventListener("scroll", updateScrollbar);
        observer.disconnect();
      };
    };

    setupScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [detailRecord]);

  const handleAuthorizationDetailScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = authorizationDetailScrollRef.current;
    const maxThumbOffset = authorizationDetailScrollbar.trackHeight - authorizationDetailScrollbar.thumbHeight;
    const scrollableHeight = container ? container.scrollHeight - container.clientHeight : 0;
    if (!container || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = container.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      container.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const updateFilter = (key: keyof typeof filters, value?: string) => {
    setFilters((current) => ({ ...current, [key]: value || "" }));
  };
  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    const emptyFilters = { app: "", target: "" };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };
  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean);

  const serviceType = (type: AuthorizationGrantType) => ({
    basedata: "基础数据表",
    public: "公共服务",
    other: "其他应用",
  }[type]);

  const operationClass = (value: string) => ({
    新增: "is-create",
    删除: "is-delete",
    修改: "is-update",
    查询: "is-read",
  }[value] || "is-service");

  const columns = [
    {
      title: "应用名称",
      dataIndex: "app",
      key: "app",
      width: 120,
      onCell: (record: AuthorizationViewRow) => ({ rowSpan: appRowSpans.get(record.key) || 0 }),
      render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text authview-app-name">{value}</OverflowTooltip>,
    },
    { title: "服务类型", dataIndex: "type", key: "type", width: 120, render: (value: AuthorizationGrantType) => <Tag className={`authorization-type-tag is-${value}`}>{serviceType(value)}</Tag> },
    { title: "授权对象", dataIndex: "target", key: "target", width: 185, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    {
      title: "授权操作",
      dataIndex: "content",
      key: "content",
      width: 230,
      render: (values: string[], record: AuthorizationViewRow) => (
        <Space className="authorization-operation-list" size={[4, 4]} wrap>
          {values.map((value) => <Tag className={`authorization-operation-tag ${record.type === "basedata" ? operationClass(value) : "is-service"}`} key={value}>{value}</Tag>)}
        </Space>
      ),
    },
    { title: "更新时间", dataIndex: "updated", key: "updated", width: 160, render: (value: string) => <Typography.Text className="authorization-updated-text">{value}</Typography.Text> },
    { title: "操作", key: "actions", width: 92, render: (_value: unknown, record: AuthorizationViewRow) => record.type === "basedata" ? <Button className="prototype-action-button" type="link" size="small" onClick={() => setDetailRecord(record)}>查看详情</Button> : <Typography.Text type="secondary">-</Typography.Text> },
  ];

  return (
    <div className="prototype-table-workspace authview-workspace">
      <div className="prototype-table-filterbar">
        <Space size={14} wrap>
          <label className="prototype-filter-item">
            <span>应用名称</span>
            <Select value={filters.app || undefined} placeholder="全部应用" allowClear showSearch optionFilterProp="label" suffixIcon={<DownOutlined size={16} />} options={appOptions} onChange={(value) => updateFilter("app", value)} />
          </label>
          <label className="prototype-filter-item">
            <span>授权对象</span>
            <Select value={filters.target || undefined} placeholder="全部对象" allowClear showSearch optionFilterProp="label" suffixIcon={<DownOutlined size={16} />} options={targetOptions} onChange={(value) => updateFilter("target", value)} />
          </label>
          <Space size={8}>
            <Button type="primary" icon={<SearchOutlined size={16} />} onClick={handleSearch}>查询</Button>
            {hasAppliedFilters && <Tooltip title="清空查询"><Button aria-label="清空查询" icon={<ClearOutlined size={16} />} onClick={handleClearSearch} /></Tooltip>}
          </Space>
        </Space>
      </div>
      <div className="prototype-table-container">
        <div ref={tableScrollRef} className="prototype-table-scroll" style={{ "--authview-table-body-height": `${tableBodyHeight}px` } as React.CSSProperties}>
          <Table<AuthorizationViewRow>
            columns={columns}
            dataSource={pagedRows}
            pagination={false}
            rowKey="key"
            rowHoverable={false}
            scroll={{ x: 907, y: tableBodyHeight }}
            tableLayout="fixed"
            locale={{ emptyText: "暂无匹配的授权记录" }}
          />
          {tableScrollbar.thumbHeight > 0 && (
            <div className="prototype-floating-scrollbar" style={{ top: tableHeaderHeight + 4, height: tableScrollbar.trackHeight }} aria-hidden="true">
              <div className="prototype-floating-scrollbar-thumb" style={{ height: tableScrollbar.thumbHeight, transform: `translateY(${tableScrollbar.thumbOffset}px)` }} onPointerDown={handleTableScrollbarPointerDown} />
            </div>
          )}
        </div>
      </div>
      <div className="prototype-table-pagination authview-pagination">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredRows.length}
          pageSizeOptions={[10, 20, 50]}
          showSizeChanger={{ suffixIcon: <DownOutlined size={16} /> }}
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
          onChange={(page, nextPageSize) => {
            setCurrentPage(page);
            setPageSize(nextPageSize);
          }}
        />
      </div>
      <Modal
        open={Boolean(detailRecord)}
        width={760}
        centered
        className="authorization-detail-modal access-register-modal"
        title="授权详情"
        closeIcon={<CloseOutlined size={20} />}
        footer={null}
        onCancel={() => setDetailRecord(null)}
      >
        {detailRecord && (
          <div className="access-register-form-viewport">
            <div ref={authorizationDetailScrollRef} className="access-register-form-scroll authorization-detail-scroll">
              <div className="authorization-detail-content">
            <div className="authorization-detail-summary">
              <div className="authorization-detail-summary-item"><span className="authorization-detail-meta-label"><ApiApp size={16} />应用名称：</span><Typography.Text className="authorization-detail-meta-value">{detailRecord.app}</Typography.Text></div>
              <div className="authorization-detail-summary-item"><span className="authorization-detail-meta-label"><DataSheet size={16} />数据域：</span><Typography.Text className="authorization-detail-meta-value">{detailRecord.domain}</Typography.Text></div>
              <div className="authorization-detail-summary-item"><span className="authorization-detail-meta-label"><Notes size={16} />基础表：</span><Typography.Text className="authorization-detail-meta-value">{detailRecord.target}</Typography.Text></div>
              <div className="authorization-detail-summary-item"><span className="authorization-detail-meta-label"><DatabaseTime size={16} />更新时间：</span><Typography.Text className="authorization-detail-meta-value">{detailRecord.updated}</Typography.Text></div>
            </div>
            <div className="authorization-detail-heading">
              <Typography.Text strong>操作权限明细</Typography.Text>
              <span className="authorization-detail-heading-divider" aria-hidden="true" />
              <Typography.Text type="secondary">共 {detailRecord.permissions?.length || 0} 项操作</Typography.Text>
            </div>
              <Flex className="authorization-detail-list" vertical gap={8}>
                {(detailRecord.permissions || []).map((permission) => (
                  <Flex className="authorization-detail-operation" vertical key={permission.action}>
                    <Flex className="authorization-detail-operation-header" align="center" gap={10}>
                      <Tag className={`authorization-operation-tag ${operationClass(permission.action)}`}>{permission.action}</Tag>
                      <Typography.Text type="secondary">{permission.fields.length ? `${permission.fields.length} 个字段` : "无字段权限"}</Typography.Text>
                    </Flex>
                    <Descriptions size="small" column={1} items={[
                    { key: "scope", label: "数据范围", children: <Typography.Text className="authorization-detail-plain-text">{permission.conditions.length ? permission.conditions.join("、") : "全部数据"}</Typography.Text> },
                    { key: "fields", label: "字段权限", children: permission.fields.length ? <Typography.Text className="authorization-detail-plain-text">{permission.fields.join("、")}</Typography.Text> : <Typography.Text type="secondary">-</Typography.Text> },
                    ]} />
                  </Flex>
                ))}
              </Flex>
              </div>
            </div>
            {authorizationDetailScrollbar.thumbHeight > 0 && (
              <div className="access-register-floating-scrollbar" aria-hidden="true">
                <div className="access-register-floating-scrollbar-thumb" style={{ height: authorizationDetailScrollbar.thumbHeight, transform: `translateY(${authorizationDetailScrollbar.thumbOffset}px)` }} onPointerDown={handleAuthorizationDetailScrollbarPointerDown} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

type AuditLogRow = BaseDataLogRecord | DataTableLogRecord | AuthorizationLogRecord;
type AuditLogKey = Extract<AccessKey, "log-base" | "log-table" | "log-auth">;

function AuditLogWorkspace({ logType }: { logType: AuditLogKey }) {
  const navigate = useNavigate();
  const rows: AuditLogRow[] = logType === "log-base" ? baseDataLogRows : logType === "log-table" ? dataTableLogRows : authorizationLogRows;
  const [filters, setFilters] = useState({ user: "", action: "", target: "", app: "", dateRange: [] as string[] });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [detailRecord, setDetailRecord] = useState<BaseDataLogRecord | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLElement | null>(null);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(50);
  const [tableBodyHeight, setTableBodyHeight] = useState(360);
  const [tableScrollbar, setTableScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const auditDetailScrollRef = useRef<HTMLDivElement>(null);
  const [auditDetailScrollbar, setAuditDetailScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });

  const actionOptions = Array.from(new Set(rows.map((row) => row.action))).map((value) => ({ value, label: value }));
  const targetOptions = Array.from(new Set(rows.map((row) => row.target))).map((value) => ({ value, label: value }));
  const appOptions = logType === "log-auth" ? Array.from(new Set(authorizationLogRows.map((row) => row.app))).map((value) => ({ value, label: value })) : [];
  const filteredRows = rows.filter((row) => {
    const date = row.time.slice(0, 10);
    const dateMatches = !appliedFilters.dateRange.length || (date >= appliedFilters.dateRange[0] && date <= appliedFilters.dateRange[1]);
    const userMatches = !appliedFilters.user || row.user.includes(appliedFilters.user.trim());
    const actionMatches = !appliedFilters.action || row.action === appliedFilters.action;
    const targetMatches = !appliedFilters.target || row.target === appliedFilters.target;
    const appMatches = !("app" in row) || !appliedFilters.app || row.app === appliedFilters.app;
    return dateMatches && userMatches && actionMatches && targetMatches && appMatches;
  });
  const hasAppliedFilters = Boolean(appliedFilters.user || appliedFilters.action || appliedFilters.target || appliedFilters.app || appliedFilters.dateRange.length);

  useLayoutEffect(() => {
    const container = tableScrollRef.current;
    const tableBody = container?.querySelector<HTMLElement>(".ant-table-body");
    if (!container || !tableBody) return;
    tableBodyRef.current = tableBody;

    const updateDimensions = () => {
      const headerHeight = container.querySelector<HTMLElement>(".ant-table-thead")?.getBoundingClientRect().height || 50;
      setTableHeaderHeight(headerHeight);
      setTableBodyHeight(Math.max(160, Math.floor(container.clientHeight - headerHeight)));
    };
    const updateScrollbar = () => {
      const trackHeight = Math.max(0, tableBody.clientHeight - 8);
      const scrollableHeight = tableBody.scrollHeight - tableBody.clientHeight;
      if (trackHeight <= 0 || scrollableHeight <= 1) {
        setTableScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max(24, trackHeight * tableBody.clientHeight / tableBody.scrollHeight);
      setTableScrollbar({
        trackHeight,
        thumbHeight,
        thumbOffset: (trackHeight - thumbHeight) * tableBody.scrollTop / scrollableHeight,
      });
    };

    updateDimensions();
    updateScrollbar();
    tableBody.addEventListener("scroll", updateScrollbar, { passive: true });
    const observer = new ResizeObserver(() => {
      updateDimensions();
      updateScrollbar();
    });
    observer.observe(container);
    return () => {
      tableBody.removeEventListener("scroll", updateScrollbar);
      observer.disconnect();
      if (tableBodyRef.current === tableBody) tableBodyRef.current = null;
    };
  }, [filteredRows.length, tableBodyHeight]);

  const handleTableScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const tableBody = tableBodyRef.current;
    const maxThumbOffset = tableScrollbar.trackHeight - tableScrollbar.thumbHeight;
    const scrollableHeight = tableBody ? tableBody.scrollHeight - tableBody.clientHeight : 0;
    if (!tableBody || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = tableBody.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      tableBody.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  useLayoutEffect(() => {
    if (!detailRecord) return;

    let frameId = 0;
    let cleanup: (() => void) | undefined;
    const setupScrollbar = () => {
      const container = auditDetailScrollRef.current;
      if (!container) {
        frameId = window.requestAnimationFrame(setupScrollbar);
        return;
      }

      const updateScrollbar = () => {
        const trackHeight = Math.max(0, container.clientHeight - 8);
        const scrollableHeight = container.scrollHeight - container.clientHeight;
        if (trackHeight <= 0 || scrollableHeight <= 1) {
          setAuditDetailScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * container.clientHeight / container.scrollHeight);
        setAuditDetailScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: (trackHeight - thumbHeight) * container.scrollTop / scrollableHeight,
        });
      };

      updateScrollbar();
      container.addEventListener("scroll", updateScrollbar, { passive: true });
      const observer = new ResizeObserver(updateScrollbar);
      observer.observe(container);
      if (container.firstElementChild instanceof HTMLElement) observer.observe(container.firstElementChild);
      cleanup = () => {
        container.removeEventListener("scroll", updateScrollbar);
        observer.disconnect();
      };
    };

    setupScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [detailRecord]);

  const handleAuditDetailScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = auditDetailScrollRef.current;
    const maxThumbOffset = auditDetailScrollbar.trackHeight - auditDetailScrollbar.thumbHeight;
    const scrollableHeight = container ? container.scrollHeight - container.clientHeight : 0;
    if (!container || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = container.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      container.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const updateFilter = (key: "user" | "action" | "target" | "app", value?: string) => {
    setFilters((current) => ({ ...current, [key]: value || "" }));
  };
  const runSearch = () => {
    setAppliedFilters(filters);
  };
  const clearSearch = () => {
    const nextFilters = { user: "", action: "", target: "", app: "", dateRange: [] as string[] };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };
  const openDetail = (record: BaseDataLogRecord) => {
    setDetailRecord(record);
  };
  const viewRecordLogs = (recordId: string) => {
    setDetailRecord(null);
    navigate(`/access/log-base?recordId=${encodeURIComponent(recordId)}`);
  };
  const actionClass = (action: string) => {
    if (action === "数据权限") return "is-read";
    if (action === "应用注册") return "is-create";
    if (action === "取消授权") return "is-delete";
    if (action === "公共服务") return "is-update";
    if (action === "新增" || action.startsWith("新增")) return "is-create";
    if (action === "删除" || action.startsWith("删除")) return "is-delete";
    if (action === "修改" || action.startsWith("修改")) return "is-update";
    if (action === "查询") return "is-read";
    return "is-service";
  };
  const operationTag = (action: string) => <Tag className={`audit-operation-tag ${actionClass(action)}`}>{action}</Tag>;
  const resultTag = (result: LogResult) => <Tag className={`audit-result-tag ${result === "成功" ? "is-success" : "is-failed"}`}>{result}</Tag>;
  const operationSummary = (record: BaseDataLogRecord) => `${record.action} ${record.affectedCount} 条数据`;
  const commonColumns = [
    { title: "操作时间", dataIndex: "time", key: "time", width: 160, render: (value: string) => <Typography.Text className="audit-time-text">{value}</Typography.Text> },
    { title: "操作人", dataIndex: "user", key: "user", width: 90, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "操作类型", dataIndex: "action", key: "action", width: 112, render: (value: string) => operationTag(value) },
  ];
  const columns = logType === "log-base"
    ? [...commonColumns, { title: "操作途径", dataIndex: "path", key: "path", width: 132, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "操作对象", dataIndex: "target", key: "target", width: 136, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "操作详情", key: "detail", width: 168, render: (_value: unknown, record: AuditLogRow) => <OverflowTooltip title={operationSummary(record as BaseDataLogRecord)} className="prototype-table-cell-text">{operationSummary(record as BaseDataLogRecord)}</OverflowTooltip> }, { title: "来源 IP", dataIndex: "ip", key: "ip", width: 122, render: (value: string) => <Typography.Text className="audit-time-text">{value}</Typography.Text> }, { title: "结果", dataIndex: "result", key: "result", width: 88, render: (value: LogResult) => resultTag(value) }, { title: "操作", key: "operations", width: 64, render: (_value: unknown, record: AuditLogRow) => <Button className="prototype-action-button" type="link" size="small" onClick={() => openDetail(record as BaseDataLogRecord)}>查看</Button> }]
    : logType === "log-table"
      ? [...commonColumns, { title: "数据表", dataIndex: "target", key: "target", width: 144, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "变更详情", dataIndex: "detail", key: "detail", width: 344, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "来源 IP", dataIndex: "ip", key: "ip", width: 122, render: (value: string) => <Typography.Text className="audit-time-text">{value}</Typography.Text> }, { title: "结果", dataIndex: "result", key: "result", width: 88, render: (value: LogResult) => resultTag(value) }]
      : [...commonColumns, { title: "目标应用", dataIndex: "app", key: "app", width: 132, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "授权对象", dataIndex: "target", key: "target", width: 160, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "操作详情", dataIndex: "detail", key: "detail", width: 212, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> }, { title: "来源 IP", dataIndex: "ip", key: "ip", width: 122, render: (value: string) => <Typography.Text className="audit-time-text">{value}</Typography.Text> }, { title: "结果", dataIndex: "result", key: "result", width: 88, render: (value: LogResult) => resultTag(value) }];

  return (
    <div className="prototype-table-workspace audit-log-workspace">
      <div className="prototype-table-filterbar audit-log-filterbar">
        <Space size={14} wrap>
          <label className="prototype-filter-item audit-date-filter">
            <span>操作时间</span>
            <DatePicker.RangePicker
              allowClear
              locale={zhCN.DatePicker}
              placeholder={["开始日期", "结束日期"]}
              suffixIcon={<FixedCalendar size={16} strokeWidth={3} />}
              onChange={(_dates, dateStrings) => setFilters((current) => ({ ...current, dateRange: dateStrings.filter(Boolean) as string[] }))}
            />
          </label>
          <label className="prototype-filter-item">
            <span>操作人</span>
            <Input value={filters.user} placeholder="请输入" onChange={(event) => updateFilter("user", event.target.value)} />
          </label>
          {logType === "log-auth" && <label className="prototype-filter-item"><span>目标应用</span><Select value={filters.app || undefined} placeholder="全部应用" allowClear showSearch optionFilterProp="label" suffixIcon={<DownOutlined size={16} />} options={appOptions} onChange={(value) => updateFilter("app", value)} /></label>}
          {logType !== "log-auth" && <label className="prototype-filter-item"><span>{logType === "log-table" ? "数据表" : "操作对象"}</span><Select value={filters.target || undefined} placeholder="全部" allowClear showSearch optionFilterProp="label" suffixIcon={<DownOutlined size={16} />} options={targetOptions} onChange={(value) => updateFilter("target", value)} /></label>}
          <label className="prototype-filter-item"><span>{logType === "log-auth" ? "授权类型" : "操作类型"}</span><Select value={filters.action || undefined} placeholder="全部" allowClear suffixIcon={<DownOutlined size={16} />} options={actionOptions} onChange={(value) => updateFilter("action", value)} /></label>
          <Space size={8}>
            <Button type="primary" icon={<SearchOutlined size={16} />} onClick={runSearch}>查询</Button>
            {hasAppliedFilters && <Tooltip title="清空查询"><Button aria-label="清空查询" icon={<ClearOutlined size={16} />} onClick={clearSearch} /></Tooltip>}
          </Space>
        </Space>
      </div>
      <div className="prototype-table-container audit-log-table-container">
        <div ref={tableScrollRef} className="prototype-table-scroll audit-log-table-scroll">
          <Table columns={columns} dataSource={filteredRows} pagination={false} rowKey="key" rowHoverable={false} scroll={{ x: logType === "log-base" ? 1112 : 1060, y: tableBodyHeight }} tableLayout="fixed" locale={{ emptyText: "暂无匹配的日志记录" }} />
          {tableScrollbar.thumbHeight > 0 && (
            <div className="prototype-floating-scrollbar" style={{ top: tableHeaderHeight + 4, height: tableScrollbar.trackHeight }} aria-hidden="true">
              <div className="prototype-floating-scrollbar-thumb" style={{ height: tableScrollbar.thumbHeight, transform: `translateY(${tableScrollbar.thumbOffset}px)` }} onPointerDown={handleTableScrollbarPointerDown} />
            </div>
          )}
        </div>
      </div>
      <Modal open={Boolean(detailRecord)} width={800} centered className="audit-detail-modal access-register-modal" title="操作详情" closeIcon={<CloseOutlined size={20} />} footer={null} onCancel={() => setDetailRecord(null)}>
        {detailRecord && <div className="access-register-form-viewport">
          <div ref={auditDetailScrollRef} className="access-register-form-scroll audit-detail-scroll">
            <div className="audit-detail-content">
          <div className="audit-detail-summary">
            <div className="audit-detail-summary-item"><span className="audit-detail-summary-label"><Time size={16} aria-hidden="true" />操作时间：</span><span className="audit-detail-summary-value">{detailRecord.time}</span></div>
            <div className="audit-detail-summary-item"><span className="audit-detail-summary-label"><User size={16} aria-hidden="true" />操作人：</span><span className="audit-detail-summary-value">{detailRecord.user}</span></div>
            <div className="audit-detail-summary-item"><span className="audit-detail-summary-label"><AllApplication size={16} aria-hidden="true" />操作类型：</span><span className="audit-detail-summary-value">{detailRecord.action}</span></div>
            <div className="audit-detail-summary-item"><span className="audit-detail-summary-label"><Notes size={16} aria-hidden="true" />目标表：</span><span className="audit-detail-summary-value">{detailRecord.target}</span></div>
            <div className="audit-detail-summary-item is-detail"><span className="audit-detail-summary-label"><ViewList size={16} aria-hidden="true" />操作详情：</span><span className="audit-detail-summary-value">{detailRecord.detail}</span></div>
          </div>
          {detailRecord.records.length ? <>
            <div className="audit-detail-heading"><Typography.Text strong>涉及的数据记录</Typography.Text><span className="authorization-detail-heading-divider" aria-hidden="true" /><Typography.Text type="secondary">共 {detailRecord.records.length} 条</Typography.Text></div>
            <div className="audit-record-list">
              <div className="audit-record-header">
                <span>数据 ID</span>
                <span>操作</span>
              </div>
              {detailRecord.records.map((record) => <div className="audit-record-row" key={record.id}>
                <span className="audit-record-id">{record.id}</span>
                <Button className="prototype-action-button" type="link" size="small" onClick={() => viewRecordLogs(record.id)}>查看日志</Button>
              </div>)}
            </div>
          </> : <Empty className="audit-detail-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="该操作不涉及具体数据记录" />}
            </div>
          </div>
          {auditDetailScrollbar.thumbHeight > 0 && (
            <div className="access-register-floating-scrollbar" aria-hidden="true">
              <div className="access-register-floating-scrollbar-thumb" style={{ height: auditDetailScrollbar.thumbHeight, transform: `translateY(${auditDetailScrollbar.thumbOffset}px)` }} onPointerDown={handleAuditDetailScrollbarPointerDown} />
            </div>
          )}
        </div>}
      </Modal>
    </div>
  );
}

function AccessAppsWorkspace() {
  const [registeredAppRows, setRegisteredAppRows] = useState<RegisteredAppRow[]>(initialRegisteredAppRows);
  const [filters, setFilters] = useState({ app: "", appid: "", owner: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLElement | null>(null);
  const [operationScrollTop, setOperationScrollTop] = useState(0);
  const [operationColumnAtRight, setOperationColumnAtRight] = useState(false);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(50);
  const [tableBodyHeight, setTableBodyHeight] = useState(320);
  const [tableScrollbar, setTableScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm] = Form.useForm();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<RegisteredAppRow | null>(null);
  const [detailForm] = Form.useForm();
  const [appDeleteTarget, setAppDeleteTarget] = useState<RegisteredAppRow | null>(null);
  const [interfaceDetailOpen, setInterfaceDetailOpen] = useState(false);
  const [interfaceDetailApp, setInterfaceDetailApp] = useState<RegisteredAppRow | null>(null);
  const [interfaceRows, setInterfaceRows] = useState<InterfaceRecord[]>([]);
  const interfaceTableScrollRef = useRef<HTMLDivElement>(null);
  const interfaceTableBodyRef = useRef<HTMLElement | null>(null);
  const [interfaceTableHeaderHeight, setInterfaceTableHeaderHeight] = useState(48);
  const [interfaceTableBodyHeight, setInterfaceTableBodyHeight] = useState(300);
  const [interfaceTableScrollbar, setInterfaceTableScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [interfaceEditorOpen, setInterfaceEditorOpen] = useState(false);
  const [interfaceEditorMode, setInterfaceEditorMode] = useState<"create" | "edit">("create");
  const [interfaceEditorRecord, setInterfaceEditorRecord] = useState<InterfaceRecord | null>(null);
  const [interfaceEditorForm] = Form.useForm();
  const registerFormScrollRef = useRef<HTMLDivElement>(null);
  const detailFormScrollRef = useRef<HTMLDivElement>(null);
  const interfaceEditorFormScrollRef = useRef<HTMLDivElement>(null);
  const [registerScrollbar, setRegisterScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [associationOpen, setAssociationOpen] = useState(false);
  const [associationApp, setAssociationApp] = useState<{ key: React.Key; app: string } | null>(null);
  const [associationType, setAssociationType] = useState<AssociationType>("form");
  const [associationFilter, setAssociationFilter] = useState<AssociationFilter>("all");
  const [associationKeyword, setAssociationKeyword] = useState("");
  const [associationSelectedKeys, setAssociationSelectedKeys] = useState<string[]>([]);
  const [associationLinks, setAssociationLinks] = useState<Record<string, string[]>>({});
  const [associationPage, setAssociationPage] = useState(1);
  const [associationPageSize, setAssociationPageSize] = useState(10);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionApp, setPermissionApp] = useState<{ key: React.Key; app: string } | null>(null);
  const permissionMainScrollRef = useRef<HTMLElement>(null);
  const [permissionScrollbar, setPermissionScrollbar] = useState({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
  const [permissionMainTab, setPermissionMainTab] = useState<"base" | "other">("base");
  const [permissionKeyword, setPermissionKeyword] = useState("");
  const [expandedPermissionNavigationKeys, setExpandedPermissionNavigationKeys] = useState<string[]>(baseDataNavigationDefaultOpenKeys);
  const [permissionActiveTable, setPermissionActiveTable] = useState(defaultPermissionTableKey);
  const [permissionSelectedTables, setPermissionSelectedTables] = useState<string[]>([defaultPermissionTableKey]);
  const [permissionApiStates, setPermissionApiStates] = useState<Record<string, PermissionApiState>>({});
  const [expandedPermissionApis, setExpandedPermissionApis] = useState<PermissionApiKey[]>([]);
  const [permissionFields, setPermissionFields] = useState<Record<string, Record<PermissionApiKey, string[]>>>({});
  const [permissionFieldOptionsCollapsed, setPermissionFieldOptionsCollapsed] = useState<Record<string, boolean>>({});
  const [permissionConditions, setPermissionConditions] = useState<Record<string, Record<PermissionApiKey, PermissionCondition[]>>>({});
  const [permissionOtherSelected, setPermissionOtherSelected] = useState<string[]>(["send_notice"]);
  const [permissionActiveOtherService, setPermissionActiveOtherService] = useState("send_notice");
  const [collapsedPermissionOtherGroups, setCollapsedPermissionOtherGroups] = useState<string[]>([]);
  const [permissionNotificationChannels, setPermissionNotificationChannels] = useState<string[]>(["send_notification"]);
  const [permissionOtherInterfaceSelections, setPermissionOtherInterfaceSelections] = useState<Record<string, string[]>>({});
  const filteredRows = registeredAppRows.filter((row) => (
    (!appliedFilters.app || row.app.includes(appliedFilters.app))
    && (!appliedFilters.appid || row.appid.includes(appliedFilters.appid))
    && (!appliedFilters.owner || row.owner.includes(appliedFilters.owner))
  ));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const associationAppName = associationApp?.app || "";
  const defaultAssociationKeys = Object.values(associationRows).flat().filter((row) => row.linkedTo === associationAppName).map((row) => row.key);
  const persistedAssociationKeys = associationApp
    ? (associationLinks[String(associationApp.key)] ?? defaultAssociationKeys)
    : [];
  const linkedAssociationKeys = associationSelectedKeys;
  const associationSourceRows = associationRows[associationType];
  const filteredAssociationRows = associationSourceRows
    .filter((row) => {
      const isLinked = Boolean((row.linkedTo && row.linkedTo !== associationAppName) || persistedAssociationKeys.includes(row.key));
      if (associationFilter === "linked" && !isLinked) return false;
      if (associationFilter === "unlinked" && isLinked) return false;
      return `${row.name}${row.id}${row.owner}`.includes(associationKeyword.trim());
    });
  const pagedAssociationRows = filteredAssociationRows.slice((associationPage - 1) * associationPageSize, associationPage * associationPageSize);
  const selectableAssociationKeys = pagedAssociationRows.filter((row) => !row.linkedTo || row.linkedTo === associationAppName).map((row) => row.key);
  const allSelectableAssociationKeys = associationSourceRows.filter((row) => !row.linkedTo || row.linkedTo === associationAppName).map((row) => row.key);
  const allAssociationSelected = allSelectableAssociationKeys.length > 0 && allSelectableAssociationKeys.every((key) => associationSelectedKeys.includes(key));
  const someAssociationSelected = !allAssociationSelected && allSelectableAssociationKeys.some((key) => associationSelectedKeys.includes(key));
  const allAssociationPageSelected = selectableAssociationKeys.length > 0 && selectableAssociationKeys.every((key) => associationSelectedKeys.includes(key));
  const someAssociationPageSelected = !allAssociationPageSelected && selectableAssociationKeys.some((key) => associationSelectedKeys.includes(key));

  const defaultPermissionApiState = (): PermissionApiState => ({ create: false, delete: false, update: false, read: false });
  const activePermissionTable = permissionTables.find((table) => table.key === permissionActiveTable) || permissionTables[0];
  const activePermissionApiState = permissionApiStates[activePermissionTable.key] || defaultPermissionApiState();
  const filteredPermissionNavigation = filterPermissionNavigation(baseDataNavigation, permissionKeyword);
  const filteredPermissionOtherServices = permissionOtherServices.filter((service) => `${service.name}${service.description}`.includes(permissionKeyword.trim()));
  const permissionOtherGroups = Array.from(new Set(filteredPermissionOtherServices.map((service) => service.group)));
  const activePermissionOtherService = permissionOtherServices.find((service) => service.key === permissionActiveOtherService) || permissionOtherServices[0];
  const activePermissionOtherInterfaces = activePermissionOtherService.interfaces || [];
  const activePermissionOtherInterfaceKeys = permissionOtherInterfaceSelections[activePermissionOtherService.key] || [];
  const allOtherInterfacesSelected = activePermissionOtherInterfaces.length > 0 && activePermissionOtherInterfaceKeys.length === activePermissionOtherInterfaces.length;
  const someOtherInterfacesSelected = activePermissionOtherInterfaceKeys.length > 0 && !allOtherInterfacesSelected;
  const permissionSelectedCount = permissionSelectedTables.length;
  const permissionApiCount = Object.values(permissionApiStates).reduce((total, state) => total + Object.values(state).filter(Boolean).length, 0);

  const openPermissionModal = (row: RegisteredAppRow) => {
    setPermissionApp({ key: row.key, app: row.app });
    setPermissionMainTab("base");
    setPermissionKeyword("");
    setExpandedPermissionNavigationKeys(baseDataNavigationDefaultOpenKeys);
    setPermissionActiveTable(defaultPermissionTableKey);
    setPermissionSelectedTables([defaultPermissionTableKey]);
    setPermissionApiStates(Object.fromEntries(permissionTables.map((table) => [table.key, defaultPermissionApiState()])));
    setPermissionFields({});
    setPermissionFieldOptionsCollapsed({});
    setPermissionConditions({});
    setExpandedPermissionApis([]);
    setPermissionOtherSelected(["send_notice"]);
    setPermissionActiveOtherService("send_notice");
    setCollapsedPermissionOtherGroups([]);
    setPermissionNotificationChannels(["send_notification"]);
    setPermissionOpen(true);
  };

  const togglePermissionOtherGroupCollapse = (group: string) => {
    setCollapsedPermissionOtherGroups((current) => current.includes(group)
      ? current.filter((item) => item !== group)
      : [...current, group]);
  };

  const togglePermissionNavigationNode = (node: BaseDataNavigationMenuNode, checked: boolean) => {
    const tableKeys = getPermissionNavigationTableKeys(node);
    setPermissionSelectedTables((current) => checked
      ? Array.from(new Set([...current, ...tableKeys]))
      : current.filter((key) => !tableKeys.includes(key)));
    if (checked && tableKeys.length > 0) setPermissionActiveTable(tableKeys[0]);
  };

  const togglePermissionOtherService = (serviceKey: string, checked: boolean) => {
    setPermissionOtherSelected((current) => checked ? Array.from(new Set([...current, serviceKey])) : current.filter((key) => key !== serviceKey));
  };

  const togglePermissionOtherInterface = (serviceKey: string, interfaceKey: string, checked: boolean) => {
    setPermissionOtherInterfaceSelections((current) => {
      const selected = current[serviceKey] || [];
      const next = checked ? Array.from(new Set([...selected, interfaceKey])) : selected.filter((key) => key !== interfaceKey);
      togglePermissionOtherService(serviceKey, next.length > 0);
      return { ...current, [serviceKey]: next };
    });
  };

  const togglePermissionNotificationChannel = (channelKey: string, checked: boolean) => {
    setPermissionNotificationChannels((current) => {
      const next = checked ? Array.from(new Set([...current, channelKey])) : current.filter((key) => key !== channelKey);
      togglePermissionOtherService("send_notice", next.length > 0);
      return next;
    });
  };

  const toggleAllPermissionOtherInterfaces = (checked: boolean) => {
    const interfaceKeys = activePermissionOtherInterfaces.map((api) => api.key);
    setPermissionOtherInterfaceSelections((current) => ({
      ...current,
      [activePermissionOtherService.key]: checked ? interfaceKeys : [],
    }));
    togglePermissionOtherService(activePermissionOtherService.key, checked && interfaceKeys.length > 0);
  };

  const togglePermissionApi = (apiKey: PermissionApiKey, checked: boolean) => {
    setPermissionApiStates((current) => ({
      ...current,
      [activePermissionTable.key]: { ...(current[activePermissionTable.key] || defaultPermissionApiState()), [apiKey]: checked },
    }));
    setExpandedPermissionApis((current) => checked
      ? Array.from(new Set([...current, apiKey]))
      : current.filter((key) => key !== apiKey));
  };

  const togglePermissionApiExpansion = (apiKey: PermissionApiKey) => {
    setExpandedPermissionApis((current) => current.includes(apiKey)
      ? current.filter((key) => key !== apiKey)
      : [...current, apiKey]);
  };

  const togglePermissionField = (apiKey: PermissionApiKey, fieldKey: string, checked: boolean) => {
    setPermissionFields((current) => {
      const tableFields = current[activePermissionTable.key] || { create: [], delete: [], update: [], read: [] };
      const selected = tableFields[apiKey];
      return {
        ...current,
        [activePermissionTable.key]: {
          ...tableFields,
          [apiKey]: checked ? Array.from(new Set([...selected, fieldKey])) : selected.filter((key) => key !== fieldKey),
        },
      };
    });
  };

  const toggleAllPermissionFields = (apiKey: PermissionApiKey, checked: boolean) => {
    setPermissionFields((current) => {
      const tableFields = current[activePermissionTable.key] || { create: [], delete: [], update: [], read: [] };
      return {
        ...current,
        [activePermissionTable.key]: {
          ...tableFields,
          [apiKey]: checked ? activePermissionTable.fields.map((field) => field.key) : [],
        },
      };
    });
  };

  const addPermissionCondition = (apiKey: PermissionApiKey) => {
    setPermissionConditions((current) => {
      const tableConditions = current[activePermissionTable.key] || { create: [], delete: [], update: [], read: [] };
      return {
        ...current,
        [activePermissionTable.key]: {
          ...tableConditions,
          [apiKey]: [...tableConditions[apiKey], { field: activePermissionTable.fields[0]?.key || "", operator: "eq", value: "" }],
        },
      };
    });
  };

  const updatePermissionCondition = (apiKey: PermissionApiKey, index: number, patch: Partial<PermissionCondition>) => {
    setPermissionConditions((current) => {
      const tableConditions = current[activePermissionTable.key] || { create: [], delete: [], update: [], read: [] };
      return {
        ...current,
        [activePermissionTable.key]: {
          ...tableConditions,
          [apiKey]: tableConditions[apiKey].map((condition, conditionIndex) => conditionIndex === index ? { ...condition, ...patch } : condition),
        },
      };
    });
  };

  const removePermissionCondition = (apiKey: PermissionApiKey, index: number) => {
    setPermissionConditions((current) => {
      const tableConditions = current[activePermissionTable.key] || { create: [], delete: [], update: [], read: [] };
      return {
        ...current,
        [activePermissionTable.key]: {
          ...tableConditions,
          [apiKey]: tableConditions[apiKey].filter((_condition, conditionIndex) => conditionIndex !== index),
        },
      };
    });
  };

  const openAssociationModal = (row: RegisteredAppRow) => {
    const storedKeys = associationLinks[String(row.key)];
    const defaultLinkedKeys = Object.values(associationRows).flat().filter((item) => item.linkedTo === row.app).map((item) => item.key);
    setAssociationApp({ key: row.key, app: row.app });
    setAssociationSelectedKeys(storedKeys === undefined ? defaultLinkedKeys : storedKeys);
    setAssociationType("form");
    setAssociationFilter("all");
    setAssociationKeyword("");
    setAssociationPage(1);
    setAssociationOpen(true);
  };

  const openDetailModal = (row: RegisteredAppRow) => {
    setDetailApp(row);
    detailForm.setFieldsValue({
      app: row.app,
      status: row.status,
      appid: row.appid,
      appkey: row.appkey,
      owner: row.owner,
      phone: row.phone,
      externalApi: row.externalApi,
      description: row.description,
    });
    setDetailOpen(true);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setDetailApp(null);
    detailForm.resetFields();
  };

  const handleDetailSubmit = async () => {
    if (!detailApp) return;

    try {
      const values = await detailForm.validateFields();
      const updatedApp: RegisteredAppRow = {
        ...detailApp,
        ...values,
        // Credentials are displayed for reference only and must remain immutable.
        appid: detailApp.appid,
        appkey: detailApp.appkey,
      };
      setRegisteredAppRows((current) => current.map((row) => row.key === updatedApp.key ? updatedApp : row));
      message.success("应用信息已更新");
      closeDetailModal();
    } catch {
      // Ant Design keeps validation feedback in the form.
    }
  };

  const openInterfaceDetailModal = (row: RegisteredAppRow) => {
    setInterfaceDetailApp(row);
    setInterfaceRows((interfaceSeedRows[row.app] || fallbackInterfaceRows(row.app)).map((item) => ({ ...item })));
    setInterfaceDetailOpen(true);
  };

  const openInterfaceEditor = (record?: InterfaceRecord) => {
    const isEdit = Boolean(record);
    setInterfaceEditorMode(isEdit ? "edit" : "create");
    setInterfaceEditorRecord(record || null);
    interfaceEditorForm.resetFields();
    interfaceEditorForm.setFieldsValue(record ? {
      code: record.code,
      name: record.name,
      methods: record.methods,
      url: record.url,
      docs: record.docs,
      status: record.status,
    } : {
      methods: ["GET"],
      status: "启用",
    });
    setInterfaceEditorOpen(true);
  };

  const handleInterfaceEditorSubmit = async () => {
    try {
      const values = await interfaceEditorForm.validateFields();
      const record: InterfaceRecord = {
        key: interfaceEditorRecord?.key || `${interfaceDetailApp?.key || "app"}-${Date.now()}`,
        code: interfaceEditorRecord?.code || `API-${String(interfaceRows.length + 1).padStart(4, "0")}`,
        name: values.name,
        methods: values.methods,
        url: values.url,
        docs: values.docs,
        status: values.status,
      };
      setInterfaceRows((current) => interfaceEditorMode === "edit"
        ? current.map((item) => item.key === record.key ? record : item)
        : [...current, record]);
      setInterfaceEditorOpen(false);
      interfaceEditorForm.resetFields();
    } catch {
      // Ant Design keeps validation feedback in the form.
    }
  };

  const removeInterface = (key: string) => {
    setInterfaceRows((current) => current.filter((item) => item.key !== key));
    message.success("接口已删除");
  };

  const openAppDeleteConfirm = (row: RegisteredAppRow) => {
    setAppDeleteTarget(row);
  };

  const handleConfirmAppDelete = () => {
    if (!appDeleteTarget) return;
    setRegisteredAppRows((current) => current.filter((row) => row.key !== appDeleteTarget.key));
    setAppDeleteTarget(null);
    message.success("应用已删除");
  };

  const handleCopyApplication = async () => {
    if (!detailApp) return;
    const applicationInfo = [
      `应用名称：${detailApp.app}`,
      `appid：${detailApp.appid}`,
      `appkey：${detailApp.appkey}`,
    ].join("\n");
    try {
      await navigator.clipboard?.writeText(applicationInfo);
    } catch {
      // Clipboard permissions can be unavailable in preview environments.
    }
    message.success("已复制");
  };

  const toggleAssociationRow = (row: AssociationRow, checked: boolean) => {
    if (row.linkedTo && row.linkedTo !== associationAppName) return;
    setAssociationSelectedKeys((current) => checked ? Array.from(new Set([...current, row.key])) : current.filter((key) => key !== row.key));
  };

  const toggleAssociationPage = (checked: boolean) => {
    setAssociationSelectedKeys((current) => {
      if (checked) return Array.from(new Set([...current, ...selectableAssociationKeys]));
      return current.filter((key) => !selectableAssociationKeys.includes(key));
    });
  };

  const toggleAllAssociations = (checked: boolean) => {
    setAssociationSelectedKeys((current) => checked ? Array.from(new Set([...current, ...allSelectableAssociationKeys])) : current.filter((key) => !allSelectableAssociationKeys.includes(key)));
  };

  const handleAssociationConfirm = () => {
    if (!associationApp) return;
    setAssociationLinks((current) => ({ ...current, [String(associationApp.key)]: associationSelectedKeys }));
    setAssociationOpen(false);
  };

  const columns = [
    { title: "应用名称", dataIndex: "app", key: "app", width: 190, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "appid", dataIndex: "appid", key: "appid", width: 280, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "appkey", dataIndex: "appkey", key: "appkey", width: 170, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "应用负责人", dataIndex: "owner", key: "owner", width: 110 },
    { title: "应用负责人联系方式", dataIndex: "phone", key: "phone", width: 170, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "应用简介", dataIndex: "description", key: "description", width: 260, render: (value: string) => <OverflowTooltip title={value} className="prototype-table-cell-text">{value}</OverflowTooltip> },
    { title: "应用状态", dataIndex: "status", key: "status", width: 110, render: (value: string) => <Tag className={`access-app-status-tag ${value === "上架" ? "is-published" : "is-unpublished"}`} color={value === "上架" ? "success" : "default"}>{value}</Tag> },
  ];

  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    const emptyFilters = { app: "", appid: "", owner: "" };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };
  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean);
  useLayoutEffect(() => {
    if (!interfaceDetailOpen) return;

    let frameId = 0;
    let cleanup: (() => void) | undefined;
    const setupInterfaceTableScrollbar = () => {
      const tableScroll = interfaceTableScrollRef.current;
      const tableBody = tableScroll?.querySelector<HTMLElement>(".ant-table-body");
      if (!tableScroll || !tableBody) {
        frameId = window.requestAnimationFrame(setupInterfaceTableScrollbar);
        return;
      }
      interfaceTableBodyRef.current = tableBody;

      const updateInterfaceTableScrollbar = () => {
        const trackHeight = Math.max(0, tableBody.clientHeight - 8);
        const scrollableHeight = tableBody.scrollHeight - tableBody.clientHeight;
        if (trackHeight <= 0 || scrollableHeight <= 1) {
          setInterfaceTableScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * tableBody.clientHeight / tableBody.scrollHeight);
        const maxThumbOffset = trackHeight - thumbHeight;
        setInterfaceTableScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * tableBody.scrollTop / scrollableHeight,
        });
      };
      const updateInterfaceTableDimensions = () => {
        const tableHeader = tableScroll.querySelector<HTMLElement>(".ant-table-thead");
        const headerHeight = tableHeader?.getBoundingClientRect().height || 48;
        setInterfaceTableHeaderHeight(headerHeight);
        setInterfaceTableBodyHeight(Math.max(120, Math.floor(tableScroll.clientHeight - headerHeight)));
      };

      updateInterfaceTableScrollbar();
      updateInterfaceTableDimensions();
      tableBody.addEventListener("scroll", updateInterfaceTableScrollbar, { passive: true });
      const resizeObserver = new ResizeObserver(() => {
        updateInterfaceTableScrollbar();
        updateInterfaceTableDimensions();
      });
      resizeObserver.observe(tableScroll);
      cleanup = () => {
        tableBody.removeEventListener("scroll", updateInterfaceTableScrollbar);
        resizeObserver.disconnect();
        if (interfaceTableBodyRef.current === tableBody) interfaceTableBodyRef.current = null;
      };
    };

    setupInterfaceTableScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [interfaceDetailOpen, interfaceRows.length, interfaceTableBodyHeight]);

  const handleInterfaceTableScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const tableBody = interfaceTableBodyRef.current;
    const maxThumbOffset = interfaceTableScrollbar.trackHeight - interfaceTableScrollbar.thumbHeight;
    const scrollableHeight = tableBody ? tableBody.scrollHeight - tableBody.clientHeight : 0;
    if (!tableBody || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = tableBody.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      tableBody.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };
  useLayoutEffect(() => {
    const tableScroll = tableScrollRef.current;
    const tableBody = tableScroll?.querySelector<HTMLElement>(".ant-table-body");
    if (!tableScroll || !tableBody) return;
    tableBodyRef.current = tableBody;

    const syncOperationScroll = () => setOperationScrollTop(tableBody.scrollTop);
    const syncOperationColumnShadow = () => {
      const maxScrollLeft = tableScroll.scrollWidth - tableScroll.clientWidth;
      setOperationColumnAtRight(maxScrollLeft <= 1 || tableScroll.scrollLeft >= maxScrollLeft - 1);
    };
    const updateTableScrollbar = () => {
      const trackHeight = Math.max(0, tableBody.clientHeight - 8);
      const scrollableHeight = tableBody.scrollHeight - tableBody.clientHeight;
      if (trackHeight <= 0 || scrollableHeight <= 1) {
        setTableScrollbar({ trackHeight, thumbHeight: 0, thumbOffset: 0 });
        return;
      }
      const thumbHeight = Math.max(24, trackHeight * tableBody.clientHeight / tableBody.scrollHeight);
      const maxThumbOffset = trackHeight - thumbHeight;
      setTableScrollbar({
        trackHeight,
        thumbHeight,
        thumbOffset: maxThumbOffset * tableBody.scrollTop / scrollableHeight,
      });
    };
    const updateTableDimensions = () => {
      const tableHeader = tableScroll.querySelector<HTMLElement>(".ant-table-thead");
      const headerHeight = tableHeader?.getBoundingClientRect().height || 50;
      setTableHeaderHeight(headerHeight);
      setTableBodyHeight(Math.max(120, Math.floor(tableScroll.clientHeight - headerHeight)));
    };

    syncOperationScroll();
    syncOperationColumnShadow();
    updateTableScrollbar();
    updateTableDimensions();
    tableBody.addEventListener("scroll", syncOperationScroll, { passive: true });
    tableBody.addEventListener("scroll", updateTableScrollbar, { passive: true });
    tableScroll.addEventListener("scroll", syncOperationColumnShadow, { passive: true });
    const resizeObserver = new ResizeObserver(() => {
      syncOperationColumnShadow();
      updateTableScrollbar();
      updateTableDimensions();
    });
    resizeObserver.observe(tableScroll);

    return () => {
      tableBody.removeEventListener("scroll", syncOperationScroll);
      tableBody.removeEventListener("scroll", updateTableScrollbar);
      tableScroll.removeEventListener("scroll", syncOperationColumnShadow);
      resizeObserver.disconnect();
      if (tableBodyRef.current === tableBody) tableBodyRef.current = null;
    };
  }, [pagedRows.length, currentPage, pageSize, tableBodyHeight]);
  const handleTableScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const tableBody = tableBodyRef.current;
    const maxThumbOffset = tableScrollbar.trackHeight - tableScrollbar.thumbHeight;
    const scrollableHeight = tableBody ? tableBody.scrollHeight - tableBody.clientHeight : 0;
    if (!tableBody || maxThumbOffset <= 0 || scrollableHeight <= 0) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = tableBody.scrollTop;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      tableBody.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbOffset) * scrollableHeight;
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };
  const handleOperationColumnWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const tableBody = tableBodyRef.current;
    if (!tableBody) return;

    const maxScrollTop = tableBody.scrollHeight - tableBody.clientHeight;
    const nextScrollTop = Math.min(Math.max(0, tableBody.scrollTop + event.deltaY), maxScrollTop);
    if (nextScrollTop === tableBody.scrollTop) return;

    event.preventDefault();
    tableBody.scrollTop = nextScrollTop;
  };
  const openRegisterModal = () => {
    registerForm.resetFields();
    registerForm.setFieldsValue({ externalApi: "否", status: "上架" });
    setRegisterOpen(true);
  };
  const handleRegisterSubmit = async () => {
    try {
      await registerForm.validateFields();
      setRegisterOpen(false);
      registerForm.resetFields();
    } catch {
      // Ant Design keeps validation feedback in the form.
    }
  };
  useLayoutEffect(() => {
    if (!registerOpen && !detailOpen && !interfaceEditorOpen) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    const activeFormScrollRef = detailOpen
      ? detailFormScrollRef
      : interfaceEditorOpen
        ? interfaceEditorFormScrollRef
        : registerFormScrollRef;
    const setupRegisterScrollbar = () => {
      const list = activeFormScrollRef.current;
      if (!list) {
        frameId = window.requestAnimationFrame(setupRegisterScrollbar);
        return;
      }

      const updateRegisterScrollbar = () => {
        const trackHeight = Math.max(0, list.clientHeight - 8);
        const scrollableHeight = Math.max(0, list.scrollHeight - list.clientHeight);
        if (trackHeight <= 0 || scrollableHeight <= 0) {
          setRegisterScrollbar({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * list.clientHeight / list.scrollHeight);
        const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);
        setRegisterScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * (list.scrollTop / scrollableHeight),
        });
      };

      list.addEventListener("scroll", updateRegisterScrollbar, { passive: true });
      updateRegisterScrollbar();
      resizeObserver = new ResizeObserver(updateRegisterScrollbar);
      resizeObserver.observe(list);
      if (list.firstElementChild) resizeObserver.observe(list.firstElementChild);

      return () => {
        list.removeEventListener("scroll", updateRegisterScrollbar);
        resizeObserver?.disconnect();
      };
    };

    const cleanup = setupRegisterScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [registerOpen, detailOpen, interfaceEditorOpen]);
  const handleRegisterScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const list = (detailOpen
      ? detailFormScrollRef
      : interfaceEditorOpen
        ? interfaceEditorFormScrollRef
        : registerFormScrollRef).current;
    const maxThumbOffset = registerScrollbar.trackHeight - registerScrollbar.thumbHeight;
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
    if (!permissionOpen) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    const setupPermissionScrollbar = () => {
      const list = permissionMainScrollRef.current;
      if (!list) {
        frameId = window.requestAnimationFrame(setupPermissionScrollbar);
        return;
      }

      const updatePermissionScrollbar = () => {
        const trackHeight = Math.max(0, list.clientHeight - 8);
        const scrollableHeight = Math.max(0, list.scrollHeight - list.clientHeight);
        if (trackHeight <= 0 || scrollableHeight <= 0) {
          setPermissionScrollbar({ trackHeight: 0, thumbHeight: 0, thumbOffset: 0 });
          return;
        }
        const thumbHeight = Math.max(24, trackHeight * list.clientHeight / list.scrollHeight);
        const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);
        setPermissionScrollbar({
          trackHeight,
          thumbHeight,
          thumbOffset: maxThumbOffset * (list.scrollTop / scrollableHeight),
        });
      };

      list.addEventListener("scroll", updatePermissionScrollbar, { passive: true });
      updatePermissionScrollbar();
      resizeObserver = new ResizeObserver(updatePermissionScrollbar);
      resizeObserver.observe(list);
      if (list.lastElementChild) resizeObserver.observe(list.lastElementChild);

      return () => {
        list.removeEventListener("scroll", updatePermissionScrollbar);
        resizeObserver?.disconnect();
      };
    };

    const cleanup = setupPermissionScrollbar();
    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [permissionOpen, permissionMainTab, permissionActiveTable, permissionActiveOtherService, expandedPermissionApis, permissionApiStates, permissionFields, permissionConditions]);

  const handlePermissionScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const list = permissionMainScrollRef.current;
    const maxThumbOffset = permissionScrollbar.trackHeight - permissionScrollbar.thumbHeight;
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

  return (
    <div className="prototype-table-workspace access-apps-workspace">
      <div className="prototype-table-filterbar">
        <Space size={14} wrap>
          <label className="prototype-filter-item"><span>应用名称</span><Input value={filters.app} onChange={(event) => updateFilter("app", event.target.value)} placeholder="请输入" /></label>
          <label className="prototype-filter-item"><span>appid</span><Input value={filters.appid} onChange={(event) => updateFilter("appid", event.target.value)} placeholder="请输入" /></label>
          <label className="prototype-filter-item"><span>应用负责人</span><Input value={filters.owner} onChange={(event) => updateFilter("owner", event.target.value)} placeholder="请输入" /></label>
          <Space size={8}>
            <Button type="primary" icon={<SearchOutlined size={16} />} onClick={handleSearch}>查询</Button>
            {hasAppliedFilters && (
              <Tooltip title="清空查询">
                <Button type="default" aria-label="清空查询" icon={<ClearOutlined size={16} />} onClick={handleClearSearch} />
              </Tooltip>
            )}
          </Space>
        </Space>
      </div>
      <div className="prototype-table-toolbar">
        <Space size={8}>
          <Button type="primary" icon={<PlusOutlined size={16} />} onClick={openRegisterModal}>应用注册</Button>
          <Button className="access-delete-record-button" type="default" icon={<DeleteOutlined size={16} />}>删除记录</Button>
        </Space>
      </div>
      <div className="prototype-table-container">
        <div ref={tableScrollRef} className="prototype-table-scroll" style={{ "--access-apps-table-body-height": `${tableBodyHeight}px` } as React.CSSProperties}>
          <Table
            columns={columns}
            dataSource={pagedRows}
            pagination={false}
            rowHoverable={false}
            scroll={{ x: 1890, y: tableBodyHeight }}
            tableLayout="fixed"
          />
        </div>
        <div className={`access-fixed-operation-column${operationColumnAtRight ? " is-at-right" : ""}`} aria-label="操作列" onWheel={handleOperationColumnWheel}>
          <div className="access-fixed-operation-header">操作</div>
          <div className="access-fixed-operation-body">
            <div className="access-fixed-operation-rows" style={{ transform: `translateY(-${operationScrollTop}px)` }}>
              {pagedRows.map((row) => (
                <div className="access-fixed-operation-row" key={row.key}>
                  <Space className="prototype-action-buttons" size={12}>
                    {row.actions.map((action) => <Button className="prototype-action-button" type="link" size="small" key={action} onClick={action === "详情" ? () => openDetailModal(row) : action === "关联业务表" ? () => openAssociationModal(row) : action === "授权" ? () => openPermissionModal(row) : action === "接口明细" ? () => openInterfaceDetailModal(row) : undefined}>{action}</Button>)}
                    {row.status === "下架" && <Button className="prototype-action-button" type="link" danger size="small" key="delete" onClick={() => openAppDeleteConfirm(row)}>删除</Button>}
                  </Space>
                </div>
              ))}
            </div>
          </div>
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
      </div>
        <div className="prototype-table-pagination access-apps-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredRows.length}
            pageSizeOptions={[10, 20, 50]}
            showSizeChanger={{ suffixIcon: <DownOutlined size={16} /> }}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, nextPageSize) => {
              setCurrentPage(page);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      <Modal
        open={registerOpen}
        width={720}
        centered
        className="access-register-modal"
        title="应用注册"
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setRegisterOpen(false)}
        onOk={handleRegisterSubmit}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <div className="access-register-form-viewport">
          <div ref={registerFormScrollRef} className="access-register-form-scroll">
            <Form form={registerForm} layout="vertical" requiredMark initialValues={{ externalApi: "否", status: "上架" }}>
              <ApplicationFormFields />
            </Form>
          </div>
          {registerScrollbar.thumbHeight > 0 && (
            <div className="access-register-floating-scrollbar" aria-hidden="true">
              <div
                className="access-register-floating-scrollbar-thumb"
                style={{ height: registerScrollbar.thumbHeight, transform: `translateY(${registerScrollbar.thumbOffset}px)` }}
                onPointerDown={handleRegisterScrollbarPointerDown}
              />
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(appDeleteTarget)}
        width={480}
        centered
        className="destructive-confirm-modal"
        title="删除应用"
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setAppDeleteTarget(null)}
        onOk={handleConfirmAppDelete}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true, style: { width: 88 } }}
        cancelButtonProps={{ style: { width: 88 } }}
      >
        <Typography.Paragraph className="modal-title-hint">
          确认删除{appDeleteTarget?.app || ""}吗
        </Typography.Paragraph>
      </Modal>
      <Modal
        open={interfaceDetailOpen}
        width={1200}
        centered
        className="interface-detail-modal"
        title={(
          <div className="interface-detail-title-stack">
            <span>接口明细</span>
            <Typography.Text className="modal-title-hint interface-detail-title-hint" type="secondary">管理该应用对外提供的接口，支持启用 / 停用 / 修改 / 删除</Typography.Text>
          </div>
        )}
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setInterfaceDetailOpen(false)}
        footer={null}
      >
        <div className="interface-detail-content">
          <div className="interface-detail-toolbar">
            <Button type="primary" icon={<PlusOutlined size={16} />} onClick={() => openInterfaceEditor()}>新增接口</Button>
          </div>
          <div ref={interfaceTableScrollRef} className="interface-detail-table-scroll prototype-table-scroll">
            <Table
              className="interface-detail-table"
              rowKey="key"
              dataSource={interfaceRows}
              pagination={false}
              scroll={{ x: 1160, y: interfaceTableBodyHeight }}
              columns={[
              { title: "序号", dataIndex: "code", key: "code", width: 120, render: (value: string) => <Typography.Text className="interface-code-text">{value}</Typography.Text> },
              { title: "接口名称", dataIndex: "name", key: "name", width: 160, render: (value: string) => <Typography.Text className="interface-name-text">{value}</Typography.Text> },
              { title: "调用方式", dataIndex: "methods", key: "methods", width: 140, render: (methods: string[]) => <Typography.Text className="interface-method-text">{methods.join("、")}</Typography.Text> },
              { title: "接口地址", dataIndex: "url", key: "url", width: 400, render: (value: string) => <OverflowTooltip title={value} className="interface-url-text">{value}</OverflowTooltip> },
              { title: "状态", dataIndex: "status", key: "status", width: 100, render: (value: InterfaceStatus) => <Tag className={`interface-status-tag ${value === "启用" ? "is-enabled" : "is-disabled"}`}>{value}</Tag> },
              { title: "操作", key: "actions", width: 240, render: (_: unknown, record: InterfaceRecord) => <Space size={12}><Button type="link" size="small" onClick={() => message.info(record.docs || "接口文档暂未配置")}>查看接口文档</Button><Button type="link" size="small" onClick={() => openInterfaceEditor(record)}>修改</Button><Popconfirm title="确定删除该接口吗？" okText="删除" cancelText="取消" onConfirm={() => removeInterface(record.key)}><Button type="link" size="small">删除</Button></Popconfirm></Space> },
              ]}
            />
            {interfaceTableScrollbar.thumbHeight > 0 && (
              <div className="prototype-floating-scrollbar" style={{ top: interfaceTableHeaderHeight + 4, height: interfaceTableScrollbar.trackHeight }} aria-hidden="true">
                <div
                  className="prototype-floating-scrollbar-thumb"
                  style={{ height: interfaceTableScrollbar.thumbHeight, transform: `translateY(${interfaceTableScrollbar.thumbOffset}px)` }}
                  onPointerDown={handleInterfaceTableScrollbarPointerDown}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        open={interfaceEditorOpen}
        width={560}
        centered
        className="interface-editor-modal access-register-modal"
        title={interfaceEditorMode === "edit" ? "修改接口" : "新增接口"}
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setInterfaceEditorOpen(false)}
        onOk={handleInterfaceEditorSubmit}
        okText="保存"
        cancelText="取消"
      >
        <div className="access-register-form-viewport">
          <div ref={interfaceEditorFormScrollRef} className="access-register-form-scroll">
            <Form form={interfaceEditorForm} layout="vertical" requiredMark>
              <Form.Item label="序号" name="code"><Input disabled placeholder="系统自动生成" /></Form.Item>
              <Form.Item label="接口名称" name="name" rules={[{ required: true, message: "请输入接口名称" }]}><Input placeholder="请输入接口名称" /></Form.Item>
              <Form.Item label="调用方式" name="methods" rules={[{ required: true, message: "请选择调用方式" }]}><Checkbox.Group options={["GET", "POST"]} /></Form.Item>
              <Form.Item label="接口地址" name="url" rules={[{ required: true, message: "请输入完整的接口调用地址" }, { type: "url", message: "请输入有效的接口地址" }]}><Input placeholder="请输入完整的接口调用地址" /></Form.Item>
              <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择接口状态" }]}><Radio.Group options={[{ value: "启用", label: "启用" }, { value: "停用", label: "停用" }]} /></Form.Item>
              <Form.Item label="接口文档" name="docs"><Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} placeholder="请填写接口文档地址或说明" /></Form.Item>
            </Form>
          </div>
          {registerScrollbar.thumbHeight > 0 && (
            <div className="access-register-floating-scrollbar" aria-hidden="true">
              <div
                className="access-register-floating-scrollbar-thumb"
                style={{ height: registerScrollbar.thumbHeight, transform: `translateY(${registerScrollbar.thumbOffset}px)` }}
                onPointerDown={handleRegisterScrollbarPointerDown}
              />
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={detailOpen}
        width={720}
        centered
        className="access-register-modal"
        title="应用详情"
        closeIcon={<CloseOutlined size={20} />}
        onCancel={closeDetailModal}
        footer={(
          <div className="access-app-detail-footer">
            <Button onClick={handleCopyApplication}>复制应用信息</Button>
            <Space>
              <Button style={{ width: 88 }} onClick={closeDetailModal}>取消</Button>
              <Button type="primary" style={{ width: 88 }} onClick={handleDetailSubmit}>确定</Button>
            </Space>
          </div>
        )}
      >
        <div className="access-register-form-viewport">
          <div ref={detailFormScrollRef} className="access-register-form-scroll">
            <Form form={detailForm} layout="vertical" requiredMark>
              <ApplicationFormFields />
            </Form>
          </div>
          {registerScrollbar.thumbHeight > 0 && (
            <div className="access-register-floating-scrollbar" aria-hidden="true">
              <div
                className="access-register-floating-scrollbar-thumb"
                style={{ height: registerScrollbar.thumbHeight, transform: `translateY(${registerScrollbar.thumbOffset}px)` }}
                onPointerDown={handleRegisterScrollbarPointerDown}
              />
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={permissionOpen}
        width={1180}
        className="data-permission-modal"
        style={{ top: 40, paddingBottom: 0 }}
        title="配置数据权限"
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setPermissionOpen(false)}
        footer={(
          <div className="data-permission-footer">
            <Typography.Text type="secondary">已选 {permissionSelectedCount} 张基础表，操作数据权限 {permissionApiCount} 项，其他服务权限 {permissionOtherSelected.length} 项</Typography.Text>
            <Space>
              <Button style={{ width: 88 }} onClick={() => setPermissionOpen(false)}>取消</Button>
              <Button type="primary" style={{ width: 88 }} onClick={() => setPermissionOpen(false)}>保存授权</Button>
            </Space>
          </div>
        )}
      >
        <div className="data-permission-content">
          <aside className="data-permission-sidebar">
            <Tabs
              activeKey={permissionMainTab}
              onChange={(key) => setPermissionMainTab(key as "base" | "other")}
              items={[{ key: "base", label: "基础数据表" }, { key: "other", label: "其他服务" }]}
            />
            <div className="data-permission-sidebar-content">
              <Input
                allowClear
                prefix={<SearchOutlined size={16} />}
                placeholder={permissionMainTab === "base" ? "搜索表名 / 数据域" : "搜索服务 / 应用"}
                value={permissionKeyword}
                onChange={(event) => {
                  const keyword = event.target.value;
                  setPermissionKeyword(keyword);
                  setExpandedPermissionNavigationKeys(keyword ? getPermissionNavigationExpandedKeys(filterPermissionNavigation(baseDataNavigation, keyword)) : baseDataNavigationDefaultOpenKeys);
                }}
              />
              {permissionMainTab === "base" ? (
                filteredPermissionNavigation.length > 0 ? (
                  <BaseDataNavigationMenu
                    className="data-permission-navigation-menu"
                    nodes={permissionNavigationMenuNodes(filteredPermissionNavigation)}
                    selectedKey={permissionActiveTable}
                    openKeys={expandedPermissionNavigationKeys}
                    onOpenChange={setExpandedPermissionNavigationKeys}
                    onSelect={(key) => {
                      if (permissionTables.some((table) => table.key === key)) setPermissionActiveTable(key);
                    }}
                    renderLeading={(node) => {
                      const tableKeys = getPermissionNavigationTableKeys(node);
                      const selectedCount = tableKeys.filter((key) => permissionSelectedTables.includes(key)).length;
                      return (
                        <Checkbox
                          aria-label={`选择${node.title}`}
                          checked={tableKeys.length > 0 && selectedCount === tableKeys.length}
                          indeterminate={selectedCount > 0 && selectedCount < tableKeys.length}
                          onChange={(event) => togglePermissionNavigationNode(node, event.target.checked)}
                        />
                      );
                    }}
                    renderTrailing={(node) => {
                      if (node.kind !== "table") return null;
                      const selectedApiLabels = permissionApis.filter((api) => permissionApiStates[node.key]?.[api.key]).map((api) => api.label);
                      return (
                        <Tooltip title={selectedApiLabels.length > 0 ? selectedApiLabels.join("、") : "暂无已勾选权限"}>
                          <span className="data-permission-api-count">{selectedApiLabels.length}</span>
                        </Tooltip>
                      );
                    }}
                    selectParent={false}
                    showActions={false}
                  />
                ) : <div className="data-permission-search-empty">暂无搜索结果</div>
              ) : (
                <div className="data-permission-sidebar-list">
                  {permissionOtherGroups.length > 0 ? permissionOtherGroups.map((group) => {
                  const groupServices = filteredPermissionOtherServices.filter((service) => service.group === group);
                  const isGroupCollapsed = collapsedPermissionOtherGroups.includes(group);
                  return (
                    <div className="data-permission-other-group" key={group}>
                      <div className="data-permission-other-group-item" onClick={() => togglePermissionOtherGroupCollapse(group)}>
                        <Tooltip title={isGroupCollapsed ? "展开" : "收起"}>
                          <Button
                            type="text"
                            size="small"
                            aria-label={isGroupCollapsed ? `展开${group}` : `收起${group}`}
                            className={`data-permission-domain-toggle${isGroupCollapsed ? " is-collapsed" : ""}`}
                            icon={<DownOutlined size={16} />}
                            onClick={(event) => {
                              event.stopPropagation();
                              togglePermissionOtherGroupCollapse(group);
                            }}
                          />
                        </Tooltip>
                        <Typography.Text className="data-permission-domain-title">{group}</Typography.Text>
                      </div>
                      {!isGroupCollapsed && groupServices.map((service) => {
                        const isActive = service.key === permissionActiveOtherService;
                        const isEnabled = permissionOtherSelected.includes(service.key);
                        return (
                          <div
                            className={`data-permission-other-service-item${isActive ? " is-active" : ""}`}
                            key={service.key}
                            onClick={() => setPermissionActiveOtherService(service.key)}
                          >
                            <OverflowTooltip className="data-permission-other-service-name" title={service.name}>{service.name}</OverflowTooltip>
                            {service.key === "send_notice" ? (
                              <span className={`data-permission-other-service-status${isEnabled ? " is-enabled" : ""}`}>{isEnabled ? "已启用" : "未启用"}</span>
                            ) : (
                              <span className="data-permission-other-service-count">{service.interfaces?.length || 0}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                  }) : <div className="data-permission-search-empty">暂无搜索结果</div>}
                </div>
              )}
            </div>
          </aside>
          <section ref={permissionMainScrollRef} className="data-permission-main">
            {permissionMainTab === "other" ? (
              <>
                <div className="data-permission-main-heading">
                  <div>
                    <Typography.Title level={4}>{activePermissionOtherService.name}</Typography.Title>
                    {activePermissionOtherService.key !== "send_notice" && <Typography.Text className="data-permission-other-hint">勾选允许当前应用调用的接口，已停用的接口无法被调用</Typography.Text>}
                  </div>
                </div>
                {activePermissionOtherService.key === "send_notice" ? (
                  <div className="data-permission-other-config">
                    <div className="data-permission-config-block">
                      <div className="data-permission-block-heading">
                        <div className="data-permission-block-title-stack">
                          <Typography.Title level={5}>允许的通知渠道</Typography.Title>
                        </div>
                      </div>
                      <div className="data-permission-field-grid">
                        {notificationChannels.map((channel) => (
                          <Checkbox
                            checked={permissionNotificationChannels.includes(channel.key)}
                            key={channel.key}
                            onChange={(event) => togglePermissionNotificationChannel(channel.key, event.target.checked)}
                          >
                            {channel.label}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="data-permission-other-config">
                    <div className="data-permission-config-block">
                      <div className="data-permission-block-heading">
                        <div className="data-permission-block-title-stack">
                          <Typography.Title level={5}>接口列表</Typography.Title>
                        </div>
                        <div className="data-permission-selection-summary">
                          <Checkbox
                            aria-label="全选接口"
                            checked={allOtherInterfacesSelected}
                            indeterminate={someOtherInterfacesSelected}
                            onChange={(event) => toggleAllPermissionOtherInterfaces(event.target.checked)}
                          />
                          <Typography.Text className="data-permission-field-count" type="secondary">已选 {activePermissionOtherInterfaceKeys.length} / {activePermissionOtherInterfaces.length}</Typography.Text>
                        </div>
                      </div>
                      <div className="data-permission-other-interface-list">
                        {activePermissionOtherInterfaces.map((api) => (
                          <div className="data-permission-other-interface-item" key={api.key}>
                            <Checkbox
                              checked={activePermissionOtherInterfaceKeys.includes(api.key)}
                              onChange={(event) => togglePermissionOtherInterface(activePermissionOtherService.key, api.key, event.target.checked)}
                            />
                            <div className="data-permission-other-interface-main">
                              <div className="data-permission-other-interface-title-row">
                                <Typography.Text strong>{api.name}</Typography.Text>
                                <div className="data-permission-other-interface-methods">
                                  {api.methods.map((method) => <Tag className={`data-permission-other-interface-method is-${method.toLowerCase()}`} key={method}>{method}</Tag>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="data-permission-main-heading">
                  <div>
                    <Typography.Title level={4}>{activePermissionTable.name}</Typography.Title>
                    <Typography.Text type="secondary">{activePermissionTable.fields.length} 个字段 · {activePermissionTable.rows} 行数据</Typography.Text>
                  </div>
                </div>
                <div className="data-permission-api-list">
                  {permissionApis.map((api) => {
                    const isSelected = activePermissionApiState[api.key];
                    const isExpanded = isSelected && expandedPermissionApis.includes(api.key);
                    const apiFields = permissionFields[activePermissionTable.key]?.[api.key] || [];
                    const apiConditions = permissionConditions[activePermissionTable.key]?.[api.key] || [];
                    const fieldOptionsKey = `${activePermissionTable.key}:${api.key}`;
                    const areFieldOptionsCollapsed = Boolean(permissionFieldOptionsCollapsed[fieldOptionsKey]);
                    const allFieldsSelected = activePermissionTable.fields.length > 0 && apiFields.length === activePermissionTable.fields.length;
                    const someFieldsSelected = apiFields.length > 0 && !allFieldsSelected;

                    return (
                      <div className={`data-permission-api-list-item${isSelected ? " is-selected" : ""}`} key={api.key}>
                        <div className="data-permission-api-list-row" onClick={() => isSelected && togglePermissionApiExpansion(api.key)}>
                          <Checkbox checked={isSelected} onClick={(event) => event.stopPropagation()} onChange={(event) => togglePermissionApi(api.key, event.target.checked)} />
                          <Typography.Text strong>{api.label}</Typography.Text>
                          <Tooltip title={isSelected ? (isExpanded ? "收起" : "展开") : "请先勾选权限"}>
                            <Button
                              type="text"
                              size="small"
                              aria-label={`${isExpanded ? "收起" : "展开"}${api.label}`}
                              className={`data-permission-api-list-toggle${isExpanded ? "" : " is-collapsed"}`}
                              disabled={!isSelected}
                              icon={<DownOutlined size={16} />}
                              onClick={(event) => {
                                event.stopPropagation();
                                togglePermissionApiExpansion(api.key);
                              }}
                            />
                          </Tooltip>
                        </div>
                        {isExpanded && (
                          <div className="data-permission-api-list-content">
                            {api.key !== "create" && (
                                <div className={`data-permission-config-block data-permission-condition-config-block${apiConditions.length === 0 ? " is-empty" : ""}`}>
                                <div className="data-permission-block-heading">
                                  <div className="data-permission-block-title-stack">
                                    <Typography.Title level={5}>数据过滤条件</Typography.Title>
                                    {apiConditions.length === 0 && <Typography.Text className="data-permission-block-hint" type="secondary">不添加条件表示全部数据可用</Typography.Text>}
                                  </div>
                                  <Button className="data-permission-add-condition" type="link" size="small" icon={<PlusOutlined size={14} />} onClick={() => addPermissionCondition(api.key)}>添加条件</Button>
                                </div>
                                {apiConditions.map((condition, index) => (
                                  <Flex className="data-permission-condition-row" gap={8} key={`${condition.field}-${index}`}>
                                    <Select suffixIcon={<DownOutlined size={16} />} value={condition.field} options={activePermissionTable.fields.map((field) => ({ value: field.key, label: field.label }))} onChange={(value) => updatePermissionCondition(api.key, index, { field: value })} />
                                    <Select suffixIcon={<DownOutlined size={16} />} value={condition.operator} options={[{ value: "eq", label: "等于" }, { value: "ne", label: "不等于" }, { value: "in", label: "包含" }, { value: "gt", label: "大于" }, { value: "lt", label: "小于" }]} onChange={(value) => updatePermissionCondition(api.key, index, { operator: value })} />
                                    <Input value={condition.value} placeholder="请输入条件值" onChange={(event) => updatePermissionCondition(api.key, index, { value: event.target.value })} />
                                    <Tooltip title="删除条件">
                                      <Button
                                        type="text"
                                        aria-label="删除条件"
                                        className="data-permission-condition-delete"
                                        icon={<DeleteOutlined size={16} />}
                                        onClick={() => removePermissionCondition(api.key, index)}
                                      />
                                    </Tooltip>
                                  </Flex>
                                ))}
                              </div>
                            )}
                            {api.key !== "delete" && (
                              <div className={`data-permission-config-block data-permission-field-config-block${areFieldOptionsCollapsed ? " is-collapsed" : ""}`}>
                                <div className="data-permission-block-heading">
                                  <div className="data-permission-block-title-stack">
                                    <Typography.Title level={5}>{api.key === "read" ? "可见字段" : "可编辑字段"}</Typography.Title>
                                  </div>
                                  <div className="data-permission-field-heading-actions">
                                    <div className="data-permission-selection-summary">
                                      <Checkbox
                                        aria-label={`全选${api.label}字段`}
                                        checked={allFieldsSelected}
                                        indeterminate={someFieldsSelected}
                                        onChange={(event) => toggleAllPermissionFields(api.key, event.target.checked)}
                                      />
                                      <Typography.Text className="data-permission-field-count" type="secondary">已选 {apiFields.length} / {activePermissionTable.fields.length}</Typography.Text>
                                    </div>
                                    <Button
                                      type="link"
                                      className="data-permission-toggle-fields"
                                      onClick={() => setPermissionFieldOptionsCollapsed((current) => ({ ...current, [fieldOptionsKey]: !areFieldOptionsCollapsed }))}
                                    >
                                      {areFieldOptionsCollapsed ? "展开字段" : "收起字段"}
                                    </Button>
                                  </div>
                                </div>
                                {!areFieldOptionsCollapsed && (
                                  <div className="data-permission-field-grid data-permission-base-field-grid">
                                    {activePermissionTable.fields.map((field) => <Checkbox key={field.key} checked={apiFields.includes(field.key)} onChange={(event) => togglePermissionField(api.key, field.key, event.target.checked)}>{field.label}</Checkbox>)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
          {permissionScrollbar.thumbHeight > 0 && (
            <div className="access-register-floating-scrollbar" aria-hidden="true">
              <div
                className="access-register-floating-scrollbar-thumb"
                style={{ height: permissionScrollbar.thumbHeight, transform: `translateY(${permissionScrollbar.thumbOffset}px)` }}
                onPointerDown={handlePermissionScrollbarPointerDown}
              />
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={associationOpen}
        width={800}
        centered
        className="association-modal"
        title={(
          <div className="interface-detail-title-stack">
            <span>关联业务表</span>
            <Typography.Text className="modal-title-hint interface-detail-title-hint" type="secondary">应用：{associationAppName}</Typography.Text>
          </div>
        )}
        closeIcon={<CloseOutlined size={20} />}
        onCancel={() => setAssociationOpen(false)}
        footer={(
          <div className="association-modal-footer">
            <Checkbox checked={allAssociationSelected} indeterminate={someAssociationSelected} disabled={allSelectableAssociationKeys.length === 0} onChange={(event) => toggleAllAssociations(event.target.checked)}>
              <span className="association-selection-summary">全选所有数据，已选 {associationSelectedKeys.length} 项</span>
            </Checkbox>
            <Space size={8}>
              <Button style={{ width: 88 }} onClick={() => setAssociationOpen(false)}>取消</Button>
              <Button type="primary" style={{ width: 88 }} onClick={handleAssociationConfirm}>确定</Button>
            </Space>
          </div>
        )}
      >
        <div className="association-modal-content">
          <Tabs
            className="association-primary-tabs"
            activeKey={associationType}
            onChange={(key) => {
              setAssociationType(key as AssociationType);
              setAssociationPage(1);
            }}
            items={[{ key: "form", label: "表单" }, { key: "approval", label: "审批" }]}
          />
          <Tabs
            className="association-secondary-tabs"
            activeKey={associationFilter}
            type="card"
            onChange={(key) => {
              setAssociationFilter(key as AssociationFilter);
              setAssociationPage(1);
            }}
            tabBarExtraContent={(
              <Input
                allowClear
                className="association-search-input"
                prefix={<SearchOutlined size={16} />}
                value={associationKeyword}
                onChange={(event) => {
                  setAssociationKeyword(event.target.value);
                  setAssociationPage(1);
                }}
                placeholder="搜索业务表名称或ID"
              />
            )}
            items={[{ key: "all", label: "全部" }, { key: "unlinked", label: "未关联" }, { key: "linked", label: "已关联" }]}
          />
          <AssociationTable rows={pagedAssociationRows} type={associationType} appName={associationAppName} selectedKeys={associationSelectedKeys} linkedKeys={linkedAssociationKeys} allSelected={allAssociationPageSelected} someSelected={someAssociationPageSelected} onSelectPage={toggleAssociationPage} onSelectRow={toggleAssociationRow} />
          <div className="association-pagination-row">
            <Pagination
              current={associationPage}
              pageSize={associationPageSize}
              total={filteredAssociationRows.length}
              pageSizeOptions={[10, 20, 50]}
              showSizeChanger={{ suffixIcon: <DownOutlined size={16} /> }}
              showQuickJumper
              onChange={(page, nextPageSize) => {
                setAssociationPage(page);
                setAssociationPageSize(nextPageSize);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AccessCenterPage() {
  const params = useParams();
  const navigate = useNavigate();
  const candidate = (params["*"] || "").split("/").pop() || "apps";
  const active = (accessKeys.includes(candidate as AccessKey) ? candidate : "apps") as AccessKey;

  return (
    <AppShell className="access-shell" title="接入中心" hideSiderHeading breadcrumb={[]} sideItems={menuItems} activeSideKey={active} onSideChange={(key) => navigate(`/access/${key}`)}>
      <div className="access-page">
        {active === "apps" && <AccessAppsWorkspace />}
        {active === "authview" && <AuthorizationViewWorkspace />}
        {active === "log-base" && <AuditLogWorkspace logType="log-base" />}
        {active === "log-table" && <AuditLogWorkspace logType="log-table" />}
        {active === "log-auth" && <AuditLogWorkspace logType="log-auth" />}
      </div>
    </AppShell>
  );
}
