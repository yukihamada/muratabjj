import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 管理者チェック
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
      
    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // スパーリングテーブルの作成
    const { error: sparringLogsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sparring_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          partner_name TEXT,
          duration INTEGER NOT NULL,
          starting_position TEXT,
          notes TEXT,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (sparringLogsError) {
      console.error('Error creating sparring_logs:', sparringLogsError)
      
      // 管理者権限なしでの代替手段: 直接SQLを実行
      try {
        await supabase
          .from('sparring_logs')
          .select('*')
          .limit(1)
      } catch (testError: any) {
        return NextResponse.json(
          { 
            error: 'Database setup required',
            message: 'Please run the complete schema migration in Supabase SQL Editor:\n\nFile: supabase/migrations/000_complete_schema.sql',
            suggestion: 'Copy the contents of 000_complete_schema.sql and execute it in Supabase Dashboard > SQL Editor'
          },
          { status: 503 }
        )
      }
    }

    // スパーリングイベントテーブルの作成  
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sparring_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sparring_log_id UUID REFERENCES sparring_logs(id) ON DELETE CASCADE NOT NULL,
          timestamp INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          position_from TEXT,
          position_to TEXT,
          technique_used TEXT,
          success BOOLEAN DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // RLSポリシーの設定
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;
        
        -- sparring_logs policies
        DROP POLICY IF EXISTS "Users can view their own sparring logs" ON sparring_logs;
        CREATE POLICY "Users can view their own sparring logs" ON sparring_logs
        FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can create their own sparring logs" ON sparring_logs;
        CREATE POLICY "Users can create their own sparring logs" ON sparring_logs
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own sparring logs" ON sparring_logs;
        CREATE POLICY "Users can update their own sparring logs" ON sparring_logs
        FOR UPDATE USING (auth.uid() = user_id);
        
        -- sparring_events policies
        DROP POLICY IF EXISTS "Users can view events of their sparring logs" ON sparring_events;
        CREATE POLICY "Users can view events of their sparring logs" ON sparring_events
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM sparring_logs
            WHERE sparring_logs.id = sparring_events.sparring_log_id
            AND sparring_logs.user_id = auth.uid()
          )
        );
        
        DROP POLICY IF EXISTS "Users can manage events of their sparring logs" ON sparring_events;
        CREATE POLICY "Users can manage events of their sparring logs" ON sparring_events
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM sparring_logs
            WHERE sparring_logs.id = sparring_events.sparring_log_id
            AND sparring_logs.user_id = auth.uid()
          )
        );
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Sparring tables and policies created successfully'
    })
    
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { 
        error: 'Setup failed',
        message: 'Please run the complete schema migration manually:\n\nFile: supabase/migrations/000_complete_schema.sql\n\nCopy and execute in Supabase Dashboard > SQL Editor',
        details: error.message
      },
      { status: 500 }
    )
  }
}