import { Camera, Object3D, Ray, Raycaster, Scene, Vector3 } from "three";

class TransformControls {

    camera: Camera;
    element: Element;
    raycaster: Raycaster;

    panning: Boolean = false;
    object: Object3D;

    objectHolded: Boolean = false;

    flatStartPosition: Vector3 = new Vector3(0, 0, 0);
    objectStartPosition: Vector3 = new Vector3(0, 0, 0);


    constructor(element: HTMLElement, object: Scene, camera: Camera) {

        this.object = object;
        this.camera = camera;
        this.element = element;

        this.raycaster = new Raycaster();

        this.element.addEventListener("contextmenu", event => event.preventDefault());
        this.element.addEventListener("mouseup", this.onMouseUp.bind(this), true);
        this.element.addEventListener("mousedown", this.onMouseDown.bind(this), true);
        this.element.addEventListener("mousemove", this.onMouseMove.bind(this), true);

        this.element.addEventListener("touchend", this.onTouchUp.bind(this), true);
        this.element.addEventListener("touchstart", this.onTouchDown.bind(this), true);
        this.element.addEventListener("touchmove", this.onTouchMove.bind(this), true);
    }

    getScreenCoordinates(event: any) {

        var screenCoordinates = { x: 0, y: 0 };
        if (event.clientX) {
            screenCoordinates.x = (event.clientX / window.innerWidth) * 2 - 1;
            screenCoordinates.y = - (event.clientY / window.innerHeight) * 2 + 1;
        } else if (event.touches && event.touches.length > 0) {
            screenCoordinates.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            screenCoordinates.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
        }

        return screenCoordinates;
    }

    onMouseUp(event: any) {
        this.objectHolded = false;
    }

    onMouseDown(event: any) {

        var screenCoordinates = this.getScreenCoordinates(event);
        this.hold(screenCoordinates);
    }

    onMouseMove(event: any) {

        console.log("mouse moving executed");
        if (!this.objectHolded)
            return;

        var screenCoordinates = this.getScreenCoordinates(event);
        this.move(screenCoordinates);
    }

    getRootObject() {

    }

    hold(screenCoordinates: any) {
        console.log("onmousedown is executed...");

        this.raycaster.setFromCamera(screenCoordinates, this.camera);

        var intersections = this.raycaster.intersectObjects([this.object], true);
        if (intersections && intersections.length > 0) {
            console.log("name ");
            this.objectHolded = true;
            this.objectStartPosition = this.object.position.clone();
        }

        this.flatStartPosition = this.getFlatPosition(screenCoordinates);

    }

    getFlatPosition(screenCoordinates: any) {
        this.raycaster.setFromCamera(screenCoordinates, this.camera);

        var ray = this.raycaster.ray;
        var origin = ray.origin.clone();
        var direction = ray.direction.clone();

        var flatRay = new Vector3(0, -1, 0);
        var cos = ray.direction.dot(flatRay)

        var flatDistance = origin.y * (1 / cos);
        var toPosition = direction.multiplyScalar(flatDistance);
        toPosition = origin.add(toPosition);

        console.log("toPosition in calculation " + toPosition);

        return toPosition;
    }

    move(screenCoordinates: any) {
        console.log("moving");

        this.raycaster.setFromCamera(screenCoordinates, this.camera);

        var floatPoition = this.getFlatPosition(screenCoordinates);
        var objectPosition = this.objectStartPosition.clone();

        var toPosition = floatPoition.sub(this.flatStartPosition);
        toPosition = objectPosition.add(toPosition);

        this.object.position.x = toPosition.x;
        this.object.position.y = toPosition.y;
        this.object.position.z = toPosition.z;

    }

    onTouchUp(event: any) {
        this.objectHolded = false;
    }

    onTouchDown(event: any) {
        console.log("touch down executed");
        var screenCoordinates = this.getScreenCoordinates(event);
        this.hold(screenCoordinates);
    }

    onTouchMove(event: any) {

        console.log("touch moving executed");
        if (!this.objectHolded)
            return;

        var screenCoordinates = this.getScreenCoordinates(event);
        this.move(screenCoordinates);
    }


    connect() {
    }

    disconnect() {

    }

    update() {

    }

    dispose() {

    }
}



export { TransformControls };