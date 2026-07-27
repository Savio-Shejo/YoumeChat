import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../shared/models/user_model.dart';

class CreateGroupScreen extends ConsumerStatefulWidget {
  const CreateGroupScreen({super.key});

  @override
  ConsumerState<CreateGroupScreen> createState() => _CreateGroupScreenState();
}

class _CreateGroupScreenState extends ConsumerState<CreateGroupScreen> {
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _searchController = TextEditingController();
  List<UserModel> _searchResults = [];
  final List<UserModel> _selectedMembers = [];
  bool _isSearching = false;
  bool _isCreating = false;

  Future<void> _searchUsers(String query) async {
    if (query.trim().isEmpty) {
      setState(() => _searchResults = []);
      return;
    }

    setState(() => _isSearching = true);
    try {
      final apiClient = ref.read(apiClientProvider);
      final res = await apiClient.get('/users/search', queryParameters: {'q': query.trim()});

      if (res.statusCode == 200 && res.data['success']) {
        final List list = res.data['data'];
        setState(() {
          _searchResults = list.map((u) => UserModel.fromJson(u)).toList();
          _isSearching = false;
        });
      }
    } catch (_) {
      setState(() => _isSearching = false);
    }
  }

  Future<void> _createGroup() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a group name'), backgroundColor: AppColors.errorRed),
      );
      return;
    }

    setState(() => _isCreating = true);

    try {
      final apiClient = ref.read(apiClientProvider);
      final res = await apiClient.post('/groups', data: {
        'name': name,
        'description': _descController.text.trim(),
        'memberIds': _selectedMembers.map((m) => m.id).toList(),
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final chatId = res.data['data']['chat']['_id'] ?? res.data['data']['chat']['id'];
        ref.invalidate(chatListProvider);
        if (mounted) {
          context.pushReplacement('/chat/$chatId');
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create group: $e'), backgroundColor: AppColors.errorRed),
      );
    } finally {
      if (mounted) setState(() => _isCreating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Group'),
        actions: [
          TextButton(
            onPressed: _isCreating ? null : _createGroup,
            child: _isCreating
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('CREATE', style: TextStyle(color: AppColors.primaryLight, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                  child: const Icon(Icons.group, size: 32, color: AppColors.primaryLight),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    children: [
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          hintText: 'Group Name',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _descController,
                        decoration: const InputDecoration(
                          hintText: 'Group Description (Optional)',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (_selectedMembers.isNotEmpty) ...[
            Container(
              height: 70,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _selectedMembers.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final member = _selectedMembers[index];
                  return Stack(
                    children: [
                      Column(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: AppColors.primary,
                            backgroundImage: member.avatarUrl.isNotEmpty ? NetworkImage(member.avatarUrl) : null,
                            child: member.avatarUrl.isEmpty ? Text(member.avatarInitial) : null,
                          ),
                          const SizedBox(height: 4),
                          Text(member.displayLabel, style: const TextStyle(fontSize: 10)),
                        ],
                      ),
                      Positioned(
                        right: 0,
                        top: 0,
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedMembers.removeAt(index)),
                          child: const CircleAvatar(radius: 8, backgroundColor: AppColors.errorRed, child: Icon(Icons.close, size: 10, color: Colors.white)),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const Divider(color: AppColors.darkCard),
          ],

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Add Members...',
                prefixIcon: Icon(Icons.person_add),
              ),
              onChanged: _searchUsers,
            ),
          ),

          if (_isSearching) const LinearProgressIndicator(color: AppColors.primary),

          Expanded(
            child: ListView.separated(
              itemCount: _searchResults.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.darkCard),
              itemBuilder: (context, index) {
                final user = _searchResults[index];
                final isSelected = _selectedMembers.any((m) => m.id == user.id);

                return ListTile(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedMembers.removeWhere((m) => m.id == user.id);
                      } else {
                        _selectedMembers.add(user);
                      }
                    });
                  },
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primary,
                    backgroundImage: user.avatarUrl.isNotEmpty ? NetworkImage(user.avatarUrl) : null,
                    child: user.avatarUrl.isEmpty ? Text(user.avatarInitial) : null,
                  ),
                  title: Text(user.displayLabel, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('@${user.username}'),
                  trailing: Icon(
                    isSelected ? Icons.check_circle : Icons.circle_outlined,
                    color: isSelected ? AppColors.primaryLight : AppColors.textMuted,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
