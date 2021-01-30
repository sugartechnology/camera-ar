import * as THREE from "three";
import { Scene } from "three";


class DeviceCameraControls {

    videoElement: HTMLVideoElement;
    root?: ShadowRoot | null;


    constructor(root?: ShadowRoot | null) {

        this.videoElement = document.createElement("video") as HTMLVideoElement;
        this.videoElement.style.zIndex = "-999";
        this.videoElement.style.width = window.innerWidth + "px";
        this.videoElement.style.height = window.innerHeight + "px";
        this.videoElement.style.position = "absolute";
        this.videoElement.style.top = "0px";
        this.videoElement.style.left = "0px";
        this.root = root;
    }


    requestCameraPermission() {
        var thizz = this;
        if (navigator.mediaDevices.getUserMedia) {

            var constraints = {
                video: {
                    facingMode: "environment",
                    width: window.innerHeight,
                    height: window.innerWidth
                },
                audio: false
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    var videoSettings = stream.getVideoTracks()[0].getSettings();
                    Object.assign(thizz.videoElement, {
                        srcObject: stream,
                        autoplay: true
                    });
                    thizz.root?.appendChild(thizz.videoElement);
                    thizz.videoElement.play();
                    thizz.videoElement.setAttribute("playsinline", "true");
                })
                .catch(function (err0r) {
                    console.log("Something went wrong! " + err0r);
                });
        }
    }

    connect() {
        this.requestCameraPermission();
    };

    disconnect() {

    };

    update() {

    }

    dispose() {

    }
}

export { DeviceCameraControls };