import { Device, IDevice } from '../models/Device';

export class DeviceRepository {
  public async registerDevice(deviceData: Partial<IDevice>): Promise<IDevice> {
    return Device.findOneAndUpdate(
      { fcmToken: deviceData.fcmToken },
      { ...deviceData, lastActive: new Date() },
      { upsert: true, new: true }
    ).exec();
  }

  public async getUserTokens(userId: string): Promise<string[]> {
    const devices = await Device.find({ user: userId }).select('fcmToken').exec();
    return devices.map((d) => d.fcmToken);
  }

  public async removeToken(fcmToken: string): Promise<boolean> {
    const res = await Device.deleteOne({ fcmToken }).exec();
    return (res.deletedCount || 0) > 0;
  }
}

export const deviceRepository = new DeviceRepository();
