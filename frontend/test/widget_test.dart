import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:youmechat/core/storage/storage_service.dart';
import 'package:youmechat/main.dart';
import 'package:youmechat/providers/auth_provider.dart';

class FakeStorageService extends StorageService {
  @override
  Future<void> saveToken(String token) async {}

  @override
  Future<String?> getToken() async => null;

  @override
  Future<void> saveRefreshToken(String token) async {}

  @override
  Future<String?> getRefreshToken() async => null;

  @override
  Future<void> clearAll() async {}
}

void main() {
  testWidgets('YoumeChat app builds login flow', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          storageServiceProvider.overrideWithValue(FakeStorageService()),
        ],
        child: const YoumeChatApp(),
      ),
    );
    await tester.pump();

    expect(find.text('YoumeChat'), findsOneWidget);
    expect(find.text('Sign in with Google'), findsOneWidget);
  });
}
