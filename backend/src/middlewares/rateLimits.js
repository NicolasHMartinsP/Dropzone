import { rateLimit } from 'express-rate-limit';

// Cria um limitador: no máximo `maxRequests` por IP dentro de `minutes` minutos.
function limitRequests({ minutes, maxRequests, message }) {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMIT', message } },
  });
}

// Operações pesadas: downloads, conversões e cadastro de usuário.
export const processingLimit = limitRequests({
  minutes: 1,
  maxRequests: 20,
  message: 'Muitas solicitações. Aguarde um minuto.',
});

// Login: limite mais rígido para dificultar tentativas de adivinhar senhas.
export const loginLimit = limitRequests({
  minutes: 15,
  maxRequests: 10,
  message: 'Muitas tentativas. Aguarde 15 minutos.',
});
