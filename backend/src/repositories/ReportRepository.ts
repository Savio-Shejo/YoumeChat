import { Report, IReport } from '../models/Report';

export class ReportRepository {
  public async createReport(reportData: Partial<IReport>): Promise<IReport> {
    const report = new Report(reportData);
    return report.save();
  }

  public async getReports(limit: number = 20, page: number = 1, status?: string): Promise<{ reports: IReport[]; total: number }> {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'username displayName email')
        .populate('reviewedBy', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Report.countDocuments(filter),
    ]);

    return { reports, total };
  }

  public async updateReportStatus(reportId: string, status: string, reviewedBy: string, notes?: string): Promise<IReport | null> {
    return Report.findByIdAndUpdate(
      reportId,
      { status, reviewedBy, resolutionNotes: notes },
      { new: true }
    ).exec();
  }
}

export const reportRepository = new ReportRepository();
