

import resources from "src/resources";


export class Txcard extends Entity {

	
	public id;
	public parent;
	public transform;
	public type ;
	public stage;
	public isSpell = 0;
	public manaCost = 31;
	public isSelected = 0;
	public card_sel_highlight;

	constructor( id, parent , transform_args, type , stage , highlight_material  ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id ;
		this.parent = parent;
		this.type = type;
		this.stage = stage;

		this.transform = new Transform( transform_args );

		let card_shape = new PlaneShape();
		card_shape.uvs = [
			0,0,
			1,0,
			1,1,
			0,1,

			0,0,
			1,0,
			1,1,
			0,1

		];

		let card_material = new Material();
		card_material.roughness = 1.0;
		card_material.specularIntensity = 0.0;
		card_material.albedoTexture = resources.textures[type];	
		//card_material.emissiveIntensity = 4.0;
		//card_material.disableLighting = true;


		this.transform.rotation.eulerAngles = new Vector3( 0 , 180, 0 );

		this.addComponent( this.transform );
		this.addComponent( card_shape );
		this.addComponent( card_material );


		let card_sel_highlight = new Entity();
		card_sel_highlight.setParent( parent );
        card_sel_highlight.addComponent( new BoxShape() );
        card_sel_highlight.addComponent( new Transform( {
            position: new Vector3( this.transform.position.x, this.transform.position.y  ,  0.08),
            scale   : new Vector3(1.1 , 1.1,  0.1)
        }));
        card_sel_highlight.addComponent( highlight_material );
        this.card_sel_highlight = card_sel_highlight;

        this.updateState();


		let _this = this;

		this.addComponent( 
			new OnPointerDown(
				(e) => {
					_this.stage.card_input_down( e , _this ) ;	
				},
				{
			      distance: 28,
			    }
			)
		);
		this.addComponent( 
			new OnPointerUp(
				(e) => {
					_this.stage.card_input_up( e , _this );	
				},
				{
			      distance: 28,
			    }
			)
		);


	}

	updateState() {
		if ( this.isSelected == 1 ) {
			this.turnon();
		} else {
			this.turnoff();
		}
	}

	toggle( ) {
		this.isSelected = 1 - this.isSelected ;
		this.updateState();
	}


	turnon() {
		this.isSelected = 1;
		this.card_sel_highlight.getComponent( BoxShape ).visible = true;
	}

	turnoff() {
		this.isSelected = 0;
		this.card_sel_highlight.getComponent( BoxShape ).visible = false;
	}
	hide() {
		this.getComponent( PlaneShape ).visible = false;
		this.card_sel_highlight.getComponent( BoxShape ).visible = false ;
		this.transform.position.y = -999;
		this.card_sel_highlight.getComponent( Transform ).position.y = -999;

	}
	show() {
		this.getComponent( PlaneShape ).visible = true;
		this.card_sel_highlight.getComponent( BoxShape ).visible = true ;
	}
	reposition( x,y ) {
		this.transform.position.x = x ;
        this.transform.position.y = y ;
        this.card_sel_highlight.getComponent( Transform ).position.x = x;
     	this.card_sel_highlight.getComponent( Transform ).position.y = y;
               
	}
}	


