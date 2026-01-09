// Comprehensive EPP status code mapping with Chinese translations
// Supports IANA URL-based status codes and registry-specific variations

export interface StatusInfo {
  chinese: string
  english: string
  description: string
  category: "active" | "prohibited" | "pending" | "informational" | "unknown"
  color: "green" | "red" | "yellow" | "blue" | "gray"
}

// Complete EPP status code mappings
const STATUS_MAPPINGS: Record<string, StatusInfo> = {
  // Active/OK statuses
  "ok": { chinese: "正常", english: "OK", description: "域名状态正常", category: "active", color: "green" },
  "active": { chinese: "活跃", english: "Active", description: "域名处于活跃状态", category: "active", color: "green" },
  
  // Client prohibitions
  "clientdeleteprohibited": { chinese: "禁止删除", english: "Client Delete Prohibited", description: "注册商禁止删除", category: "prohibited", color: "red" },
  "clienthold": { chinese: "客户端暂停", english: "Client Hold", description: "注册商暂停解析", category: "prohibited", color: "red" },
  "clientrenewprohibited": { chinese: "禁止续费", english: "Client Renew Prohibited", description: "注册商禁止续费", category: "prohibited", color: "red" },
  "clienttransferprohibited": { chinese: "禁止转移", english: "Client Transfer Prohibited", description: "注册商禁止转移", category: "prohibited", color: "red" },
  "clientupdateprohibited": { chinese: "禁止更新", english: "Client Update Prohibited", description: "注册商禁止更新", category: "prohibited", color: "red" },
  
  // Server prohibitions
  "serverdeleteprohibited": { chinese: "注册局禁止删除", english: "Server Delete Prohibited", description: "注册局禁止删除", category: "prohibited", color: "red" },
  "serverhold": { chinese: "注册局暂停", english: "Server Hold", description: "注册局暂停解析", category: "prohibited", color: "red" },
  "serverrenewprohibited": { chinese: "注册局禁止续费", english: "Server Renew Prohibited", description: "注册局禁止续费", category: "prohibited", color: "red" },
  "servertransferprohibited": { chinese: "注册局禁止转移", english: "Server Transfer Prohibited", description: "注册局禁止转移", category: "prohibited", color: "red" },
  "serverupdateprohibited": { chinese: "注册局禁止更新", english: "Server Update Prohibited", description: "注册局禁止更新", category: "prohibited", color: "red" },
  
  // Pending statuses
  "pendingcreate": { chinese: "等待创建", english: "Pending Create", description: "域名正在创建中", category: "pending", color: "yellow" },
  "pendingdelete": { chinese: "等待删除", english: "Pending Delete", description: "域名即将被删除", category: "pending", color: "yellow" },
  "pendingrenew": { chinese: "等待续费", english: "Pending Renew", description: "域名正在续费中", category: "pending", color: "yellow" },
  "pendingrestore": { chinese: "等待恢复", english: "Pending Restore", description: "域名正在恢复中", category: "pending", color: "yellow" },
  "pendingtransfer": { chinese: "等待转移", english: "Pending Transfer", description: "域名正在转移中", category: "pending", color: "yellow" },
  "pendingupdate": { chinese: "等待更新", english: "Pending Update", description: "域名正在更新中", category: "pending", color: "yellow" },
  "pendingverification": { chinese: "等待验证", english: "Pending Verification", description: "域名等待验证", category: "pending", color: "yellow" },
  
  // Redemption
  "redemptionperiod": { chinese: "赎回期", english: "Redemption Period", description: "域名处于赎回期", category: "pending", color: "yellow" },
  
  // Informational
  "addperiod": { chinese: "新注册期", english: "Add Period", description: "域名新注册宽限期", category: "informational", color: "blue" },
  "autorenewperiod": { chinese: "自动续费期", english: "Auto Renew Period", description: "域名自动续费期", category: "informational", color: "blue" },
  "renewperiod": { chinese: "续费期", english: "Renew Period", description: "域名续费宽限期", category: "informational", color: "blue" },
  "transferperiod": { chinese: "转移期", english: "Transfer Period", description: "域名转移宽限期", category: "informational", color: "blue" },
  "inactive": { chinese: "未激活", english: "Inactive", description: "域名未配置DNS", category: "informational", color: "blue" },
  "linked": { chinese: "已关联", english: "Linked", description: "域名已关联DNS记录", category: "informational", color: "blue" },
  
  // Registry-specific statuses
  "registered": { chinese: "已注册", english: "Registered", description: "域名已被注册", category: "active", color: "green" },
  "available": { chinese: "可注册", english: "Available", description: "域名可以注册", category: "informational", color: "green" },
  "reserved": { chinese: "保留", english: "Reserved", description: "域名被保留", category: "prohibited", color: "yellow" },
  "premium": { chinese: "溢价域名", english: "Premium", description: "溢价域名", category: "informational", color: "blue" },
  "blocked": { chinese: "已屏蔽", english: "Blocked", description: "域名被屏蔽", category: "prohibited", color: "red" },
  
  // CNNIC specific
  "serverreserved": { chinese: "注册局保留", english: "Server Reserved", description: "注册局保留域名", category: "prohibited", color: "red" },
  "clientreserved": { chinese: "注册商保留", english: "Client Reserved", description: "注册商保留域名", category: "prohibited", color: "red" },
}

// Normalize status string for lookup
function normalizeStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/https?:\/\/[^\s#]+#/g, '') // Remove IANA URLs
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
    .trim()
}

// Get full status info
export function getStatusInfo(status: string): StatusInfo {
  const normalized = normalizeStatus(status)
  
  if (STATUS_MAPPINGS[normalized]) {
    return STATUS_MAPPINGS[normalized]
  }
  
  // Try partial matching
  for (const [key, value] of Object.entries(STATUS_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }
  
  // Default unknown status
  return {
    chinese: status,
    english: status,
    description: "未知状态",
    category: "unknown",
    color: "gray"
  }
}

// Translate status to Chinese
export function translateStatus(status: string): string {
  return getStatusInfo(status).chinese
}

// Get status color
export function getStatusColor(status: string): string {
  return getStatusInfo(status).color
}

// Get status category
export function getStatusCategory(status: string): string {
  const info = getStatusInfo(status)
  const categoryNames: Record<string, string> = {
    active: "活跃状态",
    prohibited: "禁止操作",
    pending: "等待处理",
    informational: "信息状态",
    unknown: "未知"
  }
  return categoryNames[info.category] || "未知"
}

export default STATUS_MAPPINGS
