// ============================================================
// Configuração da Vez
// Deixa vazio para correr em MODO DEMO (dados só no dispositivo).
// Preenche com os dados do teu projeto Supabase para ficar online:
//   Supabase → Project Settings → API → Project URL + anon public key
// ============================================================
window.VEZ_CONFIG = {
  SUPABASE_URL: 'https://whdeqwoxorpagvpjvrrv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZGVxd294b3JwYWd2cGp2cnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NDAxODEsImV4cCI6MjExMDMxNjE4MX0.zw8DAKCQXw-SQOlwgcDvlCdheBBNxwrWG4aXUxZxqiw',
  // Notificações push: chave pública VAPID (gera com: npx web-push generate-vapid-keys)
  VAPID_PUBLIC_KEY: '',
  // Número de WhatsApp da Marcaí, partilhado por todos os negócios (por agora, o número de teste da Meta)
  WA_SHARED_NUMBER: '15551746442',
  // Opcional: cada negócio liga o próprio número (Embedded Signup da Meta)
  META_APP_ID: '1687394812758915',
  META_CONFIG_ID: ''
};
