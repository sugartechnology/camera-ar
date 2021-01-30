export class DevicePermissionUI {

    onOk: () => void;
    container: HTMLDivElement;

    constructor() {
        this.container = document.createElement("div") as HTMLDivElement;
        this.container.style.display = "none";
        this.container.style.position = "absolute";
        this.container.style.width = "500px";
        this.container.style.top = "0px";
        this.container.style.height = "250px";

        var okButton = document.createElement("button") as HTMLButtonElement;
        okButton.textContent = "Start";
        okButton.addEventListener("click", this.onOKButtonPressed.bind(this))

        this.container.appendChild(okButton);
        document.body.appendChild(this.container);

        this.onOk = function () { };
    }

    async showDeviceOrientation(onok: () => void) {
        this.onOk = onok;
        this.container.style.display = "block";
    }

    onOKButtonPressed() {
        this.onOk();
        this.container.style.display = "none";
    }
}