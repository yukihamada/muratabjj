import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface WelcomeEmailProps {
  userFirstName: string
  loginUrl: string
}

export default function WelcomeEmail({
  userFirstName,
  loginUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Murata BJJへようこそ！柔術の学習を始めましょう。</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>Murata BJJへようこそ！</Heading>
            
            <Text style={text}>
              {userFirstName}様、
            </Text>
            
            <Text style={text}>
              Murata BJJへのご登録ありがとうございます。これから一緒に柔術の技術を向上させていきましょう！
            </Text>
            
            <Text style={text}>
              プラットフォームでは以下の機能をご利用いただけます：
            </Text>
            
            <ul style={list}>
              <li>🎥 プロによる技術動画の視聴</li>
              <li>🔄 フローエディタで技の連携を学習</li>
              <li>📊 習得度トラッキングで進捗を管理</li>
              <li>🤖 AI動画解析で技術を深く理解</li>
              <li>📝 スパーリングログで実戦経験を記録</li>
            </ul>
            
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={loginUrl}
              >
                学習を始める
              </Button>
            </Section>
            
            <Text style={text}>
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </Text>
            
            <Text style={footer}>
              OSS！
              <br />
              Murata BJJチーム
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#0f0f12',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const h1 = {
  color: '#e9e9ee',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '16px 0',
}

const text = {
  color: '#a6a5b1',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const list = {
  color: '#a6a5b1',
  fontSize: '16px',
  lineHeight: '28px',
  paddingLeft: '20px',
}

const buttonContainer = {
  padding: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#ea384c',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#666670',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 0 0',
}