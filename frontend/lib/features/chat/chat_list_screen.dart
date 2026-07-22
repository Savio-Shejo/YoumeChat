import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(authProvider).user;
    final chatsAsync = ref.watch(chatListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('YoumeChat'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
          if (currentUser?.role == 'Admin')
            IconButton(
              icon: const Icon(Icons.admin_panel_settings, color: AppColors.accent),
              onPressed: () => context.push('/admin'),
            ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'new_group') context.push('/create-group');
              if (value == 'profile') context.push('/profile');
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'new_group',
                child: Row(
                  children: [
                    Icon(Icons.group_add, size: 20, color: AppColors.primaryLight),
                    SizedBox(width: 12),
                    Text('New Group'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person, size: 20, color: AppColors.primaryLight),
                    SizedBox(width: 12),
                    Text('My Profile'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: chatsAsync.when(
        data: (chats) {
          if (chats.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.chat_bubble_outline, size: 64, color: AppColors.textMuted),
                  const SizedBox(height: 16),
                  const Text(
                    'No active conversations yet',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () => context.push('/search'),
                        icon: const Icon(Icons.person_search),
                        label: const Text('Find People'),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton.icon(
                        onPressed: () => context.push('/create-group'),
                        icon: const Icon(Icons.group_add),
                        label: const Text('New Group'),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: chats.length,
            separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.darkCard),
            itemBuilder: (context, index) {
              final chat = chats[index];
              final otherUser = chat.participants.firstWhere(
                (p) => p.id != currentUser?.id,
                orElse: () => chat.participants.first,
              );

              return ListTile(
                onTap: () => context.push('/chat/${chat.id}'),
                leading: Stack(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: AppColors.primary,
                      backgroundImage: (chat.type == 'group' ? null : (otherUser.avatarUrl.isNotEmpty ? NetworkImage(otherUser.avatarUrl) : null)),
                      child: chat.type == 'group'
                          ? const Icon(Icons.group, color: Colors.white)
                          : (otherUser.avatarUrl.isEmpty ? Text(otherUser.displayName.substring(0, 1).toUpperCase()) : null),
                    ),
                    if (chat.type != 'group' && otherUser.isOnline)
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: AppColors.onlineGreen,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.darkBackground, width: 2),
                          ),
                        ),
                      ),
                  ],
                ),
                title: Text(
                  chat.type == 'group' ? 'Group Chat' : otherUser.displayName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  chat.lastMessage?.content ?? 'Media attachment',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      '10:45 AM',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                    if (chat.unreadCount > 0) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${chat.unreadCount}',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading chats: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/search'),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.message, color: Colors.white),
      ),
    );
  }
}
