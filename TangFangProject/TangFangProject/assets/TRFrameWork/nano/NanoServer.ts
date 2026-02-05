import nano, { NanoInitParams } from "./nano";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NanoServer {

    private static instance: NanoServer = null;
    private _nano: nano;
    private _initParams: NanoInitParams = null;
    private _nanoWS: WebSocket = null;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new NanoServer();
            this.instance.doInit();
        }
        return this.instance;
    }


    private doInit() {
        cc.game.on(cc.game.EVENT_SHOW, function () {
            NanoServer.getInstance().checkReconnect();
        }, this);
    }

    public async init(host: string, port: number, ws: string): Promise<void> {
        this._nano = new nano();
        this._initParams = {
            host: host,
            port: port,
            ws: ws,
            path: "/ws",
            reconnect: true
        }
        await new Promise((resolve, reject) => {
            NanoServer.getInstance()._nano.init(this._initParams, (ws) => {
                console.log("server connected...")
                this._nanoWS = ws;
                resolve(true); //连接成功
            })
        });

        this._nano.on("disconnect", this.onNanoDisconnect, this);
        this._nano.on("reconnect", this.onNanoReconnect, this);

    }

    private onNanoDisconnect() {
        console.log("server disconnected...")
    }

    private onNanoReconnect() {
        console.log("server reconnected...")
    }

    private checkReconnect() {
        if (this._nanoWS && this._nanoWS.readyState == WebSocket.CLOSED) {
            NanoServer.getInstance()._nano.init(this._initParams, (ws) => {
                console.log("server connected...")
                this._nanoWS = ws;
            })
        }
    }

    public listen(route, callback) {
        if (!this._nano) {
            console.error("nano server not init at listen")
            return
        }
        this._nano.on(route, () => {
            callback();
        })
    }

    public request(route, msg, callback: Function) {
        if (!this._nano || this._nanoWS.readyState == WebSocket.CLOSED) {
            console.error("nano server not init at request")
            return
        }
        this._nano.request(route, msg, (response) => {
            if (response.success) {
                callback(response)
            } else {
                console.log("response error:", response)
            }
        })
    }
    public nofity(route, msg) {
        if (!this._nano || this._nanoWS.readyState == WebSocket.CLOSED) {
            console.error("nano server not init at nofity")
            return
        }
        this._nano.notify(route, msg)
    }
    public disconnect() {
        if (!this._nano) {
            console.error("nano server not init at disconnect")
            return
        }
        this._nano.disconnect();
    }
}