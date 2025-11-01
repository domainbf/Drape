/**
 * Normalizes field names from WHOIS responses to standard keys
 * Handles multiple languages: English, French, Spanish, German, Portuguese, Chinese
 */

// Multi-language field name mappings
const FIELD_MAPPINGS: Record<string, string> = {
  // Domain name variations
  "domain name": "domainname",
  "nom de domaine": "domainname",
  "nombre de dominio": "domainname",
  domänenname: "domainname",
  "nome de domínio": "domainname",
  域名: "domainname",

  // Creation date variations
  "date de création": "created",
  "creation date": "created",
  "created date": "created",
  "fecha de creación": "created",
  erstellungsdatum: "created",
  "data de criação": "created",
  注册时间: "created",
  创建时间: "created",
  "registered date": "created",
  "registration date": "created",
  "registration time": "created",

  // Update/modification date variations
  "dernière modification": "updated",
  "last modified": "updated",
  "last updated": "updated",
  "modified date": "updated",
  "última modificación": "updated",
  "letzte änderung": "updated",
  "última modificação": "updated",
  更新时间: "updated",
  最后更新: "updated",
  修改时间: "updated",
  "changed date": "updated",
  "update date": "updated",

  // Expiration date variations
  "date d'expiration": "expires",
  "expiration date": "expires",
  "expiry date": "expires",
  "fecha de expiración": "expires",
  ablaufdatum: "expires",
  "data de expiração": "expires",
  过期时间: "expires",
  到期时间: "expires",
  "expire date": "expires",
  "expires on": "expires",

  // Registrar variations
  registrar: "registrar",
  "bureau d'enregistrement": "registrar",
  registrador: "registrar",
  registrierung: "registrar",
  注册商: "registrar",

  // Status variations
  status: "status",
  statut: "status",
  estado: "status",
  zustand: "status",
  状态: "status",

  // Nameserver variations
  nameserver: "nameserver",
  "name server": "nameserver",
  "serveur de noms": "nameserver",
  "servidor de nombres": "nameserver",
  namenserver: "nameserver",
  "servidor de nomes": "nameserver",
  域名服务器: "nameserver",
  nserver: "nameserver",

  // Contact information variations
  "registrant name": "registrantname",
  "nom du titulaire": "registrantname",
  "nombre del titular": "registrantname",
  inhabername: "registrantname",
  "nome do titular": "registrantname",
  注册人: "registrantname",

  "admin name": "adminname",
  "nom de l'administrateur": "adminname",
  "nombre del administrador": "adminname",
  administratorname: "adminname",
  "nome do administrador": "adminname",
  管理联系人: "adminname",

  "tech name": "techname",
  "nom technique": "techname",
  "nombre técnico": "techname",
  "technischer name": "techname",
  "nome técnico": "techname",
  技术联系人: "techname",

  // Email variations
  email: "email",
  courriel: "email",
  "correo electrónico": "email",
  "e-mail": "email",
  电子邮件: "email",

  // Organization variations
  organization: "organization",
  organisation: "organization",
  organización: "organization",
  组织: "organization",

  // Phone variations
  phone: "phone",
  téléphone: "phone",
  teléfono: "phone",
  telefon: "phone",
  电话: "phone",

  // Address variations
  address: "address",
  adresse: "address",
  dirección: "address",
  地址: "address",

  // Postal code variations
  "code postal": "postalcode",
  "postal code": "postalcode",
  "código postal": "postalcode",
  postleitzahl: "postalcode",
  "código postal": "postalcode",
  邮编: "postalcode",

  // City variations
  city: "city",
  ville: "city",
  ciudad: "city",
  stadt: "city",
  cidade: "city",
  城市: "city",

  // Country variations
  country: "country",
  pays: "country",
  país: "country",
  land: "country",
  国家: "country",
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
  const normalized = cleaned.replace(/[\s\-_]/g, "")

  // Check if the normalized version matches any mapping
  for (const [key, value] of Object.entries(FIELD_MAPPINGS)) {
    const normalizedKey = key.replace(/[\s\-_]/g, "")
    if (normalized === normalizedKey) {
      return value
    }
  }

  // Return the normalized version if no mapping found
  return normalized
}
