import { AuditLog, IAuditLog } from './auditLog.model';
import { loggers } from '../../common/pinoLogger';

export class AuditLogService {
  public async logAction(
    actorId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<IAuditLog> {
    loggers.admin.info({ actorId, action, targetType, targetId, ipAddress }, 'Audit log entry created');

    const auditEntry = new AuditLog({
      actor: actorId,
      action,
      targetType,
      targetId,
      ipAddress,
      details,
    });

    return auditEntry.save();
  }

  public async getLogs(limit: number = 50, page: number = 1): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('actor', 'username displayName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      AuditLog.countDocuments(),
    ]);

    return { logs, total };
  }
}

export const auditLogService = new AuditLogService();
