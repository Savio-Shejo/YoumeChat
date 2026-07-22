class AppConstants {
  static const String appName = 'YoumeChat';
  static const String baseUrl = 'https://youmechat.onrender.com/api/v1';
  static const String socketUrl = 'https://youmechat.onrender.com';

  // Secure Storage Keys
  static const String tokenKey = 'youmechat_access_token';
  static const String refreshTokenKey = 'youmechat_refresh_token';
  static const String userKey = 'youmechat_user_profile';

  // Limits
  static const int defaultPaginationLimit = 20;
  static const int maxMessageLength = 4000;
}
