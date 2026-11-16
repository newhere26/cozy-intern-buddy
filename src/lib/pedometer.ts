/**
 * Step counting from the phone's motion sensor.
 *
 * Browsers cannot read the phone's built-in step history (Apple Health / Google Fit /
 * Health Connect need a native app). What a web app CAN do is ask for permission to use
 * the motion sensor and count steps itself while WithYou is open. That is what this does.
 */
import { bumpSteps, getState, setState, todayKey } from "./store";

export type PermissionResult = "granted" | "denied" | "unsupported";

type DME = typeof DeviceMotionEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function motionSupported(): boolean {
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}

/** Must be called from a tap/click so the phone is allowed to show its permission prompt. */
export async function requestMotionPermission(): Promise<PermissionResult> {
  if (!motionSupported()) return "unsupported";
  const dme = DeviceMotionEvent as DME;
  try {
    if (typeof dme.requestPermission === "function") {
      // iOS Safari: shows the system "Allow motion & orientation access" prompt.
      return (await dme.requestPermission()) === "granted" ? "granted" : "denied";
    }
    // Android Chrome / others: no prompt API, so listen briefly to see if real data arrives.
    return await new Promise<PermissionResult>((resolve) => {
      let got = false;
      const probe = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity;
        if (a && (a.x !== null || a.y !== null || a.z !== null)) got = true;
      };
      window.addEventListener("devicemotion", probe);
      setTimeout(() => {
        window.removeEventListener("devicemotion", probe);
        resolve(got ? "granted" : "unsupported");
      }, 1200);
    });
  } catch {
    return "denied";
  }
}

let stop: (() => void) | null = null;

/** Start counting steps into today's total. Safe to call more than once. */
export function startStepCounting() {
  if (stop || !motionSupported()) return;
  let smooth = 9.8;
  let lastStepAt = 0;
  let prev = 0;
  let rising = false;
  let pending = 0;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    flushTimer = null;
    if (pending > 0) {
      bumpSteps(todayKey(), pending);
      pending = 0;
    }
  };

  const onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null || a.y === null || a.z === null) return;
    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    smooth = smooth * 0.8 + mag * 0.2;
    const now = Date.now();
    // a step is a peak above ~gravity+1.6 m/s², no more than ~3.3 per second
    if (smooth > prev) rising = true;
    else if (rising && smooth < prev) {
      rising = false;
      if (prev > 11.4 && now - lastStepAt > 300) {
        lastStepAt = now;
        pending += 1;
        if (!flushTimer) flushTimer = setTimeout(flush, 2000);
      }
    }
    prev = smooth;
  };

  window.addEventListener("devicemotion", onMotion);
  stop = () => {
    window.removeEventListener("devicemotion", onMotion);
    if (flushTimer) clearTimeout(flushTimer);
    flush();
    stop = null;
  };
}

export function stopStepCounting() {
  stop?.();
}

export function setStepTracking(on: boolean) {
  setState({ stepTracking: on });
  if (on) startStepCounting();
  else stopStepCounting();
}

/** Resume counting on app start if the user had already allowed it. */
export function resumeStepCountingIfEnabled() {
  if (getState().stepTracking) startStepCounting();
}
