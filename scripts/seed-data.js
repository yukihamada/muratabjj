#!/usr/bin/env node

/**
 * Seed initial data for Murata BJJ
 * This creates sample techniques, categories, and belt requirements
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Technique categories
const categories = [
  { 
    name_ja: '基本動作', 
    name_en: 'Fundamentals', 
    name_pt: 'Fundamentos',
    slug: 'fundamentals',
    description_ja: 'BJJの基本的な動作と概念',
    description_en: 'Basic movements and concepts of BJJ',
    description_pt: 'Movimentos e conceitos básicos do BJJ'
  },
  {
    name_ja: 'ガードポジション',
    name_en: 'Guard Positions',
    name_pt: 'Posições de Guarda',
    slug: 'guard-positions',
    description_ja: '様々なガードポジションとその応用',
    description_en: 'Various guard positions and their applications',
    description_pt: 'Várias posições de guarda e suas aplicações'
  },
  {
    name_ja: 'パスガード',
    name_en: 'Guard Passing',
    name_pt: 'Passagem de Guarda',
    slug: 'guard-passing',
    description_ja: '相手のガードを突破する技術',
    description_en: 'Techniques for passing the guard',
    description_pt: 'Técnicas para passar a guarda'
  },
  {
    name_ja: 'スイープ',
    name_en: 'Sweeps',
    name_pt: 'Raspagens',
    slug: 'sweeps',
    description_ja: '下のポジションから上になる技術',
    description_en: 'Techniques to reverse position from bottom',
    description_pt: 'Técnicas para reverter a posição de baixo'
  },
  {
    name_ja: 'サブミッション',
    name_en: 'Submissions',
    name_pt: 'Finalizações',
    slug: 'submissions',
    description_ja: '関節技や絞め技',
    description_en: 'Joint locks and chokes',
    description_pt: 'Chaves de braço e estrangulamentos'
  },
  {
    name_ja: 'テイクダウン',
    name_en: 'Takedowns',
    name_pt: 'Quedas',
    slug: 'takedowns',
    description_ja: '立ち技から寝技への移行',
    description_en: 'Transitions from standing to ground',
    description_pt: 'Transições de pé para o chão'
  }
];

// Sample techniques
const techniques = [
  // Fundamentals
  {
    category_slug: 'fundamentals',
    name_ja: 'エビ',
    name_en: 'Shrimping',
    name_pt: 'Fuga de Quadril',
    description_ja: '基本的な移動技術',
    description_en: 'Basic movement technique',
    description_pt: 'Técnica básica de movimento',
    difficulty: 1,
    belt_requirement: 'white'
  },
  {
    category_slug: 'fundamentals',
    name_ja: 'ブリッジ',
    name_en: 'Bridge',
    name_pt: 'Ponte',
    description_ja: '腰を使った基本動作',
    description_en: 'Basic hip movement',
    description_pt: 'Movimento básico de quadril',
    difficulty: 1,
    belt_requirement: 'white'
  },
  // Guard Positions
  {
    category_slug: 'guard-positions',
    name_ja: 'クローズドガード',
    name_en: 'Closed Guard',
    name_pt: 'Guarda Fechada',
    description_ja: '基本的なガードポジション',
    description_en: 'Basic guard position',
    description_pt: 'Posição básica de guarda',
    difficulty: 1,
    belt_requirement: 'white'
  },
  {
    category_slug: 'guard-positions',
    name_ja: 'スパイダーガード',
    name_en: 'Spider Guard',
    name_pt: 'Guarda Aranha',
    description_ja: '袖を使ったガードポジション',
    description_en: 'Guard position using sleeve grips',
    description_pt: 'Posição de guarda usando pegadas na manga',
    difficulty: 3,
    belt_requirement: 'blue'
  },
  // Submissions
  {
    category_slug: 'submissions',
    name_ja: '腕十字',
    name_en: 'Armbar',
    name_pt: 'Armlock',
    description_ja: '肘関節を極める技',
    description_en: 'Elbow joint lock',
    description_pt: 'Chave de braço',
    difficulty: 2,
    belt_requirement: 'white'
  },
  {
    category_slug: 'submissions',
    name_ja: '三角絞め',
    name_en: 'Triangle Choke',
    name_pt: 'Triângulo',
    description_ja: '脚を使った絞め技',
    description_en: 'Choke using legs',
    description_pt: 'Estrangulamento com as pernas',
    difficulty: 3,
    belt_requirement: 'blue'
  }
];

// Belt requirements
const beltRequirements = [
  {
    belt: 'white',
    min_techniques: 10,
    min_training_hours: 0,
    description_ja: '基本的な動作とポジションの理解',
    description_en: 'Understanding basic movements and positions',
    description_pt: 'Compreensão de movimentos e posições básicas'
  },
  {
    belt: 'blue',
    min_techniques: 30,
    min_training_hours: 200,
    description_ja: '基本技術の習得と応用',
    description_en: 'Mastery of basic techniques and applications',
    description_pt: 'Domínio de técnicas básicas e aplicações'
  },
  {
    belt: 'purple',
    min_techniques: 60,
    min_training_hours: 500,
    description_ja: '中級技術と戦略の理解',
    description_en: 'Understanding intermediate techniques and strategy',
    description_pt: 'Compreensão de técnicas intermediárias e estratégia'
  },
  {
    belt: 'brown',
    min_techniques: 100,
    min_training_hours: 800,
    description_ja: '上級技術と指導能力',
    description_en: 'Advanced techniques and teaching ability',
    description_pt: 'Técnicas avançadas e capacidade de ensino'
  },
  {
    belt: 'black',
    min_techniques: 150,
    min_training_hours: 1200,
    description_ja: 'BJJの完全な理解と熟練',
    description_en: 'Complete understanding and mastery of BJJ',
    description_pt: 'Compreensão completa e domínio do BJJ'
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seed...\n');

    // 1. Insert categories
    console.log('📁 Creating technique categories...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('technique_categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();
    
    if (categoryError) throw categoryError;
    console.log(`✅ Created ${categoryData.length} categories`);

    // 2. Map category slugs to IDs
    const categoryMap = {};
    categoryData.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // 3. Insert techniques with category IDs
    console.log('\n🥋 Creating techniques...');
    const techniquesWithIds = techniques.map(tech => ({
      ...tech,
      category_id: categoryMap[tech.category_slug],
      category_slug: undefined // Remove slug field
    }));

    const { data: techniqueData, error: techniqueError } = await supabase
      .from('techniques')
      .upsert(techniquesWithIds, { onConflict: 'name_en' })
      .select();
    
    if (techniqueError) throw techniqueError;
    console.log(`✅ Created ${techniqueData.length} techniques`);

    // 4. Insert belt requirements
    console.log('\n🎖️  Creating belt requirements...');
    const { data: beltData, error: beltError } = await supabase
      .from('belt_requirements')
      .upsert(beltRequirements, { onConflict: 'belt' })
      .select();
    
    if (beltError) throw beltError;
    console.log(`✅ Created ${beltData.length} belt requirements`);

    // 5. Create sample flows
    console.log('\n🔄 Creating sample flows...');
    const sampleFlows = [
      {
        title: 'White Belt Fundamentals',
        description: 'Essential techniques for beginners',
        is_public: true,
        nodes: JSON.stringify([]),
        edges: JSON.stringify([])
      },
      {
        title: 'Guard Passing System',
        description: 'Comprehensive guard passing flow',
        is_public: true,
        nodes: JSON.stringify([]),
        edges: JSON.stringify([])
      }
    ];

    const { data: flowData, error: flowError } = await supabase
      .from('flows')
      .upsert(sampleFlows, { onConflict: 'title' })
      .select();
    
    if (flowError) {
      console.warn('⚠️  Could not create flows (might need user context)');
    } else {
      console.log(`✅ Created ${flowData.length} sample flows`);
    }

    console.log('\n✨ Seed completed successfully!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoryData.length}`);
    console.log(`   - Techniques: ${techniqueData.length}`);
    console.log(`   - Belt Requirements: ${beltData.length}`);
    if (flowData) console.log(`   - Sample Flows: ${flowData.length}`);
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Upload technique videos');
    console.log('   2. Link videos to techniques');
    console.log('   3. Create detailed flows');
    console.log('   4. Add more techniques as needed');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
seedData();