



import resources from "src/resources";
import { Utils}     from "src/utils";


//----------------------------
// UpdateSystem callback 
export class UpdateSystem implements ISystem {

	public tables;
    public camera;
    public ui_2d_text;

    constructor( tables, camera ) {

    	this.camera = camera;
        this.tables = tables;

        let ui_2d_canvas     = new UICanvas();
        ui_2d_canvas.height = 4000;

        this.ui_2d_text      = new UIText( ui_2d_canvas );
        this.ui_2d_text.fontSize = 14;
        this.ui_2d_text.value    = "";
        this.ui_2d_text.vAlign = "top";
        this.ui_2d_text.vTextAlign = "top";
        this.ui_2d_text.lineCount = 100;
        this.ui_2d_text.positionX = -400;
        
    }

    //Executed ths function on every frame
    update(dt: number) {
        
        this.ui_2d_text.value = this.tables[0].status_msg;
        this.tables[0].update( dt  );

    }
}
