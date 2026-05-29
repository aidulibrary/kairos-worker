'use client'

import { useState } from 'react'
import { PenLine, Store, Compass, Wrench } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { RegisterForm } from '@/components/RegisterForm'

interface IdentityOption {
  key: string
  label: string
  description: string
  icon: typeof PenLine
  color: string
}

const identities: IdentityOption[] = [
  {
    key: 'CREATOR',
    label: '主创',
    description: '你发起市集，构想场域。',
    icon: PenLine,
    color: 'var(--kairo-creator)',
  },
  {
    key: 'ARRIVER',
    label: '主理人',
    description: '你入驻摊位，呈现手艺。',
    icon: Store,
    color: 'var(--kairo-arriver)',
  },
  {
    key: 'DESCENDER',
    label: '赶集人',
    description: '你游走市集，发现相遇。',
    icon: Compass,
    color: 'var(--kairo-descender)',
  },
  {
    key: 'FACILITATOR',
    label: '共建人',
    description: '你搭建设施，支撑运转。',
    icon: Wrench,
    color: 'var(--kairo-facilitator)',
  },
]

export default function AuthPage() {
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null)

  if (selectedIdentity) {
    const identity = identities.find((i) => i.key === selectedIdentity)!
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <RegisterForm
          identity={identity.key}
          identityLabel={identity.label}
          onBack={() => setSelectedIdentity(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-10">
      <div className="flex flex-col items-center gap-3">
        <h1
          className="text-center"
          style={{
            fontFamily: 'var(--font-chinese-heading)',
            fontSize: 'var(--text-h1)',
            fontWeight: 700,
            color: 'var(--kairo-glimmer)',
          }}
        >
          你是谁？
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-chinese-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--kairo-whisper)',
          }}
        >
          四种身份，同一个Kairos。
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-lg"
        style={{ gap: 'var(--space-breath)' }}
      >
        {identities.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => setSelectedIdentity(item.key)}
              className="group text-left transition-all duration-200 hover:-translate-y-[2px]"
            >
              <GlassCard
                className="p-6 flex flex-col gap-3 h-full transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Icon size={24} style={{ color: item.color }} />
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-h3)',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </h3>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-chinese-body)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--kairo-whisper)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              </GlassCard>
            </button>
          )
        })}
      </div>
    </div>
  )
}