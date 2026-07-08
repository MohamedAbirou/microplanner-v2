import { Controller, Post, Request } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';

@Controller('notifications/push')
export class PushNotificationController {
  constructor(private readonly push: PushNotificationService) {}

  /**
   * Send a test push to the caller's registered devices. Verifies the pipeline
   * end-to-end (VAPID config → subscription → service worker).
   */
  @Post('test')
  async sendTest(@Request() req: any) {
    if (!this.push.isConfigured()) {
      return { sent: 0, configured: false, message: 'Push not configured on this server' };
    }
    const result = await this.push.sendToUser(
      req.user.id,
      {
        title: 'MicroPlanner',
        body: 'Push notifications are working 🎉',
        url: '/today',
        icon: '/logo-icon.svg',
        tag: 'test-push',
      },
      { eventType: 'test', bypassQuietHours: true },
    );
    return { ...result, configured: true };
  }
}
