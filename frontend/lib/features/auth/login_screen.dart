import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _usernameController = TextEditingController(text: 'alex_dev');

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.darkBackground, Color(0xFF1E1B4B)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.forum_rounded,
                      size: 64,
                      color: AppColors.primaryLight,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'YoumeChat',
                    style: GoogleFonts.outfit(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Enterprise Real-Time Messaging Platform',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 48),

                  if (authState.error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.errorRed.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        authState.error!,
                        style: const TextStyle(color: AppColors.errorRed),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Primary Action: Live Google Sign-In via Firebase
                  ElevatedButton.icon(
                    onPressed: authState.isLoading
                        ? null
                        : () async {
                            await ref.read(authProvider.notifier).signInWithGoogle();
                          },
                    icon: authState.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Image.network(
                            'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                            height: 22,
                            errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 28),
                          ),
                    label: Text(
                      authState.isLoading ? 'Authenticating...' : 'Sign in with Google',
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Divider
                  Row(
                    children: [
                      const Expanded(child: Divider(color: AppColors.darkCard)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'OR LOCAL DEV TEST',
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Expanded(child: Divider(color: AppColors.darkCard)),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Dev handle login field
                  TextField(
                    controller: _usernameController,
                    decoration: const InputDecoration(
                      hintText: 'Enter Handle for Local Dev Mock',
                      prefixIcon: Icon(Icons.developer_mode, color: AppColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 12),

                  TextButton.icon(
                    onPressed: authState.isLoading
                        ? null
                        : () async {
                            final uid = _usernameController.text.trim();
                            if (uid.isNotEmpty) {
                              await ref.read(authProvider.notifier).loginWithGoogleMock(uid);
                            }
                          },
                    icon: const Icon(Icons.login, size: 18),
                    label: const Text('Login with Dev Handle'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
