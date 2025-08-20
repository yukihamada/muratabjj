'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Shield, Heart, Zap, AlertTriangle, Users, Target } from 'lucide-react'

const translations = {
  ja: {
    title: '安全性と健康への配慮',
    subtitle: 'Murata BJJは生涯スポーツとしての柔術を重視し、安全で効果的な練習をサポートします',
    safetyTitle: '怪我防止と安全な技術',
    safetyItems: [
      {
        title: '安全な技術の習得',
        description: '基礎から段階的に学び、無理のない範囲で技術を身につけます',
        tips: ['正しいフォームの重要性', 'タップアウトのタイミング', 'パートナーとの意思疎通']
      },
      {
        title: '怪我のリスク管理',
        description: '危険な状況や技術には注意書きと代替案を提供',
        tips: ['関節技の注意点', '首・脊椎への配慮', 'オーバートレーニング防止']
      },
      {
        title: '年齢・体格に応じた指導',
        description: '個人の身体特性に合わせたアプローチ',
        tips: ['シニア向けの配慮', '女性向けの技術', '初心者への段階指導']
      }
    ],
    healthTitle: 'QOL・MQの向上効果',
    qolDescription: 'Quality of Life（生活の質）の向上',
    qomDescription: 'Movement Quality（動きの質）の向上',
    healthBenefits: [
      {
        icon: Heart,
        title: '心血管系の健康',
        description: '有酸素運動と無酸素運動のバランスで心肺機能向上',
        effects: ['心拍数の改善', '血圧の安定', '持久力の向上']
      },
      {
        icon: Zap,
        title: '筋力・柔軟性',
        description: '全身をバランスよく使う運動で筋力と可動域を改善',
        effects: ['体幹強化', '関節可動域拡大', '姿勢改善']
      },
      {
        icon: Target,
        title: 'メンタルヘルス',
        description: 'ストレス解消と集中力・判断力の向上',
        effects: ['ストレス軽減', '自信の向上', '問題解決能力の向上']
      }
    ],
    lifestyleBenefits: [
      '日常生活での体の使い方が改善される',
      'バランス感覚と反射神経が向上する',
      '年齢に関係なく続けられる生涯スポーツ',
      'コミュニティでの社会的つながりが生まれる',
      'MMA（総合格闘技）への応用も可能',
      '体重管理とダイエット効果'
    ],
    warningTitle: '注意が必要な技術・状況',
    warnings: [
      '首や脊椎に負荷がかかる技術',
      '関節への過度な圧力',
      '疲労時の無理な練習',
      '体調不良時の参加',
      '適切でない相手との練習'
    ],
    safetyTips: 'すべての動画と技術解説には安全に関する注意書きを併記し、初心者から上級者まで安全に練習できるようサポートしています。',
  },
  en: {
    title: 'Safety & Wellness Focus',
    subtitle: 'Murata BJJ prioritizes BJJ as a lifelong sport, supporting safe and effective training',
    safetyTitle: 'Injury Prevention & Safe Techniques',
    safetyItems: [
      {
        title: 'Learning Safe Techniques',
        description: 'Progressive learning from basics within comfortable limits',
        tips: ['Importance of proper form', 'Tapping out timing', 'Communication with partners']
      },
      {
        title: 'Injury Risk Management',
        description: 'Warnings and alternatives for dangerous situations and techniques',
        tips: ['Joint lock precautions', 'Neck/spine care', 'Overtraining prevention']
      },
      {
        title: 'Age & Body-Type Appropriate Instruction',
        description: 'Approaches tailored to individual physical characteristics',
        tips: ['Senior considerations', 'Women-specific techniques', 'Beginner progression']
      }
    ],
    healthTitle: 'QOL & MQ Enhancement Effects',
    qolDescription: 'Quality of Life improvement',
    qomDescription: 'Movement Quality improvement',
    healthBenefits: [
      {
        icon: Heart,
        title: 'Cardiovascular Health',
        description: 'Balanced aerobic and anaerobic exercise improves cardiopulmonary function',
        effects: ['Heart rate improvement', 'Blood pressure stability', 'Enhanced endurance']
      },
      {
        icon: Zap,
        title: 'Strength & Flexibility',
        description: 'Full-body balanced exercise improves strength and range of motion',
        effects: ['Core strengthening', 'Joint mobility expansion', 'Posture improvement']
      },
      {
        icon: Target,
        title: 'Mental Health',
        description: 'Stress relief and improved focus and decision-making',
        effects: ['Stress reduction', 'Confidence building', 'Problem-solving skills']
      }
    ],
    lifestyleBenefits: [
      'Improved body mechanics in daily life',
      'Enhanced balance and reflexes',
      'Lifelong sport regardless of age',
      'Social connections through community',
      'Applicable to MMA (Mixed Martial Arts)',
      'Weight management and diet effects'
    ],
    warningTitle: 'Techniques/Situations Requiring Caution',
    warnings: [
      'Techniques that stress neck or spine',
      'Excessive pressure on joints',
      'Overexertion when fatigued',
      'Participation when unwell',
      'Training with inappropriate partners'
    ],
    safetyTips: 'All videos and technique explanations include safety notes, supporting safe practice for beginners to advanced practitioners.',
  },
  pt: {
    title: 'Foco em Segurança e Bem-Estar',
    subtitle: 'Murata BJJ prioriza o BJJ como esporte vitalício, apoiando treinos seguros e eficazes',
    safetyTitle: 'Prevenção de Lesões e Técnicas Seguras',
    safetyItems: [
      {
        title: 'Aprendizado de Técnicas Seguras',
        description: 'Aprendizado progressivo desde o básico dentro de limites confortáveis',
        tips: ['Importância da forma correta', 'Timing para bater', 'Comunicação com parceiros']
      },
      {
        title: 'Gestão de Riscos de Lesões',
        description: 'Avisos e alternativas para situações e técnicas perigosas',
        tips: ['Precauções com chaves', 'Cuidados com pescoço/coluna', 'Prevenção de overtraining']
      },
      {
        title: 'Instrução Adequada à Idade e Biotipo',
        description: 'Abordagens adaptadas às características físicas individuais',
        tips: ['Considerações para seniores', 'Técnicas específicas para mulheres', 'Progressão para iniciantes']
      }
    ],
    healthTitle: 'Efeitos de Melhoria da QOL e MQ',
    qolDescription: 'Melhoria da Qualidade de Vida (Quality of Life)',
    qomDescription: 'Melhoria da Qualidade do Movimento (Movement Quality)',
    healthBenefits: [
      {
        icon: Heart,
        title: 'Saúde Cardiovascular',
        description: 'Exercício aeróbico e anaeróbico balanceado melhora a função cardiopulmonar',
        effects: ['Melhoria da frequência cardíaca', 'Estabilidade da pressão arterial', 'Resistência aprimorada']
      },
      {
        icon: Zap,
        title: 'Força e Flexibilidade',
        description: 'Exercício balanceado de corpo inteiro melhora força e amplitude de movimento',
        effects: ['Fortalecimento do core', 'Expansão da mobilidade articular', 'Melhoria da postura']
      },
      {
        icon: Target,
        title: 'Saúde Mental',
        description: 'Alívio do estresse e melhoria do foco e tomada de decisão',
        effects: ['Redução do estresse', 'Construção de confiança', 'Habilidades de resolução de problemas']
      }
    ],
    lifestyleBenefits: [
      'Mecânica corporal melhorada na vida diária',
      'Equilíbrio e reflexos aprimorados',
      'Esporte vitalício independente da idade',
      'Conexões sociais através da comunidade',
      'Aplicável ao MMA (Artes Marciais Mistas)',
      'Controle de peso e efeitos na dieta'
    ],
    warningTitle: 'Técnicas/Situações que Requerem Cuidado',
    warnings: [
      'Técnicas que stressam pescoço ou coluna',
      'Pressão excessiva nas articulações',
      'Esforço excessivo quando cansado',
      'Participação quando indisposto',
      'Treino com parceiros inadequados'
    ],
    safetyTips: 'Todos os vídeos e explicações de técnicas incluem notas de segurança, apoiando a prática segura de iniciantes a praticantes avançados.',
  }
}

export default function SafetyAndWellness() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bjj-accent/20 text-bjj-accent rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Safety First
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">{t.title}</h2>
          <p className="text-xl text-bjj-muted max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Safety Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Shield className="w-6 h-6 text-bjj-accent" />
            {t.safetyTitle}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.safetyItems.map((item, index) => (
              <div key={index} className="card-gradient border border-white/10 rounded-bjj p-6">
                <h4 className="text-lg font-semibold mb-3">{item.title}</h4>
                <p className="text-bjj-muted mb-4">{item.description}</p>
                <ul className="space-y-2">
                  {item.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-bjj-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Health Benefits Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold mb-4">{t.healthTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-1">QOL</h4>
              <p className="text-sm text-bjj-muted">{t.qolDescription}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-1">MQ</h4>
              <p className="text-sm text-bjj-muted">{t.qomDescription}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {t.healthBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="card-gradient border border-white/10 rounded-bjj p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-bjj-accent" />
                    <h4 className="text-lg font-semibold">{benefit.title}</h4>
                  </div>
                  <p className="text-bjj-muted mb-4">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.effects.map((effect, effectIndex) => (
                      <li key={effectIndex} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Lifestyle Benefits */}
          <div className="card-gradient border border-white/10 rounded-bjj p-8">
            <h4 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-bjj-accent" />
              {language === 'ja' ? '生涯スポーツとしての効果' : 
               language === 'en' ? 'Lifelong Sport Benefits' : 
               'Benefícios como Esporte Vitalício'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.lifestyleBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-bjj-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-bjj-muted">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-bjj p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            {t.warningTitle}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {t.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span className="text-amber-200">{warning}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4">
            <p className="text-amber-100 text-sm leading-relaxed">
              <strong>{language === 'ja' ? '安全への取り組み:' : 
                      language === 'en' ? 'Safety Commitment:' : 
                      'Compromisso com Segurança:'}</strong> {t.safetyTips}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}