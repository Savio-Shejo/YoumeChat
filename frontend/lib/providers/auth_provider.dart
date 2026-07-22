import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../core/storage/storage_service.dart';
import '../core/network/api_client.dart';
import '../shared/models/user_model.dart';
import '../services/socket_service.dart';

final storageServiceProvider = Provider<StorageService>((ref) => StorageService());

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(storageServiceProvider);
  return ApiClient(storageService: storage);
});

final socketServiceProvider = Provider<SocketService>((ref) => SocketService());

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({UserModel? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final StorageService _storageService;
  final SocketService _socketService;

  AuthNotifier(this._apiClient, this._storageService, this._socketService) : super(AuthState()) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    state = state.copyWith(isLoading: true);
    final token = await _storageService.getToken();
    if (token != null) {
      try {
        final res = await _apiClient.get('/users/profile');
        if (res.statusCode == 200 && res.data['success']) {
          final user = UserModel.fromJson(res.data['data']);
          _socketService.connect(token);
          state = state.copyWith(user: user, isLoading: false);
          return;
        }
      } catch (_) {
        await _storageService.clearAll();
      }
    }
    state = state.copyWith(isLoading: false);
  }

  /// Live Google Sign-In via Firebase Auth & Backend JWT Generation
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        state = state.copyWith(isLoading: false);
        return false; // User cancelled Google login dialog
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final String? firebaseIdToken = await userCredential.user?.getIdToken();

      if (firebaseIdToken == null) {
        throw Exception('Failed to obtain Firebase IdToken');
      }

      return await _authenticateWithBackendToken(firebaseIdToken);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Google Sign-In Error: ${e.toString()}');
      return false;
    }
  }

  /// Helper to authenticate with YoumeChat REST API using Firebase IdToken
  Future<bool> _authenticateWithBackendToken(String idToken) async {
    final res = await _apiClient.post('/auth/google-login', data: {
      'idToken': idToken,
    });

    if (res.statusCode == 200 && res.data['success']) {
      final data = res.data['data'];
      final user = UserModel.fromJson(data['user']);
      final accessToken = data['tokens']['accessToken'];
      final refreshToken = data['tokens']['refreshToken'];

      await _storageService.saveToken(accessToken);
      await _storageService.saveRefreshToken(refreshToken);

      _socketService.connect(accessToken);
      state = state.copyWith(user: user, isLoading: false);
      return true;
    } else {
      throw Exception(res.data['message'] ?? 'Authentication failed');
    }
  }

  /// Development Mock Authentication fallback
  Future<bool> loginWithGoogleMock(String mockUid) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      return await _authenticateWithBackendToken('mock_token_$mockUid');
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
    return false;
  }

  Future<void> logout() async {
    final refreshToken = await _storageService.getRefreshToken();
    if (refreshToken != null) {
      try {
        await _apiClient.post('/auth/logout', data: {'refreshToken': refreshToken});
      } catch (_) {}
    }
    try {
      await GoogleSignIn().signOut();
      await FirebaseAuth.instance.signOut();
    } catch (_) {}

    await _storageService.clearAll();
    _socketService.disconnect();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(storageServiceProvider);
  final socket = ref.watch(socketServiceProvider);
  return AuthNotifier(apiClient, storage, socket);
});
