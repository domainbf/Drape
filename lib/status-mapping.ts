// Reference: https://www.iana.org/assignments/epp-status-codes/epp-status-codes.xhtml

export const STATUS_MAPPING: Record<string, string> = {
  // ===== EPP Status Codes (IANA Standard) =====
  // Delete statuses
  addperiod: "新增期",
  clientdeleteprohibited: "客户端删除禁止",
  serverdeleteprohibited: "服务器删除禁止",
  pendingdelete: "删除待定",
  redemptionperiod: "赎回期",

  // Transfer statuses
  clienttransferprohibited: "客户端转移禁止",
  servertransferprohibited: "服务器转移禁止",
  pendingtransfer: "转移待定",

  // Update statuses
  clientupdateprohibited: "客户端更新禁止",
  serverupdateprohibited: "服务器更新禁止",

  // Renewal statuses
  clientrenewprohibited: "客户端续费禁止",
  serverrenewprohibited: "服务器续费禁止",
  renewperiod: "续费期",

  // Lock/Hold statuses
  clienthold: "客户端冻结",
  serverhold: "服务器冻结",

  // Active/Registered statuses
  active: "活跃",
  ok: "正常",
  registered: "已注册",
  associated: "关联",

  // Inactive/Available statuses
  inactive: "非活跃",
  available: "可用",
  notregistered: "未注册",

  // Restore statuses
  pendingrestore: "恢复待定",
  autorenew: "自动续费",

  // Other common statuses
  connect: "连接",
  delegated: "已委托",
  linked: "已链接",
  verified: "已验证",
  prohibited: "禁止",
  restricted: "受限",
  preregistered: "预注册",
  transferred: "已转移",
  forceexpired: "强制过期",
  grace: "宽限期",
  pending: "待定",
  expired: "已过期",
  suspended: "已暂停",
  cancelled: "已取消",
  removed: "已删除",
  locked: "已锁定",
  unlocked: "已解锁",

  // ===== Common variations and aliases =====
  "no-object": "无对象",
  "object-not-found": "对象未找到",
  "rate-limited": "速率限制",
  "service-unavailable": "服务不可用",
  "malformed-request": "请求格式错误",
  "server-busy": "服务器忙",
  "system-error": "系统错误",
  "unauthorized": "未授权",
  "authentication-failed": "认证失败",
  "invalid-authorization-information": "无效的授权信息",
  "object-exists": "对象已存在",
  "parameter-value-range-exceeded": "参数值范围超出",
  "policy-violation": "策略违规",
  "object-status-prohibits-operation": "对象状态禁止操作",
  "object-association-prohibits-operation": "对象关联禁止操作",

  // ===== Specific domain registry codes =====
  "renewal-prohibited": "续费禁止",
  "transfer-locked": "转移已锁定",
  "whois-opt-out": "WHOIS隐私保护",
  "auto-renewal": "自动续费",
  "premium-renewal": "溢价续费",
}

export function translateStatus(status: string): string {
  let normalized = status
    .toLowerCase()
    .replace(/^https?:\/\/[^/]*\//gi, "") // Remove URL prefix (e.g., https://icann.org/epp#status/clientDeleteProhibited)
    .replace(/[.\-\s_]/g, "") // Remove dots, hyphens, spaces, underscores
    .trim()

  // Handle hash fragments (e.g., #clientDeleteProhibited)
  const hashIndex = normalized.indexOf("#")
  if (hashIndex !== -1) {
    normalized = normalized.substring(hashIndex + 1)
  }

  return STATUS_MAPPING[normalized] || status // Return original if not found
}

export function translateStatuses(statuses: string[]): string[] {
  return statuses
    .map(translateStatus)
    .filter((s) => s && s.length > 0) // Filter out empty strings
}

export function getStatusColor(status: string): "red" | "yellow" | "orange" | "green" | "blue" {
  const normalized = status.toLowerCase().replace(/[.\-\s_]/g, "")

  // Critical/Problem statuses
  if (
    normalized.includes("prohibited") ||
    normalized.includes("hold") ||
    normalized.includes("suspended") ||
    normalized.includes("locked")
  )
    return "red"

  // Warning statuses
  if (normalized.includes("grace") || normalized.includes("period") || normalized.includes("pending")) return "yellow"

  // Transfer/risky statuses
  if (normalized.includes("transfer")) return "orange"

  // Success statuses
  if (
    normalized.includes("active") ||
    normalized.includes("ok") ||
    normalized.includes("verified") ||
    normalized.includes("registered")
  )
    return "green"

  // Default
  return "blue"
}

export function getStatusCategory(status: string): string {
  const normalized = status.toLowerCase().replace(/[.\-\s_]/g, "")

  if (normalized.includes("delete")) return "删除"
  if (normalized.includes("transfer")) return "转移"
  if (normalized.includes("update")) return "更新"
  if (normalized.includes("renew")) return "续费"
  if (normalized.includes("hold")) return "冻结"
  if (normalized.includes("restore")) return "恢复"
  if (normalized.includes("grace")) return "宽限期"
  if (normalized.includes("pending")) return "待定"
  if (normalized.includes("active") || normalized.includes("ok")) return "活跃"
  if (normalized.includes("inactive")) return "非活跃"

  return "其他"
}
