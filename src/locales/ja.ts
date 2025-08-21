export const ja = {
  // ナビゲーション
  nav: {
    features: '機能',
    howToUse: '使い方',
    pricing: '料金',
    supervisor: '監修',
    faq: 'FAQ',
    login: 'ログイン',
    logout: 'ログアウト',
    dashboard: 'ダッシュボード',
    freeStart: '無料で始める',
  },

  // ヒーローセクション
  hero: {
    badge: 'Flow × Video × Progress',
    title1: 'フローと動画で',
    title2: '柔術を',
    titleHighlight: '最速マスター',
    description: 'Murata BJJは、連携（Flow）中心で学ぶ柔術プラットフォーム。',
    descriptionPoints: ['動画', 'フロー', '習得度', 'スパーリングログ'],
    descriptionEnd: 'で、理解→再現→実戦を循環させます。',
    healthNote: '安全な指導で生涯スポーツとしての生活の質(QOL)と動きの質(MQ)向上をサポート。',
    cta: {
      start: '無料で始める',
      features: '機能を見る',
    },
  },

  // 機能セクション
  features: {
    title: '主な機能',
    items: {
      videoCatalog: {
        title: '動画カタログ',
        description: '帯・ポジション・技種別で整理。チャプター/キーポイント/再生速度調整。自動文字起こし対応。',
      },
      flowEditor: {
        title: 'フローエディタ',
        description: 'ノード（技/体勢）とエッジ（遷移）で連携を可視化。分岐・代替ルートも。',
      },
      progressTracker: {
        title: '習得度トラッカー',
        description: '理解→手順→再現→実戦の5段階。弱点と次の一手を提示。',
      },
      sparringLog: {
        title: 'スパーリングログ',
        description: '開始体勢/イベント（パス/スイープ/サブミット）を時系列で記録。',
      },
      adaptiveReview: {
        title: 'アダプティブ復習',
        description: '忘却曲線に合わせて出題間隔を最適化。ボトルネック遷移を重点化。',
      },
      coachFeatures: {
        title: 'コーチ/道場向け',
        description: 'カリキュラム配信・帯別課題・評価レポート。非公開スペース。',
      },
    },
  },

  // 使い方セクション
  howToUse: {
    title: '使い方（3分）',
    steps: {
      account: {
        number: '01',
        title: 'アカウント',
        description: '帯/体格/得意技を設定→初期フローを提案。',
      },
      understand: {
        number: '02',
        title: '動画で理解',
        description: 'チャプターとキーポイントで要点を把握。',
      },
      practice: {
        number: '03',
        title: 'ドリルで再現',
        description: 'レップ/左右/抵抗%を記録。つなぎ目を重点練習。',
      },
      apply: {
        number: '04',
        title: 'スパー適用',
        description: 'イベントをログ化。ダッシュボードが次の一手を提示。',
      },
    },
  },

  // 料金セクション
  pricing: {
    title: '料金',
    plans: {
      personal: {
        name: '個人',
        price: '¥0',
        features: ['動画（基本）', 'ドリル/スパーリングログ', '習得度（基本）'],
      },
      pro: {
        name: 'Pro',
        price: '¥1,200/月',
        popular: '人気',
        features: ['フローエディタ', 'アダプティブ復習', '詳細レポート'],
      },
      dojo: {
        name: '道場',
        price: '¥6,000/月〜',
        features: ['カリキュラム配信/宿題', '非公開スペース', 'コーチ評価'],
      },
    },
  },

  // 監修者セクション
  supervisor: {
    title: '監修：村田 良蔵（Ryozo Murata）',
    description: 'SJJIF世界選手権マスター2黒帯フェザー級 2018・2019 連覇。スポーツ柔術日本連盟（SJJJF）会長。YAWARA柔術アカデミー代表、Over Limit札幌 代表取締役。',
    details: [
      '出身：北海道網走市 / 1980-04-24',
      '2016・2017 準優勝、2018・2019 優勝（SJJIF/M2黒/Feather）',
    ],
    photoNote: '※写真は差し替え予定。公開時は権利許諾済み画像をご用意ください。',
    comment: {
      title: '監修コメント',
      text: '柔術は点ではなく連携。Murata BJJは「理解→再現→実戦」を循環させるため、フローとログを軸に設計しています。',
    },
  },

  // サインアップセクション
  signup: {
    title: '無料で始める',
    loggedIn: {
      description: 'すでにログイン済みです。ダッシュボードから学習を始めましょう。',
      cta: 'ダッシュボードへ',
    },
    loggedOut: {
      description: '今すぐ無料でアカウントを作成して、柔術の学習を始めましょう。',
      cta: '無料で始める',
    },
    info: {
      title: 'What is Murata BJJ?',
      description: 'Flow-first learning platform for Brazilian Jiu-Jitsu. Designed & supervised by Ryozo Murata.',
      seeEnglish: 'See English',
      seePortuguese: 'Ver em Português',
    },
  },

  // 認証ダイアログ
  auth: {
    login: 'ログイン',
    signup: '新規登録',
    email: 'メールアドレス',
    password: 'パスワード',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '••••••••',
    processing: '処理中...',
    or: 'または',
    googleLogin: 'Googleでログイン',
    noAccount: 'アカウントをお持ちでない方は',
    hasAccount: 'すでにアカウントをお持ちの方は',
    confirmEmailSent: '確認メールを送信しました。メールをご確認ください。',
    loginSuccess: 'ログインしました',
    logoutSuccess: 'ログアウトしました',
    loginFailed: 'ログインに失敗しました',
    signupFailed: '登録に失敗しました',
    logoutFailed: 'ログアウトに失敗しました',
    googleLoginFailed: 'Googleログインに失敗しました',
    supabaseNotConfigured: 'Supabaseが設定されていません',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません',
    userAlreadyExists: 'このメールアドレスは既に登録されています',
    signupSuccess: '確認メールを送信しました。メールをご確認ください。',
  },

  // ダッシュボード
  dashboard: {
    title: 'ダッシュボード',
    welcome: 'ようこそ、{{email}}さん',
    stats: {
      watchedVideos: '視聴した動画',
      masteredTechniques: '習得した技術',
      practiceDays: '練習日数',
      completedFlows: '完了したフロー',
    },
    recentActivity: {
      title: '最近の学習',
      progress: '進捗',
      lastWatched: '最終視聴',
      daysAgo: '{{days}}日前',
    },
    recommendations: {
      title: 'おすすめの次のステップ',
      fromConnection: '{{technique}}からの連携',
      alternative: '{{technique}}からの選択肢',
    },
  },

  // 動画プレーヤー
  video: {
    instructor: '講師',
    chapters: 'チャプター',
    keyPoints: 'キーポイント',
    transcript: '文字起こし',
    relatedTechniques: '関連する技術',
    toNextStep: '次のステップへ',
    alternative: '別の選択肢',
    recordProgress: '習得度を記録',
    progressLevels: ['理解', '手順', '再現', '連携', '実戦'],
    loginToWatch: 'この動画を視聴するにはログインが必要です',
    loginToWatchButton: 'ログインして視聴',
  },

  // フッター
  footer: {
    copyright: '© {{year}} Murata BJJ — Flow × Video × Progress',
  },

  // 共通
  common: {
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    back: '戻る',
    next: '次へ',
    save: '保存',
    cancel: 'キャンセル',
    close: '閉じる',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    all: 'すべて',
    none: 'なし',
  },
}