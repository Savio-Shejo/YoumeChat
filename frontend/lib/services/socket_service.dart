import 'dart:developer' as developer;

import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/network/remote_config.dart';

class SocketService {
  io.Socket? _socket;
  bool _isConnected = false;
  String? _currentChatId;

  bool get isConnected => _isConnected;
  io.Socket? get socket => _socket;

  void connect(String token) {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(
      RemoteConfig.backendUrl,
      io.OptionBuilder()
          .setTransports(['polling', 'websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(15)
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(5000)
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      developer.log('Socket.IO client connected successfully', name: 'SocketService');
      if (_currentChatId != null) {
        _socket?.emit('join_chat', {'chatId': _currentChatId});
      }
    });

    _socket!.onReconnect((_) {
      _isConnected = true;
      developer.log('Socket.IO reconnected to server', name: 'SocketService');
      if (_currentChatId != null) {
        _socket?.emit('join_chat', {'chatId': _currentChatId});
      }
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      developer.log('Socket.IO client disconnected', name: 'SocketService');
    });

    _socket!.onError((data) {
      developer.log('Socket.IO error: $data', name: 'SocketService');
    });
  }

  void joinChat(String chatId) {
    _currentChatId = chatId;
    if (_socket != null && _socket!.connected) {
      _socket?.emit('join_chat', {'chatId': chatId});
    }
  }

  void leaveChat(String chatId) {
    if (_currentChatId == chatId) {
      _currentChatId = null;
    }
    _socket?.emit('leave_chat', {'chatId': chatId});
  }

  void startTyping(String chatId) {
    _socket?.emit('typing:start', {'chatId': chatId});
    _socket?.emit('typing', {'chatId': chatId});
  }

  void stopTyping(String chatId) {
    _socket?.emit('typing:stop', {'chatId': chatId});
    _socket?.emit('stop_typing', {'chatId': chatId});
  }

  void markRead(String chatId) {
    _socket?.emit('read:receipt', {'chatId': chatId});
  }

  void sendMessage(String chatId, String content, {String type = 'text'}) {
    _socket?.emit('message:send', {
      'chatId': chatId,
      'type': type,
      'content': content,
    });
  }

  // WebRTC Call Signaling Methods
  void inviteCall(String targetUserId, dynamic offer, String callType) {
    _socket?.emit('call:invite', {
      'targetUserId': targetUserId,
      'offer': offer,
      'callType': callType,
    });
  }

  void acceptCall(String callerId, dynamic answer) {
    _socket?.emit('call:accept', {
      'callerId': callerId,
      'answer': answer,
    });
  }

  void rejectCall(String callerId, {String? reason}) {
    _socket?.emit('call:reject', {
      'callerId': callerId,
      'reason': reason,
    });
  }

  void sendIceCandidate(String targetUserId, dynamic candidate) {
    _socket?.emit('call:ice_candidate', {
      'targetUserId': targetUserId,
      'candidate': candidate,
    });
  }

  void endCall(String targetUserId) {
    _socket?.emit('call:end', {
      'targetUserId': targetUserId,
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}
