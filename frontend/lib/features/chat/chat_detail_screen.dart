import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../services/socket_service.dart';
import '../../shared/models/message_model.dart';
import '../../shared/models/chat_model.dart';
import '../../shared/models/user_model.dart';
import 'dart:async';

class ChatDetailScreen extends ConsumerStatefulWidget {
  final String chatId;
  const ChatDetailScreen({super.key, required this.chatId});

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  List<MessageModel> _messages = [];
  bool _isOtherTyping = false;
  String? _typingUsername;
  Timer? _typingTimer;
  bool _isLoadingMore = false;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final socketService = ref.read(socketServiceProvider);
      socketService.joinChat(widget.chatId);

      final socket = socketService.socket;
      if (socket != null) {
        socket.off('receive_message', _onNewMessageReceived);
        socket.off('message:new', _onNewMessageReceived);
        socket.on('receive_message', _onNewMessageReceived);
        socket.on('message:new', _onNewMessageReceived);
        socket.on('typing:start', _onTypingStart);
        socket.on('typing:stop', _onTypingStop);
        socket.on('call:invite', _onIncomingCall);
      }
    });
  }


  void _onIncomingCall(dynamic data) {
    if (data is Map && mounted) {
      final callerName = data['callerName'] ?? 'Someone';
      final callType = data['callType'] ?? 'voice';
      final callerId = data['callerId'];

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          return AlertDialog(
            backgroundColor: AppColors.darkSurface,
            title: Row(
              children: [
                Icon(callType == 'video' ? Icons.videocam : Icons.phone, color: AppColors.primaryLight),
                const SizedBox(width: 8),
                Text('Incoming ${callType == 'video' ? 'Video' : 'Voice'} Call'),
              ],
            ),
            content: Text('$callerName is calling you...'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  ref.read(socketServiceProvider).rejectCall(callerId);
                },
                child: const Text('DECLINE', style: TextStyle(color: AppColors.errorRed)),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ref.read(socketServiceProvider).acceptCall(callerId, {'sdp': 'mock_sdp_answer'});
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Connected to $callType call with $callerName'), backgroundColor: AppColors.onlineGreen),
                  );
                },
                child: const Text('ACCEPT'),
              ),
            ],
          );
        },
      );
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      _loadMoreOlderMessages();
    }
  }

  Future<void> _loadMoreOlderMessages() async {
    if (_isLoadingMore || !_hasMore || _messages.isEmpty) return;

    setState(() {
      _isLoadingMore = true;
    });

    try {
      final apiClient = ref.read(apiClientProvider);
      final oldestDate = _messages.last.createdAt.toIso8601String();
      final res = await apiClient.get('/messages/chat/${widget.chatId}', queryParameters: {
        'limit': 30,
        'before': oldestDate,
      });

      if (res.statusCode == 200 && res.data['success']) {
        final List list = res.data['data'];
        final olderMsgs = list.map((m) => MessageModel.fromJson(m)).toList();

        if (olderMsgs.isEmpty) {
          _hasMore = false;
        } else {
          setState(() {
            for (var om in olderMsgs) {
              if (!_messages.any((m) => m.id == om.id)) {
                _messages.add(om);
              }
            }
          });
        }
      }
    } catch (_) {
    } finally {
      setState(() {
        _isLoadingMore = false;
      });
    }
  }

  void _onNewMessageReceived(dynamic data) {
    if (data is Map<String, dynamic> && mounted) {
      final newMsg = MessageModel.fromJson(data);
      setState(() {
        final idx = _messages.indexWhere((m) =>
          m.id == newMsg.id ||
          (m.content == newMsg.content && m.sender.id == newMsg.sender.id && m.createdAt.difference(newMsg.createdAt).inSeconds.abs() < 10)
        );
        if (idx > -1) {
          _messages[idx] = newMsg;
        } else {
          _messages.insert(0, newMsg);
        }
      });
      _scrollToBottom();
    }
  }

  void _onTypingStart(dynamic data) {
    if (data is Map && data['chatId'] == widget.chatId && mounted) {
      setState(() {
        _isOtherTyping = true;
        _typingUsername = data['displayName'] ?? data['username'] ?? 'User';
      });
    }
  }

  void _onTypingStop(dynamic data) {
    if (data is Map && data['chatId'] == widget.chatId && mounted) {
      setState(() {
        _isOtherTyping = false;
      });
    }
  }

  void _onTextChanged(String text) {
    final socketService = ref.read(socketServiceProvider);
    if (text.isNotEmpty) {
      socketService.startTyping(widget.chatId);
      _typingTimer?.cancel();
      _typingTimer = Timer(const Duration(seconds: 3), () {
        socketService.stopTyping(widget.chatId);
      });
    } else {
      socketService.stopTyping(widget.chatId);
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage({String type = 'text', String? mediaUrl, String? content}) {
    final text = content ?? _messageController.text.trim();
    if (text.isEmpty && mediaUrl == null) return;

    final currentUser = ref.read(authProvider).user;
    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';

    final optimisticMsg = MessageModel(
      id: tempId,
      chatId: widget.chatId,
      sender: currentUser ?? UserModel(id: '', firebaseUid: '', email: '', username: 'me', displayName: 'Me', avatarUrl: '', statusMessage: '', isOnline: true, lastSeen: DateTime.now(), role: 'User', isBanned: false),
      type: type,
      content: text,
      mediaUrl: mediaUrl,
      isDeletedForEveryone: false,
      deliveryStatus: 'sent',
      reactions: [],
      createdAt: DateTime.now(),
      isOptimistic: true,
    );

    setState(() {
      _messages.insert(0, optimisticMsg);
    });

    _messageController.clear();
    _scrollToBottom();

    final socketService = ref.read(socketServiceProvider);
    socketService.stopTyping(widget.chatId);
    socketService.sendMessage(widget.chatId, text, type: type, ack: (response) {
      if (response != null && response['success'] == true && mounted) {
        final confirmedMsg = MessageModel.fromJson(response['data']);
        setState(() {
          final idx = _messages.indexWhere((m) => m.id == tempId);
          if (idx > -1) {
            _messages[idx] = confirmedMsg;
          }
        });
      }
    });
  }

  void _initiateCall(String callType) {
    final socketService = ref.read(socketServiceProvider);
    socketService.inviteCall('target_user_id', {'sdp': 'mock_sdp_offer'}, callType);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Calling user via $callType call...'), backgroundColor: AppColors.primary),
    );
  }

  void _showAttachmentSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildAttachmentOption(Icons.image, 'Photo', Colors.purple, () {
                Navigator.pop(context);
                _sendMessage(type: 'image', mediaUrl: 'https://picsum.photos/600/400', content: 'Shared an image');
              }),
              _buildAttachmentOption(Icons.videocam, 'Video', Colors.pink, () {
                Navigator.pop(context);
                _sendMessage(type: 'video', mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', content: 'Shared a video');
              }),
              _buildAttachmentOption(Icons.insert_drive_file, 'Document', Colors.blue, () {
                Navigator.pop(context);
                _sendMessage(type: 'document', mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', content: 'Project_Specification.pdf');
              }),
              _buildAttachmentOption(Icons.mic, 'Audio Note', Colors.orange, () {
                Navigator.pop(context);
                _sendMessage(type: 'audio', mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', content: 'Voice message (0:15)');
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAttachmentOption(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(radius: 26, backgroundColor: color.withOpacity(0.2), child: Icon(icon, color: color, size: 28)),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildMessageContent(MessageModel msg) {
    if (msg.type == 'image' && msg.mediaUrl != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: msg.mediaUrl!,
              width: 220,
              height: 160,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                width: 220,
                height: 160,
                color: AppColors.darkCard,
                child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
              ),
              errorWidget: (context, url, error) => const Icon(Icons.broken_image, size: 48, color: AppColors.errorRed),
            ),
          ),
          if (msg.content != null && msg.content!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(msg.content!, style: const TextStyle(color: Colors.white, fontSize: 14)),
          ],
        ],
      );
    } else if (msg.type == 'document') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.picture_as_pdf, color: AppColors.errorRed, size: 32),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              msg.content ?? 'Document Attachment',
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    } else if (msg.type == 'audio') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.play_circle_fill, color: AppColors.primaryLight, size: 32),
          const SizedBox(width: 8),
          Text(msg.content ?? 'Voice message', style: const TextStyle(color: Colors.white, fontSize: 14)),
        ],
      );
    }

    return Text(msg.content ?? '', style: const TextStyle(color: Colors.white, fontSize: 15));
  }

  Widget _buildStatusIcon(String status, bool isOptimistic) {
    if (isOptimistic || status == 'sending') {
      return const Icon(Icons.access_time_rounded, size: 12, color: Colors.white70);
    } else if (status == 'delivered') {
      return const Icon(Icons.done_all, size: 14, color: Colors.white70);
    } else if (status == 'read') {
      return const Icon(Icons.done_all, size: 14, color: AppColors.readCheckBlue);
    } else {
      return const Icon(Icons.check, size: 14, color: Colors.white70);
    }
  }

  @override
  void dispose() {
    final socketService = ref.read(socketServiceProvider);
    socketService.leaveChat(widget.chatId);

    final socket = socketService.socket;
    if (socket != null) {
      socket.off('message:new', _onNewMessageReceived);
      socket.off('receive_message', _onNewMessageReceived);
      socket.off('typing:start', _onTypingStart);
      socket.off('typing:stop', _onTypingStop);
      socket.off('call:invite', _onIncomingCall);
    }

    _messageController.dispose();
    _scrollController.dispose();
    _typingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatMessagesProvider(widget.chatId));
    final currentUser = ref.watch(authProvider).user;
    final chats = ref.watch(chatListProvider).asData?.value ?? [];

    final currentChat = chats.firstWhere(
      (c) => c.id == widget.chatId,
      orElse: () => ChatModel(id: widget.chatId, type: 'private', participants: [], isPinnedBy: [], isMutedBy: [], isArchivedBy: []),
    );

    UserModel? recipient;
    if (currentChat.participants.isNotEmpty) {
      recipient = currentChat.participants.firstWhere(
        (p) => p.id.isNotEmpty && p.id != currentUser?.id,
        orElse: () => currentChat.participants.first,
      );
    }
    if ((recipient == null || recipient.displayName.isEmpty || recipient.displayName == 'Chat User') && _messages.isNotEmpty) {
      final otherMsg = _messages.firstWhere(
        (m) => m.sender.id.isNotEmpty && m.sender.id != currentUser?.id,
        orElse: () => _messages.first,
      );
      if (otherMsg.sender.id != currentUser?.id) {
        recipient = otherMsg.sender;
      }
    }

    final headerName = (recipient != null && recipient.displayName.isNotEmpty)
        ? recipient.displayName
        : (recipient?.username.isNotEmpty == true ? recipient!.username : 'Chat User');
    final avatarUrl = recipient?.avatarUrl ?? '';
    final isOnline = recipient?.isOnline ?? true;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primary,
              backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
              child: avatarUrl.isEmpty
                  ? Text(
                      (headerName.isNotEmpty ? headerName[0] : 'U').toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    headerName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    _isOtherTyping
                        ? '$_typingUsername is typing...'
                        : (isOnline ? 'Online' : 'Offline'),
                    style: TextStyle(
                      fontSize: 12,
                      color: _isOtherTyping
                          ? AppColors.primaryLight
                          : (isOnline ? AppColors.onlineGreen : AppColors.textMuted),
                      fontWeight: _isOtherTyping ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.phone), onPressed: () => _initiateCall('voice')),
          IconButton(icon: const Icon(Icons.videocam), onPressed: () => _initiateCall('video')),
          IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              data: (historyMessages) {
                if (_messages.isEmpty && historyMessages.isNotEmpty) {
                  _messages = [...historyMessages];
                }

                if (_messages.isEmpty) {
                  return const Center(
                    child: Text('Say hello! Send your first message.', style: TextStyle(color: AppColors.textMuted)),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  reverse: true,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length + (_isLoadingMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length) {
                      return const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      );
                    }

                    final msg = _messages[index];
                    final isMe = msg.sender.id == currentUser?.id;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        decoration: BoxDecoration(
                          color: isMe ? AppColors.primary : AppColors.darkSurface,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: Radius.circular(isMe ? 16 : 0),
                            bottomRight: Radius.circular(isMe ? 0 : 16),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildMessageContent(msg),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Text(
                                  '${msg.createdAt.hour}:${msg.createdAt.minute.toString().padLeft(2, '0')}',
                                  style: TextStyle(color: isMe ? Colors.white70 : AppColors.textMuted, fontSize: 10),
                                ),
                                if (isMe) ...[
                                  const SizedBox(width: 4),
                                  _buildStatusIcon(msg.deliveryStatus, msg.isOptimistic),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error loading messages: $err')),
            ),
          ),

          if (_isOtherTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              alignment: Alignment.centerLeft,
              color: AppColors.darkSurface.withOpacity(0.5),
              child: Text(
                '$_typingUsername is typing...',
                style: const TextStyle(color: AppColors.primaryLight, fontSize: 12, fontStyle: FontStyle.italic),
              ),
            ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: AppColors.darkSurface,
            child: Row(
              children: [
                IconButton(icon: const Icon(Icons.attach_file, color: AppColors.textMuted), onPressed: _showAttachmentSheet),
                IconButton(icon: const Icon(Icons.camera_alt, color: AppColors.textMuted), onPressed: _showAttachmentSheet),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    onChanged: _onTextChanged,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    onPressed: () => _sendMessage(type: 'text'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
