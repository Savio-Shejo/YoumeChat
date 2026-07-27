import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../shared/models/chat_model.dart';
import '../shared/models/message_model.dart';
import '../services/socket_service.dart';
import 'auth_provider.dart';

/// Tracks live online/offline status via socket events.
/// Map<userId, isOnline>
class PresenceNotifier extends StateNotifier<Map<String, bool>> {
  PresenceNotifier(SocketService socketService) : super({}) {
    final socket = socketService.socket;
    if (socket != null) {
      socket.on('online', (data) {
        if (data is Map && data['userId'] != null) {
          state = {...state, data['userId'].toString(): true};
        }
      });
      socket.on('offline', (data) {
        if (data is Map && data['userId'] != null) {
          state = {...state, data['userId'].toString(): false};
        }
      });
    }
  }

  bool isUserOnline(String userId, {bool fallback = false}) {
    return state[userId] ?? fallback;
  }
}

final presenceProvider = StateNotifierProvider<PresenceNotifier, Map<String, bool>>((ref) {
  final socketService = ref.watch(socketServiceProvider);
  return PresenceNotifier(socketService);
});

final chatListProvider = FutureProvider<List<ChatModel>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final currentUser = ref.watch(authProvider).user;
  if (currentUser == null) return [];

  final res = await apiClient.get('/chats');
  if (res.statusCode == 200 && res.data['success']) {
    final List list = res.data['data'];
    return list.map((c) => ChatModel.fromJson(c, currentUser.id)).toList();
  }
  return [];
});

final chatMessagesProvider = FutureProvider.family<List<MessageModel>, String>((ref, chatId) async {
  final apiClient = ref.watch(apiClientProvider);
  final res = await apiClient.get('/messages/chat/$chatId');
  if (res.statusCode == 200 && res.data['success']) {
    final List list = res.data['data'];
    return list.map((m) => MessageModel.fromJson(m)).toList();
  }
  return [];
});
