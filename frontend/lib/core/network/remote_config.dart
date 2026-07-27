import 'package:dio/dio.dart';

/// Fetches the live backend URL from GitHub remote config.
/// Update app_config.json on GitHub to change the URL without rebuilding the APK.
class RemoteConfig {
  static const String _configUrl =
      'https://raw.githubusercontent.com/Savio-Shejo/YoumeChat/main/app_config.json';

  static String? _backendUrl;

  static String get backendUrl =>
      _backendUrl ?? 'https://manga-investors-shirts-thereby.trycloudflare.com';

  static Future<void> fetch() async {
    try {
      final dio = Dio(BaseOptions(
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 5),
      ));
      final response = await dio.get(_configUrl);
      if (response.statusCode == 200 && response.data is Map) {
        final url = response.data['backendUrl'] as String?;
        if (url != null && url.isNotEmpty) {
          _backendUrl = url;
        }
      }
    } catch (_) {
      // Silently fall back to default hardcoded URL
    }
  }
}
