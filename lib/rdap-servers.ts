// RDAP Bootstrap Service for Domain Name Space

export interface RdapBootstrapEntry {
  tlds: string[]
  servers: string[]
}

// Based on IANA RDAP Bootstrap Service Registry
export const RDAP_BOOTSTRAP: RdapBootstrapEntry[] = [
  {
    tlds: ["com", "net"],
    servers: ["https://rdap.verisign.com/com/v1/", "https://rdap.verisign.com/net/v1/"],
  },
  {
    tlds: ["org"],
    servers: ["https://rdap.publicinterestregistry.org/rdap/"],
  },
  {
    tlds: ["info"],
    servers: ["https://rdap.afilias-srs.net/rdap/info/"],
  },
  {
    tlds: ["biz"],
    servers: ["https://rdap.nic.biz/"],
  },
  {
    tlds: ["name"],
    servers: ["https://tld-rdap.verisign.com/name/v1/"],
  },
  {
    tlds: ["pro"],
    servers: ["https://rdap.nic.pro/"],
  },
  {
    tlds: ["mobi"],
    servers: ["https://rdap.nic.mobi/"],
  },
  {
    tlds: ["asia"],
    servers: ["https://rdap.nic.asia/"],
  },
  {
    tlds: ["tel"],
    servers: ["https://rdap.nic.tel/"],
  },
  {
    tlds: ["travel"],
    servers: ["https://rdap.nic.travel/"],
  },
  {
    tlds: ["xxx"],
    servers: ["https://rdap.nic.xxx/"],
  },
  {
    tlds: ["cat"],
    servers: ["https://rdap.nic.cat/"],
  },
  {
    tlds: ["jobs"],
    servers: ["https://rdap.nic.jobs/"],
  },
  {
    tlds: ["post"],
    servers: ["https://rdap.nic.post/"],
  },
  {
    tlds: ["aero"],
    servers: ["https://rdap.nic.aero/"],
  },
  {
    tlds: ["coop"],
    servers: ["https://rdap.nic.coop/"],
  },
  {
    tlds: ["museum"],
    servers: ["https://rdap.nic.museum/"],
  },
  {
    tlds: ["edu"],
    servers: ["https://rdap.educause.edu/"],
  },
  {
    tlds: ["gov"],
    servers: ["https://rdap.nic.gov/"],
  },
  {
    tlds: ["int"],
    servers: ["https://rdap.iana.org/"],
  },
  {
    tlds: ["arpa"],
    servers: ["https://rdap.iana.org/"],
  },
  {
    tlds: ["app", "dev", "page", "how", "new", "google", "youtube", "gmail", "docs", "drive", "chrome", "android"],
    servers: ["https://www.registry.google/rdap/"],
  },
  {
    tlds: ["xyz"],
    servers: ["https://rdap.centralnic.com/xyz/"],
  },
  {
    tlds: ["top"],
    servers: ["https://rdap.nic.top/"],
  },
  {
    tlds: ["online", "site", "tech", "store", "space", "website", "press", "host", "fun"],
    servers: ["https://rdap.centralnic.com/"],
  },
  {
    tlds: ["club"],
    servers: ["https://rdap.nic.club/"],
  },
  {
    tlds: ["blog"],
    servers: ["https://rdap.nic.blog/"],
  },
  {
    tlds: ["cloud"],
    servers: ["https://rdap.nic.cloud/"],
  },
  {
    tlds: ["io"],
    servers: ["https://rdap.nic.io/"],
  },
  {
    tlds: ["ai"],
    servers: ["https://rdap.nic.ai/"],
  },
  {
    tlds: ["co"],
    servers: ["https://rdap.nic.co/"],
  },
  {
    tlds: ["me"],
    servers: ["https://rdap.nic.me/"],
  },
  {
    tlds: ["tv"],
    servers: ["https://rdap.nic.tv/"],
  },
  {
    tlds: ["cc"],
    servers: ["https://rdap.nic.cc/"],
  },
  // Country Code TLDs
  {
    tlds: ["uk"],
    servers: ["https://rdap.nominet.uk/"],
  },
  {
    tlds: ["de"],
    servers: ["https://rdap.denic.de/"],
  },
  {
    tlds: ["fr"],
    servers: ["https://rdap.nic.fr/"],
  },
  {
    tlds: ["it"],
    servers: ["https://rdap.nic.it/"],
  },
  {
    tlds: ["es"],
    servers: ["https://rdap.nic.es/"],
  },
  {
    tlds: ["nl"],
    servers: ["https://rdap.sidn.nl/"],
  },
  {
    tlds: ["be"],
    servers: ["https://rdap.dns.be/"],
  },
  {
    tlds: ["ch", "li"],
    servers: ["https://rdap.nic.ch/"],
  },
  {
    tlds: ["at"],
    servers: ["https://rdap.nic.at/"],
  },
  {
    tlds: ["se"],
    servers: ["https://rdap.nic.se/"],
  },
  {
    tlds: ["no"],
    servers: ["https://rdap.norid.no/"],
  },
  {
    tlds: ["dk"],
    servers: ["https://rdap.dk-hostmaster.dk/"],
  },
  {
    tlds: ["fi"],
    servers: ["https://rdap.fi/"],
  },
  {
    tlds: ["pl"],
    servers: ["https://rdap.dns.pl/"],
  },
  {
    tlds: ["cz"],
    servers: ["https://rdap.nic.cz/"],
  },
  {
    tlds: ["ru", "su"],
    servers: ["https://rdap.tcinet.ru/"],
  },
  {
    tlds: ["ua"],
    servers: ["https://rdap.ua/"],
  },
  {
    tlds: ["jp"],
    servers: ["https://rdap.jprs.jp/"],
  },
  {
    tlds: ["cn"],
    servers: ["https://rdap.cnnic.cn/"],
  },
  {
    tlds: ["in"],
    servers: ["https://rdap.registry.in/"],
  },
  {
    tlds: ["au"],
    servers: ["https://rdap.auda.org.au/"],
  },
  {
    tlds: ["nz"],
    servers: ["https://rdap.srs.net.nz/"],
  },
  {
    tlds: ["br"],
    servers: ["https://rdap.registro.br/"],
  },
  {
    tlds: ["mx"],
    servers: ["https://rdap.mx/"],
  },
  {
    tlds: ["ca"],
    servers: ["https://rdap.cira.ca/"],
  },
  {
    tlds: ["us"],
    servers: ["https://rdap.nic.us/"],
  },
  {
    tlds: ["kr"],
    servers: ["https://rdap.kr/"],
  },
  {
    tlds: ["tw"],
    servers: ["https://rdap.twnic.tw/"],
  },
  {
    tlds: ["hk"],
    servers: ["https://rdap.hkirc.hk/"],
  },
  {
    tlds: ["sg"],
    servers: ["https://rdap.sgnic.sg/"],
  },
  {
    tlds: ["my"],
    servers: ["https://rdap.mynic.my/"],
  },
  {
    tlds: ["za"],
    servers: ["https://rdap.registry.net.za/"],
  },
  {
    tlds: ["st"],
    servers: ["https://rdap.nic.st/"],
  },
  {
    tlds: ["ly"],
    servers: ["https://rdap.nic.ly/"],
  },
  {
    tlds: ["to"],
    servers: ["https://rdap.nic.to/"],
  },
  {
    tlds: ["ws"],
    servers: ["https://rdap.nic.ws/"],
  },
  {
    tlds: ["gg"],
    servers: ["https://rdap.gg/"],
  },
  {
    tlds: ["je"],
    servers: ["https://rdap.je/"],
  },
  {
    tlds: ["im"],
    servers: ["https://rdap.nic.im/"],
  },
  {
    tlds: ["ac"],
    servers: ["https://rdap.nic.ac/"],
  },
  {
    tlds: ["sh"],
    servers: ["https://rdap.nic.sh/"],
  },
  {
    tlds: ["vc"],
    servers: ["https://rdap.nic.vc/"],
  },
  {
    tlds: ["gs"],
    servers: ["https://rdap.nic.gs/"],
  },
  {
    tlds: ["la"],
    servers: ["https://rdap.nic.la/"],
  },
  {
    tlds: ["sc"],
    servers: ["https://rdap.nic.sc/"],
  },
  {
    tlds: ["mn"],
    servers: ["https://rdap.nic.mn/"],
  },
  {
    tlds: ["ag"],
    servers: ["https://rdap.nic.ag/"],
  },
  {
    tlds: ["bz"],
    servers: ["https://rdap.nic.bz/"],
  },
  {
    tlds: ["lc"],
    servers: ["https://rdap.nic.lc/"],
  },
  {
    tlds: ["hn"],
    servers: ["https://rdap.nic.hn/"],
  },
  {
    tlds: ["gy"],
    servers: ["https://rdap.nic.gy/"],
  },
  {
    tlds: ["ht"],
    servers: ["https://rdap.nic.ht/"],
  },
  {
    tlds: ["xn--fiqs8s", "xn--fiqz9s"], // .中国 (China)
    servers: ["https://rdap.cnnic.cn/", "https://whois.cnnic.cn/"],
  },
  {
    tlds: ["xn--55qx5d"], // .中文 (Chinese generic)
    servers: ["https://rdap.nic.xn--55qx5d/"],
  },
  {
    tlds: ["xn--3e0b707e"], // .한국 (Korea)
    servers: ["https://rdap.kr/"],
  },
  {
    tlds: ["xn--kcrx77d1x4a"], // .飞利浦 (Philips)
    servers: ["https://rdap.nic.xn--kcrx77d1x4a/"],
  },
  {
    tlds: ["xn--kprw13d", "xn--kpry57d"], // .台湾 / .台灣 (Taiwan)
    servers: ["https://rdap.twnic.tw/"],
  },
  {
    tlds: ["xn--kput3i"], // .手机 (mobile phone)
    servers: ["https://rdap.nic.xn--kput3i/"],
  },
  {
    tlds: ["xn--mgbab2bd"], // .بازار (bazaar)
    servers: ["https://rdap.nic.xn--mgbab2bd/"],
  },
  {
    tlds: ["xn--ngbc5azd"], // .شبكة (network)
    servers: ["https://rdap.nic.xn--ngbc5azd/"],
  },
  {
    tlds: ["xn--nqv7f"], // .机构 (organization)
    servers: ["https://rdap.nic.xn--nqv7f/"],
  },
  {
    tlds: ["xn--nqv7fs00ema"], // .组织机构 (organization)
    servers: ["https://rdap.nic.xn--nqv7fs00ema/"],
  },
  {
    tlds: ["xn--rhqv96g"], // .世界 (world)
    servers: ["https://rdap.nic.xn--rhqv96g/"],
  },
  {
    tlds: ["xn--ses554g"], // .网址 (website/URL)
    servers: ["https://rdap.nic.xn--ses554g/"],
  },
  {
    tlds: ["xn--unup4y"], // .游戏 (game)
    servers: ["https://rdap.nic.xn--unup4y/"],
  },
  {
    tlds: ["xn--vermgensberater-ctb"], // .vermögensberater
    servers: ["https://rdap.nic.xn--vermgensberater-ctb/"],
  },
  {
    tlds: ["xn--vermgensberatung-pwb"], // .vermögensberatung
    servers: ["https://rdap.nic.xn--vermgensberatung-pwb/"],
  },
  {
    tlds: ["xn--vhquv"], // .企业 (enterprise)
    servers: ["https://rdap.nic.xn--vhquv/"],
  },
  {
    tlds: ["xn--vuq861b"], // .信息 (information)
    servers: ["https://rdap.teleinfo.cn/"],
  },
  {
    tlds: ["xn--xhq521b"], // .广东 (Guangdong)
    servers: ["https://rdap.nic.xn--xhq521b/"],
  },
  {
    tlds: ["xn--zfr164b"], // .政务 (government affairs)
    servers: ["https://rdap.nic.xn--zfr164b/"],
  },
  {
    tlds: ["sn"],
    servers: ["https://rdap.nic.sn/"],
  },
  {
    tlds: ["tn"],
    servers: ["https://rdap.ati.tn/"],
  },
  {
    tlds: ["dz"],
    servers: ["https://rdap.nic.dz/"],
  },
  {
    tlds: ["ma"],
    servers: ["https://rdap.iam.net.ma/"],
  },
  {
    tlds: ["eg"],
    servers: ["https://rdap.nic.eg/"],
  },
  {
    tlds: ["ke"],
    servers: ["https://rdap.kenic.or.ke/"],
  },
  {
    tlds: ["ng"],
    servers: ["https://rdap.nic.net.ng/"],
  },
  {
    tlds: ["gh"],
    servers: ["https://rdap.nic.gh/"],
  },
  {
    tlds: ["ug"],
    servers: ["https://rdap.co.ug/"],
  },
  {
    tlds: ["tz"],
    servers: ["https://rdap.tznic.or.tz/"],
  },
  {
    tlds: ["rw"],
    servers: ["https://rdap.ricta.org.rw/"],
  },
  {
    tlds: ["et"],
    servers: ["https://rdap.nic.et/"],
  },
  {
    tlds: ["ao"],
    servers: ["https://rdap.nic.ao/"],
  },
  {
    tlds: ["mz"],
    servers: ["https://rdap.nic.mz/"],
  },
  {
    tlds: ["bw"],
    servers: ["https://rdap.nic.net.bw/"],
  },
  {
    tlds: ["na"],
    servers: ["https://rdap.na-nic.com.na/"],
  },
  {
    tlds: ["zm"],
    servers: ["https://rdap.nic.zm/"],
  },
  {
    tlds: ["zw"],
    servers: ["https://rdap.nic.zw/"],
  },
  {
    tlds: ["mu"],
    servers: ["https://rdap.nic.mu/"],
  },
  {
    tlds: ["re"],
    servers: ["https://rdap.nic.re/"],
  },
  {
    tlds: ["yt"],
    servers: ["https://rdap.nic.yt/"],
  },
  {
    tlds: ["pm"],
    servers: ["https://rdap.nic.pm/"],
  },
  {
    tlds: ["gp"],
    servers: ["https://rdap.nic.gp/"],
  },
  {
    tlds: ["mq"],
    servers: ["https://rdap.nic.mq/"],
  },
  {
    tlds: ["gf"],
    servers: ["https://rdap.nic.gf/"],
  },
  {
    tlds: ["nc"],
    servers: ["https://rdap.nc/"],
  },
  {
    tlds: ["pf"],
    servers: ["https://rdap.nic.pf/"],
  },
  {
    tlds: ["wf"],
    servers: ["https://rdap.nic.wf/"],
  },
  {
    tlds: ["tf"],
    servers: ["https://rdap.nic.tf/"],
  },
  {
    tlds: ["iq"],
    servers: ["https://rdap.cmc.iq/"],
  },
  {
    tlds: ["sy"],
    servers: ["https://rdap.nic.sy/"],
  },
  {
    tlds: ["lb"],
    servers: ["https://rdap.nic.lb/"],
  },
  {
    tlds: ["jo"],
    servers: ["https://rdap.nic.jo/"],
  },
  {
    tlds: ["ps"],
    servers: ["https://rdap.nic.ps/"],
  },
  {
    tlds: ["ye"],
    servers: ["https://rdap.nic.ye/"],
  },
  {
    tlds: ["om"],
    servers: ["https://rdap.nic.om/"],
  },
  {
    tlds: ["kw"],
    servers: ["https://rdap.nic.kw/"],
  },
  {
    tlds: ["bh"],
    servers: ["https://rdap.nic.bh/"],
  },
  {
    tlds: ["qa"],
    servers: ["https://rdap.registry.qa/"],
  },
  {
    tlds: ["ae"],
    servers: ["https://rdap.aeda.net.ae/"],
  },
  {
    tlds: ["sa"],
    servers: ["https://rdap.nic.net.sa/"],
  },
  {
    tlds: ["il"],
    servers: ["https://rdap.isoc.org.il/"],
  },
  {
    tlds: ["ir"],
    servers: ["https://rdap.nic.ir/"],
  },
  {
    tlds: ["af"],
    servers: ["https://rdap.nic.af/"],
  },
  {
    tlds: ["pk"],
    servers: ["https://rdap.nic.pk/"],
  },
  {
    tlds: ["bd"],
    servers: ["https://rdap.nic.bd/"],
  },
  {
    tlds: ["lk"],
    servers: ["https://rdap.nic.lk/"],
  },
  {
    tlds: ["np"],
    servers: ["https://rdap.nic.np/"],
  },
  {
    tlds: ["bt"],
    servers: ["https://rdap.nic.bt/"],
  },
  {
    tlds: ["mv"],
    servers: ["https://rdap.nic.mv/"],
  },
  {
    tlds: ["mm"],
    servers: ["https://rdap.nic.mm/"],
  },
  {
    tlds: ["th"],
    servers: ["https://rdap.thnic.co.th/"],
  },
  {
    tlds: ["kh"],
    servers: ["https://rdap.nic.kh/"],
  },
  {
    tlds: ["la"],
    servers: ["https://rdap.nic.la/"],
  },
  {
    tlds: ["vn"],
    servers: ["https://rdap.nic.vn/"],
  },
  {
    tlds: ["bn"],
    servers: ["https://rdap.bnnic.bn/"],
  },
  {
    tlds: ["tl"],
    servers: ["https://rdap.nic.tl/"],
  },
  {
    tlds: ["ph"],
    servers: ["https://rdap.nic.ph/"],
  },
  {
    tlds: ["id"],
    servers: ["https://rdap.id/"],
  },
  {
    tlds: ["kz"],
    servers: ["https://rdap.nic.kz/"],
  },
  {
    tlds: ["kg"],
    servers: ["https://rdap.kg/"],
  },
  {
    tlds: ["tj"],
    servers: ["https://rdap.nic.tj/"],
  },
  {
    tlds: ["tm"],
    servers: ["https://rdap.nic.tm/"],
  },
  {
    tlds: ["uz"],
    servers: ["https://rdap.cctld.uz/"],
  },
  {
    tlds: ["az"],
    servers: ["https://rdap.nic.az/"],
  },
  {
    tlds: ["am"],
    servers: ["https://rdap.amnic.net/"],
  },
  {
    tlds: ["ge"],
    servers: ["https://rdap.nic.ge/"],
  },
  {
    tlds: ["by"],
    servers: ["https://rdap.cctld.by/"],
  },
  {
    tlds: ["md"],
    servers: ["https://rdap.nic.md/"],
  },
  {
    tlds: ["mk"],
    servers: ["https://rdap.marnet.mk/"],
  },
  {
    tlds: ["al"],
    servers: ["https://rdap.nic.al/"],
  },
  {
    tlds: ["ba"],
    servers: ["https://rdap.nic.ba/"],
  },
  {
    tlds: ["hr"],
    servers: ["https://rdap.nic.hr/"],
  },
  {
    tlds: ["cy"],
    servers: ["https://rdap.nic.cy/"],
  },
  {
    tlds: ["ee"],
    servers: ["https://rdap.tld.ee/"],
  },
  {
    tlds: ["gr"],
    servers: ["https://rdap.nic.gr/"],
  },
  {
    tlds: ["hu"],
    servers: ["https://rdap.nic.hu/"],
  },
  {
    tlds: ["is"],
    servers: ["https://rdap.isnic.is/"],
  },
  {
    tlds: ["lv"],
    servers: ["https://rdap.nic.lv/"],
  },
  {
    tlds: ["lt"],
    servers: ["https://rdap.nic.lt/"],
  },
  {
    tlds: ["lu"],
    servers: ["https://rdap.nic.lu/"],
  },
  {
    tlds: ["mt"],
    servers: ["https://rdap.nic.mt/"],
  },
  {
    tlds: ["mc"],
    servers: ["https://rdap.nic.mc/"],
  },
  {
    tlds: ["pt"],
    servers: ["https://rdap.nic.pt/"],
  },
  {
    tlds: ["ro"],
    servers: ["https://rdap.rotld.ro/"],
  },
  {
    tlds: ["rs"],
    servers: ["https://rdap.rnids.rs/"],
  },
  {
    tlds: ["si"],
    servers: ["https://rdap.register.si/"],
  },
  {
    tlds: ["sk"],
    servers: ["https://rdap.sk-nic.sk/"],
  },
  {
    tlds: ["sm"],
    servers: ["https://rdap.nic.sm/"],
  },
  {
    tlds: ["tr"],
    servers: ["https://rdap.nic.tr/"],
  },
  {
    tlds: ["va"],
    servers: ["https://rdap.nic.va/"],
  },
  {
    tlds: ["ax"],
    servers: ["https://rdap.ax/"],
  },
  {
    tlds: ["fo"],
    servers: ["https://rdap.nic.fo/"],
  },
  {
    tlds: ["gl"],
    servers: ["https://rdap.nic.gl/"],
  },
  {
    tlds: ["sj"],
    servers: ["https://rdap.nic.sj/"],
  },
]

export function getRdapServers(domain: string): string[] {
  const parts = domain.toLowerCase().split(".")
  if (parts.length < 2) return []

  const tld = parts[parts.length - 1]

  for (const entry of RDAP_BOOTSTRAP) {
    if (entry.tlds.includes(tld)) {
      return entry.servers
    }
  }

  return []
}

export function getRdapServer(domain: string): string | null {
  const servers = getRdapServers(domain)
  return servers.length > 0 ? servers[0] : null
}

export function isRdapSupported(domain: string): boolean {
  return getRdapServers(domain).length > 0
}

export function getRdapUrl(domain: string): string {
  const server = getRdapServer(domain)
  if (server) {
    const baseUrl = server.endsWith("/") ? server : `${server}/`
    return `${baseUrl}domain/${encodeURIComponent(domain)}`
  }
  return ""
}
