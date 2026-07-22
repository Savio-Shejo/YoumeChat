import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/constants/app_constants.dart';

class SocketService {
  io.Socket? _socket;
  bool _isConnected = false;
  String? _lastToken;

  bool get isConnected => _isConnected;
  io.Socket? get socket => _socket;

  void connect(String token) {
    _lastToken = token;
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
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
      print('Socket.IO Client Connected successfully');
    });

    _socket!.onReconnect((_) {
      _isConnected = true;
      print('Socket.IO Reconnected to server');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('Socket.IO Client Disconnected');
    });

    _socket!.onError((data) {
      print('Socket.IO Error: $data');
    });
  }

  void joinChat(String chatId) {
    _socket?.emit('join_chat', {'chatId': chatId});
  }

  void leaveChat(String chatId) {
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

  void sendMessage(String chatId, String content, {String type = 'text', Function(dynamic)? ack}) {
    _socket?.emitWithAck('message:send', {
      'chatId': chatId,
      'type': type,
      'content': content,
    }, ack: (response) {
      if (ack != null) ack(response);
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
