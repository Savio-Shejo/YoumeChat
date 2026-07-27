import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Firebase options for YoumeChat.
///
/// This mirrors the Android configuration from `google-services.json` so the
/// app can initialize Firebase explicitly and consistently.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'DefaultFirebaseOptions are not configured for web in this project.',
      );
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions are only configured for Android in this project.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported on this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAaMilzHIV-hus6geMDn2W3SoWxE2etD4w',
    appId: '1:110812357240:android:c1018c3f4a9005d3a4038d',
    messagingSenderId: '110812357240',
    projectId: 'appmeow-71aba',
    storageBucket: 'appmeow-71aba.firebasestorage.app',
  );
}
