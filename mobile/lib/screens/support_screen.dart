import 'package:flutter/material.dart';
import '../constants/theme.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support / Contact Us')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.support_agent, size: 80, color: AppColors.navy),
            const SizedBox(height: 16),
            const Text('How can we help?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Reach out to us for any questions or issues.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 32),

            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.email, color: AppColors.navy),
                    title: const Text('Email Support'),
                    subtitle: const Text('support@testbharti.com'),
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.phone, color: AppColors.navy),
                    title: const Text('Phone Support'),
                    subtitle: const Text('+91-XXXXXXXXXX'),
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.chat, color: AppColors.navy),
                    title: const Text('WhatsApp'),
                    subtitle: const Text('Chat with us'),
                    onTap: () {},
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text('FAQs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            Card(
              child: ExpansionTile(
                title: const Text('How do I purchase a subscription?'),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: const Text('Go to the Profile tab and tap "My Subscriptions" to see available plans. Select a plan and complete payment via Razorpay.',
                      style: TextStyle(color: AppColors.textSecondary)),
                  ),
                ],
              ),
            ),
            Card(
              child: ExpansionTile(
                title: const Text('Can I retake an exam?'),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: const Text('Yes, you can retake exams unless the admin has set a maximum attempt limit. Check the exam details for attempt info.',
                      style: TextStyle(color: AppColors.textSecondary)),
                  ),
                ],
              ),
            ),
            Card(
              child: ExpansionTile(
                title: const Text('What happens if I switch apps during an exam?'),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: const Text('If anti-cheat is enabled, switching apps will be recorded as a violation. After the maximum number of violations, your exam may be auto-submitted.',
                      style: TextStyle(color: AppColors.textSecondary)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
