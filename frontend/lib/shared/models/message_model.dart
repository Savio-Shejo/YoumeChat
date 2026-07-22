import 'user_model.dart';

class ReactionModel {
  final String userId;
  final String emoji;

  ReactionModel({required this.userId, required this.emoji});

  factory ReactionModel.fromJson(Map<String, dynamic> json) {
    return ReactionModel(
      userId: json['user'] is Map ? json['user']['_id'] : (json['user'] ?? ''),
      emoji: json['emoji'] ?? '',
    );
  }
}

class LocationModel {
  final double latitude;
  final double longitude;
  final String? title;

  LocationModel({required this.latitude, required this.longitude, this.title});

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      title: json['title'],
    );
  }
}

class MessageModel {
  final String id;
  final String chatId;
  final UserModel sender;
  final String type; // 'text' | 'image' | 'video' | 'audio' | 'document' | 'location'
  final String? content;
  final String? mediaUrl;
  final String? thumbnailUrl;
  final String? fileName;
  final int? fileSize;
  final int? duration;
  final LocationModel? location;
  final String? replyToMessageId;
  final bool isDeletedForEveryone;
  final String deliveryStatus; // 'sending' | 'sent' | 'delivered' | 'read'
  final List<ReactionModel> reactions;
  final DateTime createdAt;
  final bool isOptimistic;

  MessageModel({
    required this.id,
    required this.chatId,
    required this.sender,
    required this.type,
    this.content,
    this.mediaUrl,
    this.thumbnailUrl,
    this.fileName,
    this.fileSize,
    this.duration,
    this.location,
    this.replyToMessageId,
    required this.isDeletedForEveryone,
    required this.deliveryStatus,
    required this.reactions,
    required this.createdAt,
    this.isOptimistic = false,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    UserModel senderObj;
    if (json['sender'] is Map<String, dynamic>) {
      senderObj = UserModel.fromJson(json['sender']);
    } else {
      senderObj = UserModel(
        id: json['sender'] ?? '',
        firebaseUid: '',
        email: '',
        username: 'user',
        displayName: 'User',
        avatarUrl: '',
        statusMessage: '',
        isOnline: false,
        lastSeen: DateTime.now(),
        role: 'User',
        isBanned: false,
      );
    }

    return MessageModel(
      id: json['_id'] ?? json['id'] ?? 'temp_${DateTime.now().millisecondsSinceEpoch}',
      chatId: json['chat'] is Map ? json['chat']['_id'] : (json['chat'] ?? ''),
      sender: senderObj,
      type: json['type'] ?? 'text',
      content: json['content'],
      mediaUrl: json['mediaUrl'],
      thumbnailUrl: json['thumbnailUrl'],
      fileName: json['fileName'],
      fileSize: json['fileSize'],
      duration: json['duration'],
      location: json['location'] != null ? LocationModel.fromJson(json['location']) : null,
      replyToMessageId: json['replyToMessage'] is Map ? json['replyToMessage']['_id'] : json['replyToMessage'],
      isDeletedForEveryone: json['isDeletedForEveryone'] ?? false,
      deliveryStatus: json['deliveryStatus'] ?? 'sent',
      reactions: (json['reactions'] as List?)?.map((r) => ReactionModel.fromJson(r)).toList() ?? [],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      isOptimistic: false,
    );
  }
}
