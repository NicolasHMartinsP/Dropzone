import { User } from './User.js';
import { Session } from './Session.js';
import { Job } from './Job.js';

User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'userId' });

export { User, Session, Job };
