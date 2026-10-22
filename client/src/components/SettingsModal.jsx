import React, { useState, useEffect } from 'react'
import { getConfig, saveConfig } from '../api.js'

export default function SettingsModal({ onClose, onSaved }) {
  const [baseUrl, setBaseUrl] = useState('')
  const [authType, setAuthType] = useState('xtoken')
  const [apiKey, setApiKey] = useState('')
  const [masked, setMasked] = useState('')
  const [configured, setConfigured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    getConfig()
      .then((c) => {
        setBaseUrl(c.baseUrl || '')
        setAuthType(c.authType || 'xtoken')
        setMasked(c.apiKeyMasked || '')
        setConfigured(c.configured)
      })
      .catch((e) => setErr(e.message))
  }, [])

  const save = async () => {
    setSaving(true)
    setMsg('')
    setErr('')
    try {
      const patch = {}
      if (apiKey.trim()) patch.apiKey = apiKey.trim()
      if (baseUrl.trim()) patch.baseUrl = baseUrl.trim()
      patch.authType = authType
      const r = await saveConfig(patch)
      setMasked(r.apiKeyMasked || '')
      setConfigured(r.configured)
      setApiKey('')
      setMsg('已保存 ✅ 现在会调用真实模型')
      onSaved && onSaved(r)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>⚙️ 设置 · 接入美术中台</span>
          <span className="modal-close" onClick={onClose}>✕</span>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>API Key（arthub token）</label>
            <input
              type="password"
              placeholder={configured ? `已保存：${masked}（留空则不修改）` : '粘贴你的 token'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="field">
            <label>接口地址（base URL）</label>
            <input
              type="text"
              placeholder="https://arthub.zx.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="field">
            <label>鉴权方式</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value)}>
              <option value="xtoken">X-Token + X-API-KEY（推荐）</option>
              <option value="apikey">X-API-KEY</option>
              <option value="cookie">Cookie (arthub_token)</option>
            </select>
          </div>

          {msg && <div className="msg ok">{msg}</div>}
          {err && <div className="msg bad">{err}</div>}

          <button className="cn-btn" onClick={save} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
