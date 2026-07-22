class UserModel {
  final String id;
  final String firebaseUid;
  final String email;
  final String username;
  final String displayName;
  final String avatarUrl;
  final String statusMessage;
  final bool isOnline;
  final DateTime lastSeen;
  final String role;
  final bool isBanned;

  UserModel({
    required this.id,
    required this.firebaseUid,
    required this.email,
    required this.username,
    required this.displayName,
    required this.avatarUrl,
    required this.statusMessage,
    required this.isOnline,
    required this.lastSeen,
    required this.role,
    required this.isBanned,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      firebaseUid: json['firebaseUid'] ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      displayName: json['displayName'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      statusMessage: json['statusMessage'] ?? 'Hey there! I am using YoumeChat.',
      isOnline: json['isOnline'] ?? false,
      lastSeen: json['lastSeen'] != null ? DateTime.parse(json['lastSeen']) : DateTime.now(),
      role: json['role'] ?? 'User',
      isBanned: json['isBanned'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firebaseUid': firebaseUid,
      'email': email,
      'username': username,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'statusMessage': statusMessage,
      'isOnline': isOnline,
      'lastSeen': lastSeen.toIso8601String(),
      'role': role,
      'isBanned': isBanned,
    };
  }
}
