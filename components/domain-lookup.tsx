"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Search, Globe, Calendar, User, Server, AlertCircle, CheckCircle2 } from "lucide-react"
import StatusBadge from "@/components/status-badge"

interface DomainData {
  domainName: string
  status: string[]
  registrar?: string
  registrant?: string
  creationDate?: string
  expirationDate?: string
  updatedDate?: string
  nameServers?: string[]
  dnssec?: string
  rawData?: string
  source?: "rdap" | "whois"
  available?: boolean
}

export default function DomainLookup() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DomainData | null>(null)

  const handleSearch = async () => {
    if (!domain.trim()) {
      setError("请输入域名")
      return
    }

    // Normalize domain
    const normalizedDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Try RDAP first
      const rdapResponse = await fetch(`/api/rdap?domain=${encodeURIComponent(normalizedDomain)}`)
      
      if (rdapResponse.ok) {
        const data = await rdapResponse.json()
        setResult({ ...data, source: "rdap" })
        return
      }

      // Check if domain is available (404 means not found)
      if (rdapResponse.status === 404) {
        const rdapData = await rdapResponse.json().catch(() => ({}))
        if (rdapData.available) {
          setResult({
            domainName: normalizedDomain,
            status: ["available"],
            available: true,
          })
          return
        }
      }

      // Fallback to WHOIS
      const whoisResponse = await fetch(`/api/whois?domain=${encodeURIComponent(normalizedDomain)}`)
      
      if (whoisResponse.ok) {
        const data = await whoisResponse.json()
        setResult({ ...data, source: "whois" })
        return
      }

      // Check if domain is available from WHOIS
      if (whoisResponse.status === 404) {
        const whoisData = await whoisResponse.json().catch(() => ({}))
        if (whoisData.available) {
          setResult({
            domainName: normalizedDomain,
            status: ["available"],
            available: true,
          })
          return
        }
      }

      setError("查询失败，请稍后重试")
    } catch {
      setError("网络错误，请检查您的连接")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "未知"
    try {
      return new Date(dateStr).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">域名查询工具</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            使用 RDAP 和 WHOIS 协议查询域名注册信息
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="输入域名，例如: example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-lg h-12"
                disabled={loading}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="h-12 px-6"
              >
                {loading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    查询
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Domain Available */}
            {result.available ? (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-semibold">{result.domainName}</h3>
                      <p className="text-green-600 dark:text-green-500">此域名可以注册！</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Domain Info Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{result.domainName}</CardTitle>
                        <CardDescription>
                          数据来源: {result.source === "rdap" ? "RDAP" : "WHOIS"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {result.status?.map((s, i) => (
                          <StatusBadge key={i} status={s} />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Dates */}
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          日期信息
                        </h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">注册日期</dt>
                            <dd>{formatDate(result.creationDate)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">到期日期</dt>
                            <dd>{formatDate(result.expirationDate)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">更新日期</dt>
                            <dd>{formatDate(result.updatedDate)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Registrar */}
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          注册信息
                        </h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">注册商</dt>
                            <dd className="text-right max-w-[200px] truncate">{result.registrar || "未知"}</dd>
                          </div>
                          {result.registrant && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">注册人</dt>
                              <dd className="text-right max-w-[200px] truncate">{result.registrant}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    {/* Name Servers */}
                    {result.nameServers && result.nameServers.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Server className="h-4 w-4" />
                          DNS服务器
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.nameServers.map((ns, i) => (
                            <code 
                              key={i} 
                              className="px-2 py-1 bg-muted rounded text-sm"
                            >
                              {ns.toLowerCase()}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>支持 RDAP (Registration Data Access Protocol) 和 WHOIS 协议查询</p>
        </footer>
      </div>
    </main>
  )
}
