import 'user_model.dart';
import 'message_model.dart';

class ChatModel {
  final String id;
  final String type; // 'private' | 'group'
  final List<UserModel> participants;
  final MessageModel? lastMessage;
  final List<String> isPinnedBy;
  final List<String> isMutedBy;
  final List<String> isArchivedBy;
  final int unreadCount;

  ChatModel({
    required this.id,
    required this.type,
    required this.participants,
    this.lastMessage,
    required this.isPinnedBy,
    required this.isMutedBy,
    required this.isArchivedBy,
    this.unreadCount = 0,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json, String currentUserId) {
    var rawParticipants = json['participants'] as List? ?? [];
    List<UserModel> parsedParticipants = rawParticipants
        .map((p) => p is Map<String, dynamic> ? UserModel.fromJson(p) : UserModel.fromJson({'_id': p}))
        .toList();

    int unread = 0;
    if (json['unreadCounts'] != null && json['unreadCounts'] is Map) {
      unread = (json['unreadCounts'][currentUserId] as int?) ?? 0;
    }

    return ChatModel(
      id: json['_id'] ?? json['id'] ?? '',
      type: json['type'] ?? 'private',
      participants: parsedParticipants,
      lastMessage: json['lastMessage'] != null && json['lastMessage'] is Map<String, dynamic>
          ? MessageModel.fromJson(json['lastMessage'])
          : null,
      isPinnedBy: (json['pinnedBy'] as List?)?.map((e) => e.toString()).toList() ?? [],
      isMutedBy: (json['isMutedBy'] as List?)?.map((e) => e.toString()).toList() ?? [],
      isArchivedBy: (json['isArchivedBy'] as List?)?.map((e) => e.toString()).toList() ?? [],
      unreadCount: unread,
    );
  }
}
