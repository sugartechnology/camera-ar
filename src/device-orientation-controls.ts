import {
    Euler,
    EventDispatcher,
    MathUtils,
    Quaternion,
    Vector3
} from 'three';


const EPS = 0.000001;
class DeviceOrientationControls {

    scope: DeviceOrientationControls;
    changeEvent = { type: 'change' };
    object: any;
    enabled: boolean;
    deviceOrientation: any = {};
    screenOrientation = 0;
    alphaOffset = 0; // radians


    lastQuaternion = new Quaternion();

    constructor(object: any) {
        this.scope = this;

        this.object = object;
        this.object.rotation.reorder('YXZ');

        this.enabled = true;

        this.deviceOrientation = {};
        this.screenOrientation = 0;

        this.alphaOffset = 0;
    }

    onDeviceOrientationChangeEvent(event: any) {

        this.scope.deviceOrientation = event;
    }

    onScreenOrientationChangeEvent() {

        this.scope.screenOrientation = window.orientation ? window.orientation as number : 0;
    }

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    setObjectQuaternion(quaternion: Quaternion, alpha: number, beta: number, gamma: number, orient: number) {

        var zee = new Vector3(0, 0, 1);
        var euler = new Euler();
        var q0 = new Quaternion();
        var q1 = new Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        quaternion.setFromEuler(euler); // orient the device
        quaternion.multiply(q1); // camera looks out the back of the device, not the top
        quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation

        return quaternion;

    }

    connect() {

        this.onScreenOrientationChangeEvent(); // run once on load
        var scope = this.scope;
        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') {

            window.DeviceOrientationEvent.requestPermission().then(function (response) {

                if (response == 'granted') {

                    window.addEventListener('orientationchange', scope.onScreenOrientationChangeEvent.bind(scope), false);
                    window.addEventListener('deviceorientation', scope.onDeviceOrientationChangeEvent.bind(scope), false);

                }
            }).catch(function (error) {
                console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);

            });

        } else {

            window.addEventListener('orientationchange', scope.onScreenOrientationChangeEvent.bind(scope), false);
            window.addEventListener('deviceorientation', scope.onDeviceOrientationChangeEvent.bind(scope), false);
        }

        scope.enabled = true;
    };

    disconnect() {

        var scope = this.scope;
        window.removeEventListener('orientationchange', scope.onScreenOrientationChangeEvent.bind(scope), false);
        window.removeEventListener('deviceorientation', scope.onDeviceOrientationChangeEvent.bind(scope), false);

        scope.enabled = false;

    };

    update() {

        var scope = this.scope;

        if (scope.enabled === false) return;

        var device = scope.deviceOrientation;

        if (device) {

            var alpha = device.alpha ? MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0; // Z

            var beta = device.beta ? MathUtils.degToRad(device.beta) : 0; // X'

            var gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0; // Y''

            var orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0; // O

            var objectNewQuaternion = this.setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);

            if (8 * (1 - this.lastQuaternion.dot(objectNewQuaternion)) > EPS) {

                this.lastQuaternion.copy(objectNewQuaternion);
                //const event = new Event('change');

            }
        }
    }

    dispose() {
        var scope = this.scope;
        scope.disconnect();
    }
}


export { DeviceOrientationControls };