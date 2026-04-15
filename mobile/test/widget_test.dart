import 'package:flutter_test/flutter_test.dart';
import 'package:exam_app/main.dart';

void main() {
  testWidgets('App starts successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const ExamApp());
    expect(find.text('TestBharti'), findsOneWidget);
  });
}
