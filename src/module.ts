import * as THREE from "three";
import { Camera, Constructor, Mesh, Vector3, WebGLRenderTarget } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DeviceCameraControls } from "./device-camera-controls";
import { DeviceOrientationControls } from "./device-orientation-controls";
import { DevicePermissionUI } from "./device-permission-ui";
import { TransformControls } from "./transform-controls";



interface ModuleInterface {
}


export default class Module extends HTMLElement {

    rendererElement: HTMLElement;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;


    deviceOrientationControls: any = { update: function () { } };
    deviceCameraControls: any = { update: function () { } };
    transformControls: any = { update: function () { } };

    constructor() {
        super();


        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.set(0, 1.5, 5);
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();

        this.scene = new THREE.Scene();
        this.calculateEnvScene();

        var thizz = this;
        const loader = new GLTFLoader();
        loader.load('https://s3.eu-central-1.amazonaws.com/cdn.sugar/Motto/eminonu_yagli_boya_tablo_150x50_R2.glb',
            function (gltf) {

                gltf.scene.modelViewMatrix.setPosition(new THREE.Vector3(0, 0, 0));
                gltf.scene.updateWorldMatrix(true, true);
                thizz.scene.add(gltf.scene);
                thizz.scene.autoUpdate = true;

                thizz.render();
            },
            undefined,
            function (error) {
                console.error(error);
            });


        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.rendererElement = this.renderer.domElement;
        this.rendererElement.style.position = "absolute";
        this.rendererElement.style.top = "0px";
        this.rendererElement.style.left = "0px";

        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.appendChild(this.rendererElement);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.connect();
        this.requestPermissions();
        this.render();
    }



    connect() {

    }

    render() {
        requestAnimationFrame(this.render.bind(this));

        (this.deviceOrientationControls as DeviceOrientationControls).update();
        (this.deviceCameraControls as DeviceCameraControls).update();
        (this.transformControls as TransformControls).update();

        this.updateEnvironment();
        this.renderer.setClearColor(0xffffff, 0)
        this.renderer.render(this.scene, this.camera);
    }

    requestPermissions() {
        var deviceRequestPermission = new DevicePermissionUI();
        var thizz = this;
        var camera = this.camera;
        deviceRequestPermission.showDeviceOrientation(function () {
            thizz.deviceOrientationControls = new DeviceOrientationControls(camera);
            (thizz.deviceOrientationControls as DeviceOrientationControls).connect();

            thizz.deviceCameraControls = new DeviceCameraControls(thizz.shadowRoot);
            (thizz.deviceCameraControls as DeviceCameraControls).connect();

            thizz.transformControls = new TransformControls(thizz.rendererElement, thizz.scene, thizz.camera);

        });
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    generatedCubeRenderTarget?: WebGLRenderTarget;

    calculateEnvScene() {
        const envScene = new THREE.Scene();

        const geometry = new THREE.BoxGeometry();
        //geometry.deleteAttribute('uv');
        const roomMaterial = new THREE.MeshStandardMaterial({ metalness: 0, side: THREE.BackSide });
        const room = new THREE.Mesh(geometry, roomMaterial);
        room.scale.setScalar(10);
        envScene.add(room);

        const mainLight = new THREE.PointLight(0xffffff, 1, 0, 2);
        envScene.add(mainLight);

        const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, emissive: 0xffffff, emissiveIntensity: 10 });

        const light1 = new THREE.Mesh(geometry, lightMaterial);
        light1.material.color.setHex(0xff0000);
        light1.position.set(- 5, 2, 0);
        light1.scale.set(0.1, 1, 1);
        envScene.add(light1);

        const light2 = new THREE.Mesh(geometry, lightMaterial.clone());
        light2.material.color.setHex(0x00ff00);
        light2.position.set(0, 5, 0);
        light2.scale.set(1, 0.1, 1);
        envScene.add(light2);

        const light3 = new THREE.Mesh(geometry, lightMaterial.clone());
        light3.material.color.setHex(0x0000ff);
        light3.position.set(2, 1, 5);
        light3.scale.set(1.5, 2, 0.1);
        envScene.add(light3);

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileCubemapShader();
        this.generatedCubeRenderTarget = pmremGenerator.fromScene(envScene, 0.04);

        return envScene;

    }

    updateEnvironment() {
        if (!this.generatedCubeRenderTarget)
            return;

        var scope = this;
        this.scene.traverse(function (object) {
            if (object instanceof Mesh) {

                var mesh = (object as Mesh);
                var material = mesh.material as THREE.MeshStandardMaterial;
                material.envMap = scope.generatedCubeRenderTarget!.texture;
                mesh.material = material;

            }
        });
    }

}

export const ModuleConstructor = <T extends Constructor<Module>>(m: T):
    Constructor<ModuleInterface> & T => {

    class ModuleConstructorInst extends m {
        constructor(...args: Array<any>) {
            super(...args);
            console.log("naber");
        }
    }
    return ModuleConstructorInst;
}

export const ModuleElement = ModuleConstructor(Module);

export type ModuleElement = InstanceType<typeof ModuleElement>;

customElements.define('module-element', ModuleElement);

declare global {
    interface HTMLElementTagNameMap {
        'module-element': ModuleElement;
    }
}