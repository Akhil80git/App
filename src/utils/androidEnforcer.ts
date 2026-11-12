/**
 * Android Real Enforcement & Device Integration Engine
 * Provides actual Android OS level blocking mechanisms:
 * 1. MacroDroid / Tasker Accessibility Watchdog (Kills app instantly on open)
 * 2. ADB / Shizuku Package Freezer (pm disable-user --user 0 <pkg>)
 * 3. WebUSB / WebADB browser direct connection
 */

export interface EnforcementResult {
  success: boolean;
  message: string;
  command?: string;
}

export class AndroidEnforcementEngine {
  // Check if browser supports WebUSB for direct ADB connection
  isWebUSBSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  // Generate OS level freeze command for an Android package
  getFreezeCommand(packageName: string): string {
    return `adb shell pm disable-user --user 0 ${packageName}`;
  }

  // Generate OS level unfreeze command
  getUnfreezeCommand(packageName: string): string {
    return `adb shell pm enable ${packageName}`;
  }

  // Generate Shizuku / Termux one-liner command for on-device terminal
  getShizukuCommand(packageName: string, isLock: boolean): string {
    if (isLock) {
      return `shizuku pm disable-user --user 0 ${packageName} || su -c pm disable-user --user 0 ${packageName}`;
    }
    return `shizuku pm enable ${packageName} || su -c pm enable ${packageName}`;
  }

  // Generate ready-to-import MacroDroid configuration file
  // This macro listens for "App Launched" and immediately invokes "Kill / Press Home"
  generateMacroDroidConfig(lockedPackages: string[]): string {
    const macro = {
      macro_version: 1.0,
      name: "AppLocker Pro - Real App Blocker",
      description: "Automatically intercepts and closes blocked Android apps immediately when clicked on home screen.",
      triggers: lockedPackages.map((pkg) => ({
        type: "application_launched",
        package_name: pkg,
        event: "opened",
      })),
      actions: [
        {
          type: "kill_background_process",
          description: "Immediately force-stop opened app",
        },
        {
          type: "press_navigation_button",
          button: "home",
          description: "Return user instantly to Home Screen",
        },
        {
          type: "display_notification",
          title: "AppLocker Pro: App Blocked!",
          message: "This app is locked by AppLocker PWA focus timer.",
          priority: 2,
        },
      ],
      constraints: [
        {
          type: "variable_check",
          variable: "AppLocker_Lock_Active",
          expected: "true",
        },
      ],
    };
    return JSON.stringify(macro, null, 2);
  }

  // Attempt WebUSB connection to Android phone
  async requestDeviceConnection(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.isWebUSBSupported()) {
      return {
        success: false,
        error: "WebUSB is not supported in this browser. Please use Chrome on Android with OTG or use the MacroDroid/Shizuku companion.",
      };
    }

    try {
      // Request USB device with standard Android ADB vendor IDs
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x18d1 }, // Google / Android standard
          { vendorId: 0x04e8 }, // Samsung
          { vendorId: 0x2717 }, // Xiaomi
          { vendorId: 0x12d1 }, // Huawei
          { vendorId: 0x2a70 }, // OnePlus
          { vendorId: 0x22d9 }, // Oppo / Realme
          { vendorId: 0x0bb4 }, // HTC
          { vendorId: 0x05c6 }, // Qualcomm
          { vendorId: 0x2e04 }, // Nothing
        ],
      });

      await device.open();
      return {
        success: true,
        deviceName: `${device.manufacturerName || 'Android'} ${device.productName || 'Device'}`,
      };
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return { success: false, error: 'No device selected or connection cancelled.' };
      }
      return { success: false, error: err.message || 'Failed to connect via WebUSB' };
    }
  }
}

export const androidEnforcer = new AndroidEnforcementEngine();
