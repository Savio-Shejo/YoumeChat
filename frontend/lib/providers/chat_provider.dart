import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../shared/models/chat_model.dart';
import '../shared/models/message_model.dart';
import 'auth_provider.dart';

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
