import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final apiClient = ref.watch(apiClientProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Moderation Center'),
        backgroundColor: AppColors.darkSurface,
      ),
      body: FutureBuilder(
        future: apiClient.get('/admin/analytics'),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Admin access error: ${snapshot.error}'));
          }

          final data = snapshot.data?.data['data'] ?? {};

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Real-Time Analytics',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.4,
                  children: [
                    _buildMetricCard('Total Users', '${data['totalUsers'] ?? 0}', Icons.people, AppColors.primary),
                    _buildMetricCard('Online Now', '${data['activeUsers'] ?? 0}', Icons.online_prediction, AppColors.onlineGreen),
                    _buildMetricCard('Total Messages', '${data['totalMessages'] ?? 0}', Icons.message, AppColors.secondary),
                    _buildMetricCard('Pending Reports', '${data['pendingReports'] ?? 0}', Icons.report_problem, AppColors.accent),
                  ],
                ),
                const SizedBox(height: 32),
                const Text(
                  'Moderation Actions',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.block, color: AppColors.errorRed),
                  title: const Text('User Management & Bans'),
                  subtitle: const Text('View user roster, ban/unban abusive handles'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {},
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.warning_amber, color: AppColors.accent),
                  title: const Text('Review Flagged Reports'),
                  subtitle: const Text('Audit messages and group violation submissions'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {},
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Card(
      color: AppColors.darkSurface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
