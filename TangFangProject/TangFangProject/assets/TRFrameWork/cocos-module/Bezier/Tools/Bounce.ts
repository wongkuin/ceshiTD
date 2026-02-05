export class Bounce {
 
    public static EaseIn(time: number, duration: number, unusedOvershootOrAmplitude: number, unusedPeriod: number) {
        return 1 - this.EaseOut(duration - time, duration, -1, -1);
    }

    
    public static EaseOut(time: number, duration: number, unusedOvershootOrAmplitude: number, unusedPeriod: number) {
        if ((time /= duration) < 0.363636374) {
            return 7.5625 * time * time;
        }
        if (time < 0.727272749) {
            return 7.5625 * (time -= 0.545454562) * time + 0.75;
        }
        if (time < 0.909090936) {
            return 7.5625 * (time -= 0.8181818) * time + 0.9375;
        }
        return 7.5625 * (time -= 21 / 22) * time + 63 / 64;
    }

  
    public static EaseInOut(time: number, duration: number, unusedOvershootOrAmplitude: number, unusedPeriod: number) {
        if (time < duration * 0.5) {
            return this.EaseIn(time * 2, duration, -1, -1) * 0.5;
        }
        return this.EaseOut(time * 2 - duration, duration, -1, -1) * 0.5 + 0.5;
    }
}
