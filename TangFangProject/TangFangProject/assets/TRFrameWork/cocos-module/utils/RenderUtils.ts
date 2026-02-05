/**
 * 渲染工具
 */
export default class RenderUtils {
    /**
     * 获取像素数据
     * @param node 节点
     * @param flipY 垂直翻转数据
     */
    public static getPixelsData(node: cc.Node, flipY: boolean = true): Uint8Array {
        if (!cc.isValid(node)) return null;

        const width = Math.floor(node.width);
        const height = Math.floor(node.height);

        const cameraNode = new cc.Node();
        cameraNode.parent = node;
        const camera = cameraNode.addComponent(cc.Camera);
        camera.clearFlags |= cc.Camera.ClearFlags.COLOR;
        camera.backgroundColor = cc.color(0, 0, 0, 0);
        camera.zoomRatio = cc.winSize.height / height;

        const renderTexture = new cc.RenderTexture();
        renderTexture.initWithSize(width, height, cc.RenderTexture.DepthStencilFormat.RB_FMT_S8);
        camera.targetTexture = renderTexture;
        camera.render(node);

        const pixelsData = renderTexture.readPixels();

        renderTexture.destroy();
        cameraNode.destroy();

        if (flipY) {
            const length = pixelsData.length;
            const lineWidth = width * 4;
            const data = new Uint8Array(length);
            for (let i = 0, j = length - lineWidth; i < length; i += lineWidth, j -= lineWidth) {
                for (let k = 0; k < lineWidth; k++) {
                    data[i + k] = pixelsData[j + k];
                }
            }
            return data;
        }
        return pixelsData;
    }

    /**获取像素 */
    public static getPixel(node: cc.Node, point: cc.Vec2, pixelsData: Uint8Array, flipY: boolean = true): cc.Color {
        const x = point.x + node.anchorX * node.width;
        const y = flipY ? -(point.y - node.anchorY * node.height) : point.y + node.anchorY * node.height;

        const index = (node.width * 4 * Math.floor(y)) + (4 * Math.floor(x));

        return cc.color(pixelsData[index], pixelsData[index + 1], pixelsData[index + 2], pixelsData[index + 3]);
    }
}