

import resources from "src/resources";


export class Txcard extends Entity {

	
	public id;
	public parent;
	public transform;
	
	public type ;
	public stage;
	
	constructor( id, parent , transform_args, type , stage ) {

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
			1,0,
			0,0,
			0,1,
			1,1,

			1,0,
			0,0,
			0,1,
			1,1,		
		];

		let card_material = new Material();
		card_material.roughness = 1.0;
		card_material.specularIntensity = 0.0;
		card_material.albedoTexture = resources.textures[type];	
		card_material.emissiveIntensity = 4.0;
		//card_material.disableLighting = true;

		this.transform.rotation.eulerAngles = new Vector3( 0 , 0, 0 );

		this.addComponent( this.transform );
		this.addComponent( card_shape );
		this.addComponent( card_material );

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
}