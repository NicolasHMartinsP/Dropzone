import { Router } from 'express';
import { systemRoutes } from './system.routes.js';
import { authRoutes } from './auth.routes.js';
import { usersRoutes } from './users.routes.js';
import { downloadsRoutes } from './downloads.routes.js';
import { conversionsRoutes } from './conversions.routes.js';
import { historyRoutes } from './history.routes.js';
import { filesRoutes } from './files.routes.js';

// Junta todas as rotas da API. O app.js monta este router em /api,
// então '/users' aqui vira '/api/users' no navegador.
export const apiRoutes = Router();

apiRoutes.use('/', systemRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', usersRoutes);
apiRoutes.use('/downloads', downloadsRoutes);
apiRoutes.use('/conversions', conversionsRoutes);
apiRoutes.use('/history', historyRoutes);
apiRoutes.use('/files', filesRoutes);
