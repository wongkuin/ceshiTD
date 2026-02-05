export interface position {
    left:number;
    top:number;

}

export class GridGamePanelOptions implements GridGamePanelOptionsBD {
    gridCount: string;
    size:string;
    //position:position
}

export default class GridGameBD implements GridGamePanelInterface {
    private GGPanel: GridGamePanelBD;
    private env: BDAPI = window["tt"];
    private isInPlay: boolean = false;

    public play(position?:cc.Vec2) {
        try {
            if (this.isInPlay) return;
            if (this.GGPanel && this.GGPanel.destroy) {
                this.GGPanel.destroy()
                    //.then(() => {
                        this.GGPanel = null;
                        this.play();
                   // })
            }else {
                this.isInPlay =true;
                let option = new GridGamePanelOptions();
                option.gridCount = "one";
                option.size = "large";
                // if(position){
                //     option.position = {
                //         left: position.x,
                //         top:position.y,
                //     }
                //     console.log("1111111111111:",option.position );
                // }
                
                // option.position.left = 800;
                // option.position.top = 1000;
                console.log("互推组件参数:",option);
                this.GGPanel = this.env.createGridGamePanel(option);
                if (!this.GGPanel) {
                    return;
                }
                this.GGPanel.show().then(() => {
                    console.log("游戏互推组件展示成功");
                    this.isInPlay =false;
                }).catch (()=>{
                    console.error("创建游戏推荐组件失败", );
                    this.isInPlay =false;
                  }) 
            }
        } catch (error) {
            console.log("游戏互推组件展示失败·");
            this.isInPlay =false;

        }
    }

}
