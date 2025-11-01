export const STATUS_MAPPING: Record<string, string> = {
  // Delete statuses
  addperiod: "新增期",
  clientdeleteprohibited: "客户端删除禁止",
  pendingdelete: "删除待定",
  redemptionperiod: "赎回期",
  serverdeleteprohibited: "服务器删除禁止",

  // Transfer statuses
  clienttransferprohibited: "客户端转移禁止",
  pendingtransfer: "转移待定",
  servertransferprohibited: "服务器转移禁止",

  // Update statuses
  clientupdateprohibited: "客户端更新禁止",
  serverupdateprohibited: "服务器更新禁止",

  // Renewal statuses
  clientrenewprohibited: "客户端续费禁止",
  serverrenewprohibited: "服务器续费禁止",
  renewperiod: "续费期",

  // Lock statuses
  clienthold: "客户端冻结",
  serverhold: "服务器冻结",

  // Active/Inactive statuses
  active: "活跃",
  inactive: "非活跃",
  ok: "正常",
  registered: "已注册",
  notregistered: "未注册",

  // Other statuses
  associated: "关联",
  prohibited: "禁止",
  restricted: "受限",
  connect: "连接",
  autorenew: "自动续费",
  linked: "已链接",
  delegated: "已委托",
  verified: "已验证",
  preregistered: "预注册",
  transferred: "已转移",
  forceexpired: "强制过期",
  grace: "宽限期",
  pending: "待定",
}

export function translateStatus(status: string): string {
  let normalized = status
    .toLowerCase()
    .replace(/^https?:\/\/[^/]*\//gi, "") // Remove URL prefix
    .replace(/[.\-\s]/g, "") // Remove dots, hyphens, spaces
    .trim()

  const hashIndex = normalized.indexOf("#")
  if (hashIndex !== -1) {
    normalized = normalized.substring(hashIndex + 1)
  }

  return STATUS_MAPPING[normalized] || status // Return original if not found
}

export function translateStatuses(statuses: string[]): string[] {
  return statuses.map(translateStatus).filter(Boolean) // Filter out empty strings
}

export function getStatusColor(status: string): "red" | "yellow" | "orange" | "green" | "blue" {
  const normalized = status.toLowerCase().replace(/[.\-\s]/g, "")

  if (normalized.includes("prohibited") || normalized.includes("hold")) return "red"
  if (normalized.includes("grace") || normalized.includes("period")) return "yellow"
  if (normalized.includes("transfer")) return "orange"
  if (normalized.includes("active") || normalized.includes("ok")) return "green"
  return "blue"
}
