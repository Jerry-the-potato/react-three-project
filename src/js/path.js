class PathConfig{
    static linear = -1;
    static easein = 0;
    static easeout = 2;

    static leapLinear = 0;
    static leapEasein = -2;
    static leapEaseout = 2;
    
    static resetPath(linear = 1, easein = 0, easeout = 0){
        if(linear + easein + easeout != 1) console.warn("PathConfig.resetPath: sum of parameter is recommend to be 1");
        PathConfig.linear = linear;
        PathConfig.easein = easein;
        PathConfig.easeout = easeout;
    }

    static resetLeap(linear = 0, easein = 0, easeout = 0){
        PathConfig.leapLinear = linear;
        PathConfig.leapEasein = easein;
        PathConfig.leapEaseout = easeout;
    }

    getPath(){
        return [PathConfig.linear, PathConfig.easein, PathConfig.easeout];
    }
    getLeap(){
        return [PathConfig.leapLinear, PathConfig.leapEasein, PathConfig.leapEaseout];
    }
}
class Path extends PathConfig{
    constructor(x = 0, y = 0, z = 0, callback){
        super();
        this.pointX = x;
        this.pointY = y;
        this.pointZ = z;

        this.originX = x;
        this.originY = y;
        this.originZ = z;

        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        
        this.period = 90;
        this.timer = 0;
        this.ID = 0;
        if(callback)
        this.callback = () => callback(this.pointX, this.pointY, this.pointZ);
    }
    newTarget = function(targetX, targetY, targetZ, frames){
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetZ = targetZ;
        this.originX = this.pointX;
        this.originY = this.pointY;
        this.originZ = this.pointZ;
        this.timer = (frames >= 10) ? frames : 0;
        this.period = (frames >= 10) ? frames : 1;
        cancelAnimationFrame(this.ID);
        this.ID = requestAnimationFrame(this.nextFrame);
    };
    resetTo = function(x = x, y = y){
        this.pointX = x;
        this.pointY = y;
        this.pointZ = z;
        this.timer = 0;
    };
    registerDispose(callback){
        this.dispose = callback;
    }
    getPath(){
        return super.getPath();
    }
    getLeap(){
        return super.getLeap();
    }
    nextFrame = function(){
        if(this.timer <= 0){
            this.pointX = this.targetX;
            this.pointY = this.targetY;
            this.pointZ = this.targetZ;
            this.callback();
            this.dispose?.();
            this.z = 0;
            this.timer = 0;
            return;
        }

        this.timer--;
        const dX = this.targetX - this.originX;
        const dY = this.targetY - this.originY;
        const dZ = this.targetZ - this.originZ;
        const t = this.timer;
        const p = this.period;
        const linear = 1/p;
        const easeout = Math.pow((t+1)/p, 2) - Math.pow((t)/p, 2);
        const easein = Math.pow(1 - (t-1)/p, 2) - Math.pow(1 - t/p, 2);
        const [a, b, c] = this.getPath();
        const [d, e, f] = this.getLeap();
        this.pointX+= (a * linear + b * easein + c * easeout) * dX;
        this.pointY+= (a * linear + b * easein + c * easeout) * dY;
        this.pointZ+= (a * linear + b * easein + c * easeout) * dZ;
        this.callback();

        this.ID = requestAnimationFrame(this.nextFrame);  
    }.bind(this);
}

export { Path };
export { PathConfig };