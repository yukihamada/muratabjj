'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FAQItem {
  question: { [key: string]: string }
  answer: { [key: string]: string }
}

const faqs: FAQItem[] = [
  {
    question: {
      ja: '動画の著作権について教えてください',
      en: 'Can you tell me about video copyright?',
      pt: 'Pode me falar sobre direitos autorais de vídeo?'
    },
    answer: {
      ja: '監修者（村田良蔵氏）が制作・提供する動画コンテンツの著作権は、Murata BJJまたは提供者に帰属します。個人学習目的での視聴のみ許可されており、無断転載・配布は禁止されています。',
      en: 'The copyright of video content created and provided by the supervisor (Mr. Ryozo Murata) belongs to Murata BJJ or the provider. Viewing is only permitted for personal learning purposes, and unauthorized reproduction or distribution is prohibited.',
      pt: 'Os direitos autorais do conteúdo de vídeo criado e fornecido pelo supervisor (Sr. Ryozo Murata) pertencem ao Murata BJJ ou ao fornecedor. A visualização é permitida apenas para fins de aprendizado pessoal, e a reprodução ou distribuição não autorizada é proibida.'
    }
  },
  {
    question: {
      ja: 'プライバシー保護はどうなっていますか？',
      en: 'How is privacy protected?',
      pt: 'Como a privacidade é protegida?'
    },
    answer: {
      ja: 'ユーザーの練習データ、スパーログは暗号化して保存され、本人と許可されたコーチのみがアクセスできます。第三者への提供は一切行いません。詳細はプライバシーポリシーをご確認ください。',
      en: 'User practice data and sparring logs are encrypted and stored, accessible only to the user and authorized coaches. We never share data with third parties. Please check our privacy policy for details.',
      pt: 'Os dados de prática do usuário e registros de sparring são criptografados e armazenados, acessíveis apenas ao usuário e treinadores autorizados. Nunca compartilhamos dados com terceiros. Consulte nossa política de privacidade para detalhes.'
    }
  },
  {
    question: {
      ja: '無料プランから有料プランへの移行は簡単ですか？',
      en: 'Is it easy to upgrade from free to paid plan?',
      pt: 'É fácil fazer upgrade do plano gratuito para o pago?'
    },
    answer: {
      ja: 'はい、いつでもアップグレード可能です。アップグレード後も、これまでの記録データはすべて引き継がれます。日割り計算で課金されるため、月の途中でも安心して移行できます。',
      en: 'Yes, you can upgrade anytime. All your recorded data will be carried over after upgrading. Billing is prorated, so you can safely upgrade even in the middle of the month.',
      pt: 'Sim, você pode fazer upgrade a qualquer momento. Todos os seus dados registrados serão mantidos após o upgrade. A cobrança é proporcional, então você pode fazer o upgrade com segurança mesmo no meio do mês.'
    }
  },
  {
    question: {
      ja: '道場プランの詳細を教えてください',
      en: 'Can you tell me about the Dojo Plan details?',
      pt: 'Pode me falar sobre os detalhes do Plano Dojo?'
    },
    answer: {
      ja: '道場プランは5名以上から利用可能で、人数に応じた料金設定となります。カリキュラム配信、非公開スペース、生徒の進捗管理、コーチによる評価機能などが含まれます。詳細はお問い合わせください。',
      en: 'The Dojo Plan is available for 5 or more members, with pricing based on the number of users. It includes curriculum delivery, private spaces, student progress management, and coach evaluation features. Please contact us for details.',
      pt: 'O Plano Dojo está disponível para 5 ou mais membros, com preços baseados no número de usuários. Inclui entrega de currículo, espaços privados, gerenciamento de progresso do aluno e recursos de avaliação do treinador. Entre em contato para detalhes.'
    }
  },
  {
    question: {
      ja: '対応している支払い方法は？',
      en: 'What payment methods are supported?',
      pt: 'Quais métodos de pagamento são aceitos?'
    },
    answer: {
      ja: 'クレジットカード（Visa、Mastercard、JCB、AMEX）、デビットカードに対応しています。道場プランは銀行振込にも対応しています。',
      en: 'We accept credit cards (Visa, Mastercard, JCB, AMEX) and debit cards. The Dojo Plan also supports bank transfers.',
      pt: 'Aceitamos cartões de crédito (Visa, Mastercard, JCB, AMEX) e cartões de débito. O Plano Dojo também aceita transferências bancárias.'
    }
  },
  {
    question: {
      ja: '初心者でも安全に練習できますか？',
      en: 'Can beginners practice safely?',
      pt: 'Os iniciantes podem praticar com segurança?'
    },
    answer: {
      ja: '全ての動画に安全に関する注意書きを併記し、段階的な学習プログラムを提供しています。危険な技術には警告と代替案を表示し、年齢や体格に応じた指導も行っています。',
      en: 'All videos include safety notes and we provide progressive learning programs. Dangerous techniques are marked with warnings and alternatives, and instruction is tailored to age and physique.',
      pt: 'Todos os vídeos incluem notas de segurança e fornecemos programas de aprendizado progressivo. Técnicas perigosas são marcadas com avisos e alternativas, e a instrução é adaptada à idade e ao físico.'
    }
  },
  {
    question: {
      ja: 'シニアや女性でも柔術を始められますか？',
      en: 'Can seniors and women start BJJ?',
      pt: 'Pessoas idosas e mulheres podem começar o BJJ?'
    },
    answer: {
      ja: '柔術は生涯スポーツです。年齢や性別に関係なく、個人の身体特性に合わせたカリキュラムを提供します。無理のない範囲で心血管系の健康向上、筋力・柔軟性の改善、メンタルヘルスの向上、そして生活の質（QOL）と心の健康の向上が期待できます。',
      en: 'BJJ is a lifelong sport. Regardless of age or gender, we provide curriculum adapted to individual physical characteristics. Improvements in cardiovascular health, strength/flexibility, mental health, and Quality of Life (QOL) can be expected within comfortable limits.',
      pt: 'O BJJ é um esporte vitalício. Independentemente da idade ou sexo, fornecemos currículo adaptado às características físicas individuais. Melhorias na saúde cardiovascular, força/flexibilidade, saúde mental e Qualidade de Vida (QOL) & Qualidade Mental podem ser esperadas dentro de limites confortáveis.'
    }
  },
  {
    question: {
      ja: '怪我のリスクはありますか？',
      en: 'Is there a risk of injury?',
      pt: 'Existe risco de lesão?'
    },
    answer: {
      ja: '適切な指導と段階的な練習により怪我のリスクを最小限に抑えています。首・脊椎に負荷がかかる技術や関節への過度な圧力については特に注意喚起し、安全な代替技術も提示しています。',
      en: 'We minimize injury risk through proper instruction and progressive practice. Special warnings are given for techniques that stress the neck/spine or apply excessive pressure to joints, with safe alternative techniques provided.',
      pt: 'Minimizamos o risco de lesão através de instrução adequada e prática progressiva. Avisos especiais são dados para técnicas que stressam o pescoço/coluna ou aplicam pressão excessiva às articulações, com técnicas alternativas seguras fornecidas.'
    }
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { language } = useLanguage()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} id="faq" className="py-16 md:py-24 bg-bjj-bg2/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal opacity-0">FAQ</h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="card-gradient border border-white/10 rounded-bjj overflow-hidden reveal opacity-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold">{faq.question[language]}</span>
                <ChevronDown
                  className={`w-5 h-5 text-bjj-muted transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'py-4' : 'max-h-0'
                }`}
              >
                <p className="text-bjj-muted">{faq.answer[language]}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-bjj-muted text-sm">
            {language === 'ja' && 'その他のご質問は、お問い合わせフォームよりご連絡ください。'}
            {language === 'en' && 'For other inquiries, please contact us through our contact form.'}
            {language === 'pt' && 'Para outras perguntas, entre em contato através do nosso formulário de contato.'}
          </p>
        </div>
      </div>
    </section>
  )
}