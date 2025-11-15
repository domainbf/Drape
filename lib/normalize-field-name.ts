/**
 * Normalizes field names from WHOIS responses to standard keys
 * Handles multiple languages: English, French, Spanish, German, Portuguese, Chinese, Russian, Korean, Japanese
 * Supports country-specific formats from China, Russia, EU, Asia-Pacific registries
 */

const FIELD_MAPPINGS: Record<string, string> = {
  // ===== Domain name variations =====
  "domain name": "domainname",
  "nom de domaine": "domainname",
  "nombre de dominio": "domainname",
  "domänenname": "domainname",
  "nome de domínio": "domainname",
  "域名": "domainname",
  "доменное имя": "domainname",
  "도메인이름": "domainname",
  "ドメイン名": "domainname",

  // ===== Creation date variations =====
  "date de création": "created",
  "creation date": "created",
  "created date": "created",
  "fecha de creación": "created",
  "erstellungsdatum": "created",
  "data de criação": "created",
  "注册时间": "created",
  "创建时间": "created",
  "registered date": "created",
  "registration date": "created",
  "registration time": "created",
  "date of registration": "created",
  "дата регистрации": "created",
  "등록일": "created",
  "登録日": "created",
  "registration date (yyyy/mm/dd)": "created",

  // ===== Update/modification date variations =====
  "dernière modification": "updated",
  "last modified": "updated",
  "last updated": "updated",
  "modified date": "updated",
  "última modificación": "updated",
  "letzte änderung": "updated",
  "última modificação": "updated",
  "更新时间": "updated",
  "最后更新": "updated",
  "修改时间": "updated",
  "changed date": "updated",
  "update date": "updated",
  "date of latest modification": "updated",
  "дата последнего изменения": "updated",
  "날짜 업데이트": "updated",
  "更新日時": "updated",
  "last changed": "updated",

  // ===== Expiration date variations =====
  "date d'expiration": "expires",
  "expiration date": "expires",
  "expiry date": "expires",
  "fecha de expiración": "expires",
  "ablaufdatum": "expires",
  "data de expiração": "expires",
  "过期时间": "expires",
  "到期时间": "expires",
  "expire date": "expires",
  "expires on": "expires",
  "expiry date (yyyy/mm/dd)": "expires",
  "дата истечения": "expires",
  "만료일": "expires",
  "満期日": "expires",
  "registrar expiration date": "expires",
  "registry expiration date": "expires",

  // ===== Registrar variations =====
  "registrar": "registrar",
  "bureau d'enregistrement": "registrar",
  "registrador": "registrar",
  "registrierung": "registrar",
  "注册商": "registrar",
  "регистратор": "registrar",
  "등록기관": "registrar",
  "レジストラ": "registrar",
  "sponsoring registrar": "registrar",
  "registrar of domain": "registrar",
  "domain registrar": "registrar",
  "registrar name": "registrar",

  // ===== Status variations =====
  "status": "status",
  "statut": "status",
  "estado": "status",
  "zustand": "status",
  "状态": "status",
  "статус": "status",
  "상태": "status",
  "ドメイン状態": "status",
  "domain status": "status",
  "registrar status": "status",

  // ===== Nameserver variations =====
  "nameserver": "nameserver",
  "name server": "nameserver",
  "serveur de noms": "nameserver",
  "servidor de nombres": "nameserver",
  "namenserver": "nameserver",
  "servidor de nomes": "nameserver",
  "域名服务器": "nameserver",
  "nserver": "nameserver",
  "сервер имён": "nameserver",
  "네임서버": "nameserver",
  "ネームサーバー": "nameserver",
  "dns name": "nameserver",
  "dns server": "nameserver",
  "host name": "nameserver",

  // ===== Contact information - Registrant =====
  "registrant name": "registrantname",
  "nom du titulaire": "registrantname",
  "nombre del titular": "registrantname",
  "inhabername": "registrantname",
  "nome do titular": "registrantname",
  "注册人": "registrantname",
  "registrant contact name": "registrantname",
  "owner name": "registrantname",
  "domain holder": "registrantname",
  "фамилия": "registrantname",
  "소유자이름": "registrantname",
  "所有者名": "registrantname",

  // ===== Contact information - Admin =====
  "admin name": "adminname",
  "nom de l'administrateur": "adminname",
  "nombre del administrador": "adminname",
  "administratorname": "adminname",
  "nome do administrador": "adminname",
  "管理联系人": "adminname",
  "administrative contact name": "adminname",
  "admin contact": "adminname",
  "администратор": "adminname",
  "관리자이름": "adminname",
  "管理者名": "adminname",

  // ===== Contact information - Tech =====
  "tech name": "techname",
  "nom technique": "techname",
  "nombre técnico": "techname",
  "technischer name": "techname",
  "nome técnico": "techname",
  "技术联系人": "techname",
  "technical contact name": "techname",
  "tech contact": "techname",
  "технический контакт": "techname",
  "기술담당자이름": "techname",
  "技術担当者名": "techname",

  // ===== Email variations =====
  "email": "email",
  "courriel": "email",
  "correo electrónico": "email",
  "e-mail": "email",
  "电子邮件": "email",
  "электронная почта": "email",
  "이메일": "email",
  "メールアドレス": "email",

  // ===== Organization variations =====
  "organization": "organization",
  "organisation": "organization",
  "organización": "organization",
  "组织": "organization",
  "организация": "organization",
  "조직": "organization",
  "組織名": "organization",

  // ===== Phone variations =====
  "phone": "phone",
  "telephone": "phone",
  "téléphone": "phone",
  "teléfono": "phone",
  "telefon": "phone",
  "电话": "phone",
  "телефон": "phone",
  "전화": "phone",
  "電話番号": "phone",
  "phone number": "phone",

  // ===== Address variations =====
  "address": "address",
  "adresse": "address",
  "dirección": "address",
  "地址": "address",
  "адрес": "address",
  "주소": "address",
  "住所": "address",

  // ===== Postal code variations =====
  "code postal": "postalcode",
  "postal code": "postalcode",
  "código postal": "postalcode",
  "postleitzahl": "postalcode",
  "邮编": "postalcode",
  "почтовый индекс": "postalcode",
  "우편번호": "postalcode",
  "郵便番号": "postalcode",

  // ===== City variations =====
  "city": "city",
  "ville": "city",
  "ciudad": "city",
  "stadt": "city",
  "cidade": "city",
  "城市": "city",
  "город": "city",
  "도시": "city",
  "市区町村": "city",

  // ===== Country variations =====
  "country": "country",
  "pays": "country",
  "país": "country",
  "land": "country",
  "国家": "country",
  "страна": "country",
  "국가": "country",
  "国": "country",

  // ===== State/Province variations =====
  "state": "state",
  "province": "state",
  "état": "state",
  "provincia": "state",
  "bundesland": "state",
  "estado": "state",
  "州": "state",
  "область": "state",
  "시도": "state",

  // ===== DNSSEC variations =====
  "dnssec": "dnssec",
  "dnssec status": "dnssec",
  "dnssec enabled": "dnssec",
  "dnssec signed": "dnssec",
}

export function normalizeFieldName(line: string): string {
  // Extract the field name part (before the colon)
  const colonIndex = line.indexOf(":")
  const fieldName = colonIndex === -1 ? line : line.substring(0, colonIndex)

  // Clean the field name: lowercase, trim, remove extra spaces
  const cleaned = fieldName.toLowerCase().trim().replace(/\s+/g, " ")

  // Check if we have a direct mapping for this field name
  if (FIELD_MAPPINGS[cleaned]) {
    return FIELD_MAPPINGS[cleaned]
  }

  // If no direct mapping, normalize by removing spaces, hyphens, underscores
  const normalized = cleaned.replace(/[\s_-]/g, "")

  // Check if the normalized version matches any mapping
  for (const [key, value] of Object.entries(FIELD_MAPPINGS)) {
    const normalizedKey = key.replace(/[\s_-]/g, "")
    if (normalized === normalizedKey) {
      return value
    }
  }

  // Return the normalized version if no mapping found
  return normalized
}
