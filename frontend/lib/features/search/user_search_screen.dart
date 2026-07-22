import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../shared/models/user_model.dart';
import '../../providers/chat_provider.dart';

class UserSearchScreen extends ConsumerStatefulWidget {
  const UserSearchScreen({super.key});

  @override
  ConsumerState<UserSearchScreen> createState() => _UserSearchScreenState();
}

class _UserSearchScreenState extends ConsumerState<UserSearchScreen> {
  final _searchController = TextEditingController();
  List<UserModel> _searchResults = [];
  bool _isSearching = false;
  String? _searchError;

  Future<void> _performSearch(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
        _searchError = null;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _searchError = null;
    });

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
    } catch (e) {
      setState(() {
        _searchError = 'Error searching users: ${e.toString()}';
        _isSearching = false;
      });
    }
  }

  Future<void> _startConversation(UserModel targetUser) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final res = await apiClient.post('/chats/private', data: {'targetUserId': targetUser.id});

      if (res.statusCode == 200 || res.statusCode == 201) {
        final chatId = res.data['data']['_id'] ?? res.data['data']['id'];
        ref.refresh(chatListProvider);
        if (mounted) {
          context.push('/chat/$chatId');
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to start chat: $e'), backgroundColor: AppColors.errorRed),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search users by @username or name...',
            border: InputBorder.none,
            focusedBorder: InputBorder.none,
            fillColor: Colors.transparent,
          ),
          onChanged: _performSearch,
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                _performSearch('');
              },
            ),
        ],
      ),
      body: Column(
        children: [
          if (_isSearching)
            const LinearProgressIndicator(color: AppColors.primary),
          if (_searchError != null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(_searchError!, style: const TextStyle(color: AppColors.errorRed)),
            ),
          Expanded(
            child: _searchResults.isEmpty && !_isSearching
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search, size: 64, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text(
                          _searchController.text.isEmpty
                              ? 'Type a handle to find people on YoumeChat'
                              : 'No users found matching "${_searchController.text}"',
                          style: const TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: _searchResults.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.darkCard),
                    itemBuilder: (context, index) {
                      final user = _searchResults[index];
                      return ListTile(
                        onTap: () => _startConversation(user),
                        leading: Stack(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: AppColors.primary,
                              backgroundImage: user.avatarUrl.isNotEmpty ? NetworkImage(user.avatarUrl) : null,
                              child: user.avatarUrl.isEmpty
                                  ? Text(user.displayName.substring(0, 1).toUpperCase())
                                  : null,
                            ),
                            if (user.isOnline)
                              Positioned(
                                right: 0,
                                bottom: 0,
                                child: Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: AppColors.onlineGreen,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppColors.darkBackground, width: 2),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        title: Text(user.displayName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('@${user.username} • ${user.statusMessage}', maxLines: 1, overflow: TextOverflow.ellipsis),
                        trailing: const Icon(Icons.message_outlined, color: AppColors.primary),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
