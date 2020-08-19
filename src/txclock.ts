




import resources from "src/resources";


export class Txclock extends Entity {

	
	public id;
	public parent;

	public transform;
	public visible = 1;

	public frame_index = 0;
	public tick = 0;
	public tick_per_frame = 3;


	constructor( id, parent , transform_args  , shared_material   ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id;
		this.parent = parent;

		this.transform =  new Transform( transform_args );

		this.transform.scale.setAll( 0.2 );


		this.addComponent( this.transform );
		this.addComponent( new PlaneShape() );
		this.addComponent( shared_material );

		this.getComponent( PlaneShape ).uvs = this.getUV_coord();
		this.addComponent( new Billboard() );

		this.tick = this.tick_per_frame;
		this.frame_index = 0;

	}


	public frame_index_to_frame_x = [ 0 , 1, 2, 3,    0, 1, 2, 3,   0, 1, 2, 3 , 0 , 1, 2, 3 ];
	public frame_index_to_frame_y = [ 3 , 3, 3, 3,    2, 2, 2, 2,   1, 1, 1, 1 , 0 , 0 , 0, 0 ];


	//-------
	getUV_coord() {

		let frame_x = this.frame_index_to_frame_x[ this.frame_index ];
		let frame_y = this.frame_index_to_frame_y[ this.frame_index ];

		let arr = [
			frame_x	/4				,	frame_y /4,
			(frame_x + 1 )/4		,	frame_y /4,
			(frame_x + 1 )/4		,	(frame_y + 1 )/4,
			frame_x	/4				,	(frame_y + 1 )/4 ,
			frame_x	/4				,	frame_y /4,
			(frame_x + 1 )/4		,	frame_y /4,
			(frame_x + 1 )/4		,	(frame_y + 1 )/4,
			frame_x	/4				,	(frame_y + 1 )/4 
		]

		return arr;
	}




	//----------
	update(dt) {

		if ( this.visible == 1 ) {
			
			if ( this.tick > 0 ) {

				this.tick -= 1;
				
				

			} else {
				
				
				if ( this.frame_index + 1 >= 12 ) {
						
					this.hide();

				} else { 

					this.frame_index = ( this.frame_index + 1 ) % 16;
					this.getComponent( PlaneShape ).uvs = this.getUV_coord();
					this.tick = this.tick_per_frame;
				}
			}

		} else {
		
			this.tick += 1;
			if ( this.tick > 100 ) {
				this.parent.removeClock( this );
			}
		}
		
	}


	//----
	hide() {
		this.visible = 0;
		this.tick = 0;
		this.getComponent(Transform).position.y = -999;
	}
}




