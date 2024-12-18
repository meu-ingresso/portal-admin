export default class Debounce {
    callback: any;
    delay: number;
    timer: NodeJS.Timeout | null;
    
    constructor(callback, delay = 300) {
      this.callback = callback;
      this.delay = delay;
      this.timer = null;
    }
  
    execute(...args) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.callback(...args);
      }, this.delay);
    }
  }
  